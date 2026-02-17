import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sanitizeMetadata } from '@/lib/campaign-utils';

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

// Frequency mapping for Stripe recurring intervals
const frequencyToInterval: Record<string, { interval: 'day' | 'week' | 'month' | 'year'; interval_count: number } | null> = {
  once: null,
  daily: { interval: 'day', interval_count: 1 },
  weekly: { interval: 'week', interval_count: 1 },
  fortnightly: { interval: 'week', interval_count: 2 },
  monthly: { interval: 'month', interval_count: 1 },
  quarterly: { interval: 'month', interval_count: 3 },
  yearly: { interval: 'year', interval_count: 1 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, frequency, cause, causeTitle, donorInfo } = body;

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(amount * 100);
    const isRecurring = frequency !== 'once' && frequencyToInterval[frequency];

    // Base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Common session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      customer_email: donorInfo?.email || undefined,
      metadata: {
        cause: sanitizeMetadata(cause),
        causeTitle: sanitizeMetadata(causeTitle),
        frequency: sanitizeMetadata(frequency),
        donorFirstName: sanitizeMetadata(donorInfo?.firstName),
        donorLastName: sanitizeMetadata(donorInfo?.lastName),
        donorPhone: sanitizeMetadata(donorInfo?.phone),
        donorMessage: sanitizeMetadata(donorInfo?.message),
        anonymous: donorInfo?.anonymous ? 'true' : 'false',
      },
      success_url: `${baseUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/donate?cancelled=true`,
    };

    let session: Stripe.Checkout.Session;

    if (isRecurring) {
      // Create a subscription checkout session for recurring donations
      const recurringInterval = frequencyToInterval[frequency]!;

      session = await getStripe().checkout.sessions.create({
        ...sessionParams,
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'aud',
              product_data: {
                name: `Donation - ${causeTitle}`,
                description: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} donation to Australian Islamic Centre`,
              },
              unit_amount: amountInCents,
              recurring: {
                interval: recurringInterval.interval,
                interval_count: recurringInterval.interval_count,
              },
            },
            quantity: 1,
          },
        ],
      });
    } else {
      // Create a one-time payment checkout session
      session = await getStripe().checkout.sessions.create({
        ...sessionParams,
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'aud',
              product_data: {
                name: `Donation - ${causeTitle}`,
                description: 'One-time donation to Australian Islamic Centre',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
      });
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);

    // Handle Stripe-specific errors with user-friendly messages
    if (error instanceof Stripe.errors.StripeError) {
      let userMessage = 'Failed to create checkout session';

      if (error.code === 'email_invalid') {
        userMessage = 'Please enter a valid email address';
      } else if (error.code === 'amount_too_small') {
        userMessage = 'Donation amount is too small. Minimum is $1.';
      } else if (error.type === 'StripeInvalidRequestError') {
        userMessage = 'Invalid request. Please check your information and try again.';
      }

      return NextResponse.json(
        { error: userMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}
