import { HttpContext } from "@adonisjs/core/http";
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

import logger from "@adonisjs/core/services/logger";
import { Prisma } from "@prisma/client";
import { ExceptionHandler } from "@adonisjs/core/http";

export default class ExceptionHandler extends ExceptionHandler {
  constructor() {
    super(logger);
  }

  async handle(error: any, { response }: HttpContext) {
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
            error: `${error.meta.target[0]} is already taken`,
          });
        case "P2025":
          return response.status(404).json({
            error: error.meta,
            // error: "User profile does not exist",
          });
        default:
          return response.status(500).json({ error: "Internal server error" });
      }
    }

    return super.handle(error, { response } as HttpContext);
  }
}
