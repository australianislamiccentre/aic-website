/**
 * Email Delivery — Production-Only Guard Around Resend
 *
 * Every form email and newsletter sign-up goes through here; API routes never
 * use the Resend client directly. Only the production deployment contacts real
 * people. Vercel preview deployments and local development read the same
 * production Sanity data (recipient addresses included), so without this guard
 * testing a form on a preview would email real staff and real submitters, and
 * a test sign-up would join the real newsletter audience.
 *
 * Outside production:
 * - With `EMAIL_TEST_RECIPIENT` set, every email goes to that inbox instead,
 *   with the intended recipient shown in the subject.
 * - Without it, nothing is sent and a warning is logged. The form still reports
 *   success, so the rest of the flow can be tested.
 * - Newsletter sign-ups never reach the Resend audience.
 *
 * @module lib/email-delivery
 */
import { getResendClient } from "@/lib/resend";

/** An email built by a form route. */
export interface OutgoingEmail {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
}

/** A newsletter subscriber for the Resend audience. */
export interface NewsletterContact {
  audienceId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed: boolean;
  properties: Record<string, string>;
}

/**
 * True only on the production deployment. Vercel sets `VERCEL_ENV` at runtime;
 * `NEXT_PUBLIC_VERCEL_ENV` is inlined at build and covers a runtime without it.
 * Both are unset in local development.
 */
export function isProductionDeployment(): boolean {
  return (process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV) === "production";
}

/** Sends an email to its real recipient in production, or to the test inbox everywhere else. */
export async function sendEmail(email: OutgoingEmail): Promise<void> {
  let delivery = email;

  if (!isProductionDeployment()) {
    const testInbox = process.env.EMAIL_TEST_RECIPIENT?.trim();
    if (!testInbox) {
      console.warn(
        `[email] Not sent: this isn't the production deployment and EMAIL_TEST_RECIPIENT is unset ("${email.subject}")`,
      );
      return;
    }
    delivery = { ...email, to: testInbox, subject: `[TEST → ${email.to}] ${email.subject}` };
  }

  // Resend reports API failures in the response rather than throwing
  const { error } = await getResendClient().emails.send(delivery);
  if (error) {
    console.error(`[email] Resend rejected "${email.subject}":`, error);
  }
}

/** Adds (or updates) a newsletter subscriber in the Resend audience — production only. */
export async function addToNewsletterAudience(contact: NewsletterContact): Promise<void> {
  if (!isProductionDeployment()) {
    console.warn("[email] Newsletter sign-up not added to the Resend audience outside production");
    return;
  }

  const resend = getResendClient();
  const { error: createError } = await resend.contacts.create(contact);

  // If create fails (e.g. contact was previously deleted or already exists), update instead
  if (createError) {
    await resend.contacts.update(contact);
  }
}
