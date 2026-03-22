import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

function isDeletedCustomer(
  c: Stripe.Customer | Stripe.DeletedCustomer
): c is Stripe.DeletedCustomer {
  return (c as Stripe.DeletedCustomer).deleted === true;
}

/**
 * Stripe Checkout metadata on the session does not always appear on the subscription object.
 * We set subscription_data.metadata in checkout; if still empty, fall back to the Stripe
 * Customer record (supabase_user_id / user_id from checkout customer creation).
 */
export async function resolveUserIdAndPlan(
  subscription: Stripe.Subscription
): Promise<{ userId: string; plan: 'monthly' | 'yearly' } | null> {
  const fromSub = subscription.metadata?.user_id;
  const planRaw = subscription.metadata?.plan;
  if (fromSub) {
    return {
      userId: fromSub,
      plan: planRaw === 'yearly' ? 'yearly' : 'monthly',
    };
  }

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;
  if (!customerId) return null;

  const customer = await stripe.customers.retrieve(customerId);
  if (isDeletedCustomer(customer)) return null;

  const meta = customer.metadata;
  const userId = meta?.user_id ?? meta?.supabase_user_id;
  if (!userId) return null;

  return {
    userId,
    plan: meta?.plan === 'yearly' ? 'yearly' : 'monthly',
  };
}
