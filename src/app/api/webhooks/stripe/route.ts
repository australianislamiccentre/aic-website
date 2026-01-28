import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialize Stripe to avoid build-time errors
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    });
  }
  return stripe;
}

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
  }
  return secret;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret());
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // Check if this is a campaign subscription
      if (session.metadata?.type === 'campaign_subscription') {
        console.log('Campaign subscription started:', {
          sessionId: session.id,
          campaignId: session.metadata.campaignId,
          campaignSlug: session.metadata.campaignSlug,
        });

        // TODO: Update subscriber count in Sanity
        // await updateCampaignSubscriberCount(session.metadata.campaignId, 1);

        // TODO: Send welcome email with subscription details
        // await sendCampaignWelcomeEmail(session);
      } else {
        // Regular one-time donation
        console.log('Donation successful:', {
          sessionId: session.id,
          amount: session.amount_total,
          currency: session.currency,
          cause: session.metadata?.cause,
        });
      }
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', paymentIntent.id);
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;

      if (subscription.metadata?.type === 'campaign_subscription') {
        console.log('Campaign subscription created:', {
          subscriptionId: subscription.id,
          campaignId: subscription.metadata.campaignId,
          campaignTitle: subscription.metadata.campaignTitle,
          dailyAmount: subscription.metadata.dailyAmount,
          totalDays: subscription.metadata.totalDays,
        });

        // Set cancel_at to auto-end subscription on campaign end date
        const cancelAtTimestamp = subscription.metadata.cancelAtTimestamp;
        if (cancelAtTimestamp) {
          try {
            await getStripe().subscriptions.update(subscription.id, {
              cancel_at: parseInt(cancelAtTimestamp, 10),
            });
            console.log('Set subscription auto-cancel at:', new Date(parseInt(cancelAtTimestamp, 10) * 1000).toISOString());
          } catch (updateError) {
            console.error('Failed to set cancel_at on subscription:', updateError);
          }
        }

        // TODO: Update subscriber count in Sanity
        // await updateCampaignSubscriberCount(subscription.metadata.campaignId, 1);
      } else {
        console.log('Recurring donation subscription created:', subscription.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      if (subscription.metadata?.type === 'campaign_subscription') {
        console.log('Campaign subscription ended:', {
          subscriptionId: subscription.id,
          campaignId: subscription.metadata.campaignId,
          campaignTitle: subscription.metadata.campaignTitle,
          reason: subscription.cancellation_details?.reason || 'unknown',
        });

        // TODO: Update subscriber count in Sanity
        // await updateCampaignSubscriberCount(subscription.metadata.campaignId, -1);
      } else {
        console.log('Recurring donation cancelled:', subscription.id);
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;

      // Check if this is a campaign subscription invoice
      // The parent field contains the subscription ID for subscription invoices
      const subscriptionId = (invoice as unknown as { parent?: { subscription_details?: { subscription?: string } } }).parent?.subscription_details?.subscription;
      if (subscriptionId) {
        try {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          if (subscription.metadata?.type === 'campaign_subscription') {
            console.log('Campaign daily donation charged:', {
              invoiceId: invoice.id,
              campaignId: subscription.metadata.campaignId,
              campaignTitle: subscription.metadata.campaignTitle,
              amount: invoice.amount_paid,
            });

            // TODO: Update raised amount in Sanity
            // await updateCampaignRaisedAmount(
            //   subscription.metadata.campaignId,
            //   invoice.amount_paid / 100
            // );
          }
        } catch (subError) {
          console.error('Error fetching subscription for invoice:', subError);
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;

      // Check if this is a campaign subscription invoice
      const subscriptionIdFailed = (invoice as unknown as { parent?: { subscription_details?: { subscription?: string } } }).parent?.subscription_details?.subscription;
      if (subscriptionIdFailed) {
        try {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionIdFailed);
          if (subscription.metadata?.type === 'campaign_subscription') {
            console.log('Campaign payment failed:', {
              invoiceId: invoice.id,
              campaignId: subscription.metadata.campaignId,
              campaignTitle: subscription.metadata.campaignTitle,
            });

            // TODO: Send payment failure notification email
            // await sendPaymentFailureEmail(invoice);
          }
        } catch (subError) {
          console.error('Error fetching subscription for failed invoice:', subError);
        }
      }
      break;
    }

    default:
      // Don't log unhandled events in production
      if (process.env.NODE_ENV === 'development') {
        console.log(`Unhandled event type: ${event.type}`);
      }
  }

  return NextResponse.json({ received: true });
}
