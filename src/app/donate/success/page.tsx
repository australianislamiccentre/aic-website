/**
 * Donation Success Page
 *
 * Redirect-only page that sends users back to the main donate page after a
 * successful donation. Exists as a callback target for payment providers.
 *
 * @route /donate/success
 * @module app/donate/success/page
 */
import { redirect } from "next/navigation";

export default function DonationSuccessPage() {
  redirect("/donate");
}
