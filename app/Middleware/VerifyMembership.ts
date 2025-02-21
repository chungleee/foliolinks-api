import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import prisma from '../../prisma/prisma';

export default class VerifyMembership {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const { authenticatedUser } = request;

    const user = await prisma.userProfile.findUnique({
      where: {
        user_id: authenticatedUser?.id,
      },
    });

    if (!user) {
      response.unauthorized({ error: 'Please create a profile first' });
      return;
    }

    console.log('found user: ', user);

    await next();
  }
}
