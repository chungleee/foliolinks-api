import { Exception } from '@adonisjs/core/build/standalone';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new UserProfileException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class UserProfileException extends Exception {
  public async handle(error: this, { response }: HttpContextContract) {
    return response
      .status(error.status)
      .json({ error: error.message, errorCode: error.code });
  }
}
