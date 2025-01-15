import { HttpContext } from "@adonisjs/core/http";
import { Exception } from "@adonisjs/core/exceptions";

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new ProjectException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class ProjectException extends Exception {
  public async handle(error: this, { response }: HttpContext) {
    return response
      .status(error.status)
      .json({ error: error.message, errorCode: error.code });
  }
}
