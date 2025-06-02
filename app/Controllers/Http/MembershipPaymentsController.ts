import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { stripe } from '../../../config/stripe';
import prisma from '../../../prisma/prisma';

export default class MembershipPaymentsController {
  public async createCheckoutSession({
    request,
    response,
  }: HttpContextContract) {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'custom',
      line_items: [
        {
          price: 'price_1RTSnKE4dYWFu43eQGBTt6Vw',
          quantity: 1,
        },
      ],
      mode: 'subscription',
    });

    response.ok({
      clientSecret: session.client_secret,
      checkoutSessionId: session.id,
    });
  }

  public async removeCheckoutSession({
    request,
    response,
  }: HttpContextContract) {
    const sessionToExpire: string = request.body().sessionToExpire;
    const session = await stripe.checkout.sessions.expire(sessionToExpire);

    response.ok({ status: session.status });
  }

  public async upgradeMembership({ request, response }: HttpContextContract) {
    const userId = request.authenticatedUser.id;
    // const userId = request.body().userId;

    const userProfile = await prisma.userProfile.update({
      where: {
        user_id: userId,
      },
      data: {
        membership: 'PRO',
      },
    });

    if (!userProfile) {
      return response.notFound({ error: 'Something went wrong' });
    }

    return response.ok({
      type: 'success',
      userProfile,
    });
  }
}
