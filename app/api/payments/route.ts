import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';
import { resolveUserIdAndPlan } from '@/lib/resolve-stripe-user';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription') break;

      const subRef = session.subscription;
      if (!subRef) break;

      const userId =
        session.metadata?.user_id ?? session.client_reference_id ?? undefined;
      const plan =
        session.metadata?.plan === 'yearly' ? 'yearly' : 'monthly';
      if (!userId) break;

      const subId = typeof subRef === 'string' ? subRef : subRef.id;
      const fullSub = await stripe.subscriptions.retrieve(subId);

      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          stripe_subscription_id: fullSub.id,
          stripe_customer_id:
            typeof fullSub.customer === 'string' ? fullSub.customer : fullSub.customer.id,
          status: fullSub.status,
          plan,
          current_period_end: new Date(fullSub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      const resolved = await resolveUserIdAndPlan(subscription);
      if (!resolved) break;

      const { error: supabaseError } = await supabase.from('subscriptions').upsert(
        {
          user_id: resolved.userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          status: subscription.status,
          plan: resolved.plan,
          current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (supabaseError) {
        console.error("SUPABASE UPSERT ERROR:", supabaseError);
      } else {
        console.log("Successfully inserted subscription for user:", resolved.userId);
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const status =
        event.type === 'customer.subscription.deleted' ? 'canceled' : subscription.status;

      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : new Date().toISOString();

      await supabase
        .from('subscriptions')
        .update({
          status,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
