import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { stripe } from '../../../config/stripe';
import prisma from '../../../prisma/prisma';

export default class MembershipPaymentsController {
  public async createCheckoutSession({
    request,
    response,
  }: HttpContextContract) {
    const userId = request.authenticatedUser.id;

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!userProfile) {
      return response.notFound({
        type: 'error',
        message: 'No user profile found.',
      });
    }

    if (userProfile.membership === 'PRO') {
      return response.ok({ type: 'success', message: 'Already a PRO member.' });
    }

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

  public async stripeSubscriptionWebhook({
    request,
    response,
  }: HttpContextContract) {
    const endpointSecret =
      'whsec_695f41fb4c398b31839e4a4af67a4053bba1817dec2f32ce3b8dd451b85f90a6';
    let event;
    const raw = request.raw();
    console.log('raw: ', raw);

    if (endpointSecret) {
      const signature = request.header('stripe-signature');
      try {
        if (signature) {
          event = stripe.webhooks.constructEvent(
            raw as string,
            signature,
            endpointSecret
          );
        }

        console.log('event: ', event);
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.status(400);
      }

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          // Then define and call a method to handle the successful payment intent.
          // handlePaymentIntentSucceeded(paymentIntent);
          console.log('intent: ', paymentIntent);
          break;
        case 'payment_method.attached':
          const paymentMethod = event.data.object;
          // Then define and call a method to handle the successful attachment of a PaymentMethod.
          // handlePaymentMethodAttached(paymentMethod);
          console.log('method: ', paymentMethod);
          break;
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a response to acknowledge receipt of the event
      response.json({ received: true });
    }
  }
}
