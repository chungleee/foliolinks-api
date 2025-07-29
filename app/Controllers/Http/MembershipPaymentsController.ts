import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { stripe } from '../../../config/stripe';
import prisma from '../../../prisma/prisma';
import Stripe from 'stripe';

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

  public async unsubscribe({ request, response }: HttpContextContract) {
    const userId = request.authenticatedUser.id;
    const membershipRecord = await prisma.membershipRecord.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!membershipRecord) {
      return response.badRequest({
        type: 'error',
        message: 'Membership record not found',
      });
    }

    const subscription = await stripe.subscriptions.cancel(
      membershipRecord?.subscription_id as string
    );

    if (subscription.status === 'canceled') {
      const updatedUserProfile = await prisma.userProfile.update({
        where: {
          user_id: userId,
        },
        data: {
          membership: 'BASIC',
        },
      });

      return response.ok({ type: 'success', updatedUserProfile });
    }
  }

  public async stripeSubscriptionWebhook({
    request,
    response,
  }: HttpContextContract) {
    const endpointSecret =
      'whsec_695f41fb4c398b31839e4a4af67a4053bba1817dec2f32ce3b8dd451b85f90a6';
    let event;
    const raw = request.raw();
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
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.status(400);
      }

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;
          const customerEmail = session.customer_details?.email;

          if (!customerId || !customerEmail) {
            console.warn('Missing customer id or email in session');
            return response.status(400);
          }

          let userProfile = await prisma.userProfile.findUnique({
            where: {
              email: customerEmail,
            },
          });

          if (!userProfile) {
            return response.notFound({ error: 'Something went wrong' });
          }

          const [existingStripeCustomer, existingMembershipRecord] =
            await Promise.all([
              prisma.stripeCustomer.findUnique({
                where: { user_id: userProfile.user_id },
              }),
              prisma.membershipRecord.findUnique({
                where: { user_id: userProfile.user_id },
              }),
            ]);

          if (!existingStripeCustomer) {
            const newStripeCustomer = await prisma.stripeCustomer.create({
              data: {
                user_id: userProfile.user_id,
                stripe_customer_id: customerId,
              },
            });
          }

          if (!existingMembershipRecord) {
            const newMembershipRecord = await prisma.membershipRecord.create({
              data: {
                user_id: userProfile.user_id,
                stripe_customer_id: customerId,
                subscription_id: subscriptionId,
                subscription_status: 'ACTIVE',
              },
            });
          } else if (
            existingMembershipRecord.subscription_status !== 'ACTIVE'
          ) {
            await prisma.membershipRecord.update({
              where: {
                user_id: userProfile.user_id,
              },
              data: {
                subscription_status: 'ACTIVE',
              },
            });
          }
          break;
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          const deletedSubscriptionId = subscription.id;
          const stripeCustomerId = subscription.customer as string;

          const membershipRecord = await prisma.membershipRecord.update({
            where: {
              subscription_id: deletedSubscriptionId,
              stripe_customer_id: stripeCustomerId,
            },
            data: {
              subscription_status: 'INACTIVE',
            },
          });

          const stripeCustomer = await prisma.stripeCustomer.findUnique({
            where: {
              stripe_customer_id: membershipRecord.stripe_customer_id,
            },
          });

          if (!stripeCustomer) {
            return response.badRequest({
              type: 'error',
              message: 'Stripe Customer record not found',
            });
          }

          userProfile = await prisma.userProfile.update({
            where: {
              user_id: stripeCustomer.user_id,
            },
            data: {
              membership: 'BASIC',
            },
          });

          response.ok({ type: 'success' });
          break;
        // case 'payment_intent.succeeded':
        //   const paymentIntent = event.data.object;
        //   // Then define and call a method to handle the successful payment intent.
        //   // handlePaymentIntentSucceeded(paymentIntent);
        //   console.log('intent: ', paymentIntent);
        //   break;
        // case 'payment_method.attached':
        //   const paymentMethod = event.data.object;
        //   // Then define and call a method to handle the successful attachment of a PaymentMethod.
        //   // handlePaymentMethodAttached(paymentMethod);
        //   console.log('method: ', paymentMethod);
        //   break;
        // // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a response to acknowledge receipt of the event
      response.json({ received: true });
    }
  }
}
