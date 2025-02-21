import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import prisma from '../../prisma/prisma';

export default class VerifyMembership {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    const { authenticatedUser } = request;

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        user_id: authenticatedUser?.id,
      },
    });

    console.log('user: ', userProfile);

    if (!userProfile) {
      response.unauthorized({ error: 'Please create a profile first' });
      return;
    }

    if (userProfile.membership !== 'PRO') {
      response.unauthorized({ error: 'You need PRO tier membership' });
      return;
    }

    await next();
  }
}
