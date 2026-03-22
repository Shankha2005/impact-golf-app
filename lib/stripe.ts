import Stripe from 'stripe';

// Initialize the Stripe SDK
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'Golf Charity Platform',
    version: '1.0.0',
  },
});