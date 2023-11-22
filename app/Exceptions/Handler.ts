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

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger);
  }

  async handle(error: any, { response }) {
    console.log("ERROR in handler: ", error);
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
  }
}

export const ErrorHandler = new ExceptionHandler().handle;
