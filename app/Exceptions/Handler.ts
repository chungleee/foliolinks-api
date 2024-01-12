import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from "@ioc:Adonis/Core/Logger";
import HttpExceptionHandler from "@ioc:Adonis/Core/HttpExceptionHandler";
import { Prisma } from "@prisma/client";

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger);
  }

  async handle(error: any, { response }: HttpContextContract) {
    console.log("ERROR: ", error);

    if (error.name === "ValidationException") {
      return response.status(200).json({ error: error.messages.errors });
    }

    if (error.name === "AuthApiError") {
      if (error.message.includes("invalid claim")) {
        return response.status(error.status).json({ error: "Please log in" });
      }

      if (error.message.includes("invalid JWT")) {
        return response
          .status(error.status)
          .json({ error: "Invalid credentials" });
      }

      return response.status(error.status).json({ error: error.message });
    }

    if (error.message === "Unauthorized") {
      return response.status(403).json({ error: "Invalid credentials" });
    }

    if (error.message === "ProfileDeletionError") {
      return response.status(400).json({
        error: "Cannot find user profile",
      });
    }
    if (error.message === "ProfileDoesNotExist") {
      return response.status(404).json({
        error: "User profile does not exist",
      });
    }

    // MEMBERSHIP ERRORS
    // if (error.message === "FreeTierLimit") {
    //   return response.status(200).json({
    //     error: "You have exceeded the number of projects allowed",
    //   });
    // }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // PRISMA ERRORS

      switch (error.code) {
        case "P2002":
          return response.status(400).json({
            error: "User profile already exist",
          });
        case "P2025":
          return response.status(404).json({
            error: "User profile does not exist",
          });
        default:
          return response.status(500).json({ error: "Internal server error" });
      }
    }

    return super.handle(error, { response } as HttpContextContract);
  }
}
