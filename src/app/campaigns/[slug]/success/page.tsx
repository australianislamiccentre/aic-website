import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Calendar,
  Clock,
  Mail,
  ArrowRight,
  Home,
  Heart,
} from "lucide-react";
import { getDonationCampaignBySlug } from "@/sanity/lib/fetch";
import { Button } from "@/components/ui/Button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import {
  getMelbourneToday,
  formatDateRange,
} from "@/lib/campaign-utils";

interface SuccessPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string; type?: string; ongoing?: string }>;
}

export const metadata: Metadata = {
  title: "Thank You - Campaign Signup Complete",
};

export default async function CampaignSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { slug } = await params;
  const { session_id, type, ongoing } = await searchParams;
  const campaign = await getDonationCampaignBySlug(slug);
  const isUpfront = type === "upfront";
  const isOngoing = ongoing === "true" || campaign?.isOngoing || !campaign?.endDate;

  if (!campaign) {
    notFound();
  }

  // Calculate campaign details using Melbourne timezone
  const today = getMelbourneToday();
  const isLateJoin = today >= campaign.startDate;

  // Format a date string (YYYY-MM-DD) for display in Melbourne timezone
  const formatDateStr = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)); // Noon UTC to avoid edge cases
    return date.toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Australia/Melbourne",
    });
  };

  // Calculate billing start date in Melbourne timezone
  let billingStartDateStr: string;
  if (isLateJoin) {
    // Tomorrow in Melbourne time
    const [year, month, day] = today.split("-").map(Number);
    const tomorrowDate = new Date(Date.UTC(year, month - 1, day + 1));
    billingStartDateStr = getMelbourneToday(tomorrowDate);
  } else {
    billingStartDateStr = campaign.startDate;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-teal-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <FadeIn direction="up">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Thank You for Joining!
              </h1>
              <p className="text-lg text-gray-600">
                Your registration for{" "}
                <span className="font-semibold text-teal-700">{campaign.title}</span> is
                complete.
              </p>
            </div>
          </FadeIn>

          {/* Confirmation Card */}
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="font-semibold text-lg text-gray-900 mb-6">
                {isUpfront ? "Payment Details" : "Subscription Details"}
              </h2>

              <StaggerContainer className="space-y-4">
                <StaggerItem>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-teal-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Campaign Period</p>
                      <p className="text-sm text-gray-600">
                        {formatDateRange(campaign.startDate, campaign.endDate, isOngoing)}
                      </p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <Clock className="w-5 h-5 text-teal-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {isUpfront ? "Payment Type" : isLateJoin ? "First Charge" : "Billing Starts"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {isUpfront
                          ? "One-time payment - Your full donation has been processed"
                          : isLateJoin
                          ? `Tomorrow (${formatDateStr(billingStartDateStr)})`
                          : `Campaign start date (${formatDateStr(campaign.startDate)})`}
                      </p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-teal-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Confirmation Email</p>
                      <p className="text-sm text-gray-600">
                        Check your email for a confirmation from Stripe with your
                        {isUpfront ? " payment" : " subscription"} details.
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              </StaggerContainer>

              {/* What to Expect */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="font-medium text-gray-900 mb-4">What Happens Next</h3>
                {isUpfront ? (
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-600">1</span>
                      </span>
                      <span>
                        Your full donation has been processed as a one-time payment.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-600">2</span>
                      </span>
                      <span>
                        You&apos;ll receive a single receipt via email for your donation.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-600">3</span>
                      </span>
                      <span>
                        Your donation will support the campaign from {formatDateStr(campaign.startDate)} to {formatDateStr(campaign.endDate!)}.
                      </span>
                    </li>
                  </ul>
                ) : isOngoing ? (
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-600">1</span>
                      </span>
                      <span>
                        Your daily donation will be charged automatically each day.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-600">2</span>
                      </span>
                      <span>
                        You&apos;ll receive an email receipt for each daily donation.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-600">3</span>
                      </span>
                      <span>
                        This is an ongoing subscription with no end date - it will continue until you cancel.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-600">4</span>
                      </span>
                      <span>
                        You can cancel anytime by contacting us. Cancellations take effect at
                        the end of the current day.
                      </span>
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-600">1</span>
                      </span>
                      <span>
                        Your daily donation of your selected amount will be charged
                        automatically each day during the campaign period.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-600">2</span>
                      </span>
                      <span>
                        You&apos;ll receive an email receipt for each daily donation.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-600">3</span>
                      </span>
                      <span>
                        The subscription will automatically end on {formatDateStr(campaign.endDate!)}.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-600">4</span>
                      </span>
                      <span>
                        You can cancel anytime by contacting us. Cancellations take effect at
                        the end of the current day.
                      </span>
                    </li>
                  </ul>
                )}
              </div>

              {session_id && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Reference ID: {session_id.substring(0, 20)}...
                  </p>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Actions */}
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/campaigns">
                <Button variant="outline" icon={<ArrowRight className="w-4 h-4" />}>
                  View Other Campaigns
                </Button>
              </Link>
              <Link href="/donate">
                <Button variant="outline" icon={<Heart className="w-4 h-4" />}>
                  Make Another Donation
                </Button>
              </Link>
              <Link href="/">
                <Button variant="gold" icon={<Home className="w-4 h-4" />}>
                  Return Home
                </Button>
              </Link>
            </div>
          </FadeIn>

          {/* Support Info */}
          <FadeIn delay={0.3}>
            <div className="text-center mt-12 text-sm text-gray-500">
              <p>
                Questions about your subscription?{" "}
                <Link href="/contact" className="text-teal-600 hover:underline">
                  Contact us
                </Link>
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
