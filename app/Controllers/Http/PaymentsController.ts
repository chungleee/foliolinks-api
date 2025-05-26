import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { stripe } from '../../../config/stripe';

export default class PaymentsController {
  public async createCheckoutSession({
    request,
    response,
  }: HttpContextContract) {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'custom',
      line_items: [
        {
          price: '3.00',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      return_url: `http://localhost:3333/return?session_id{CHECKOUT_SESSION_ID}`,
    });

    response.ok({
      clientSecret: session.client_secret,
    });
  }
}
