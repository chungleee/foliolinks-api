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
| new AuthException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export enum AuthErrorCode {
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  SIGNUP_FAILED = 'SIGNUP_FAILED',
}
export default class AuthException extends Exception {
  private static messages: Record<AuthErrorCode, string> = {
    [AuthErrorCode.USERNAME_TAKEN]: 'Username already taken',
    [AuthErrorCode.SIGNUP_FAILED]: 'Sign up failed',
  };

  constructor(
    errorCode: AuthErrorCode | string,
    status?: number,
    message?: string
  ) {
    const errorMessage = AuthException.messages[errorCode] ?? message;
    super(errorMessage, (status = 400));
    this.code = errorCode;
  }

  public async handle(error: this, { response }: HttpContextContract) {
    response.status(error.status).json({
      error: error.message,
      errorCode: error.code || 'UNKNOWN_ERROR',
    });
  }
}
