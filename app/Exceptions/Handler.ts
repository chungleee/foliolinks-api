// import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
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
    console.log("ERROR: ", error);
    if (error.name === "ValidationException") {
      return response.status(200).json({ error: error.messages.errors });
    }

    if (error.name === "AuthApiError") {
      return response.status(400).json({ error: error.message });
    }
  }
}

export const ErrorHandler = new ExceptionHandler().handle;
