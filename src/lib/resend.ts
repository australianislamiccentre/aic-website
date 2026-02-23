/**
 * Resend Email Client
 *
 * Lazy singleton for the Resend API client. Created on first use to avoid
 * initialising during build or when emails aren't needed. Throws if
 * RESEND_API_KEY is not set.
 *
 * @module lib/resend
 */
import { Resend } from "resend";

let resendClient: Resend | null = null;

/** Returns the Resend client singleton. Creates it on first call. */
export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not set. Add it to your .env.local file."
      );
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}
