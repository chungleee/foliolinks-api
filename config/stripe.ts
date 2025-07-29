import Env from '@ioc:Adonis/Core/Env';
import StripeClient from 'stripe';

export const stripe = new StripeClient(Env.get('STRIPE_SK'), {
  apiVersion: '2025-03-31.basil',
});
