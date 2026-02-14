"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Moon,
  Heart,
  Star,
  Gift,
  Calendar,
  Sunrise,
  Sun,
  Sparkles,
  ArrowRight,
  Clock,
  Users,
} from "lucide-react";
import { SanityDonationCampaign } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import {
  getMelbourneToday,
  getDaysDifference,
  formatDateRange as formatDateRangeUtil,
} from "@/lib/campaign-utils";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Moon,
  Heart,
  Star,
  Gift,
  Calendar,
  Sunrise,
  Sun,
  Sparkles,
};

interface CampaignsContentProps {
  campaigns: SanityDonationCampaign[];
}

function getCampaignStatus(campaign: SanityDonationCampaign): {
  status: "upcoming" | "active" | "ending-soon" | "ended" | "ongoing";
  label: string;
  color: string;
} {
  // Use Melbourne timezone for all date comparisons
  const today = getMelbourneToday();
  const startDate = campaign.startDate;
  const endDate = campaign.endDate;
  const isOngoing = campaign.isOngoing || !campaign.endDate;

  if (today < startDate) {
    const daysUntil = getDaysDifference(today, startDate);
    return {
      status: "upcoming",
      label: daysUntil === 1 ? "Starts tomorrow" : `Starts in ${daysUntil} days`,
      color: "bg-blue-100 text-blue-700",
    };
  }

  // For time-bound campaigns only
  if (endDate && today > endDate) {
    return {
      status: "ended",
      label: "Ended",
      color: "bg-gray-100 text-gray-600",
    };
  }

  // Ongoing campaigns
  if (isOngoing) {
    return {
      status: "ongoing",
      label: "Ongoing",
      color: "bg-teal-100 text-teal-700",
    };
  }

  // Calculate remaining days including today (today to endDate inclusive)
  const daysRemaining = getDaysDifference(today, endDate!) + 1;

  if (daysRemaining <= 3) {
    return {
      status: "ending-soon",
      label: daysRemaining === 1 ? "Ends today" : `${daysRemaining} days left`,
      color: "bg-amber-100 text-amber-700",
    };
  }

  return {
    status: "active",
    label: `${daysRemaining} days remaining`,
    color: "bg-green-100 text-green-700",
  };
}

// Use the shared formatDateRange utility for Melbourne timezone consistency
function formatDateRange(startDate: string, endDate?: string, isOngoing?: boolean): string {
  return formatDateRangeUtil(startDate, endDate, isOngoing);
}

function CampaignCard({ campaign }: { campaign: SanityDonationCampaign }) {
  const IconComponent = iconMap[campaign.icon || "Moon"] || Moon;
  const { status, label, color } = getCampaignStatus(campaign);
  const isEnded = status === "ended";
  const isOngoing = campaign.isOngoing || !campaign.endDate;

  const progress =
    campaign.goal && campaign.raised
      ? Math.min((campaign.raised / campaign.goal) * 100, 100)
      : 0;

  return (
    <motion.div
      className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 ${
        isEnded ? "opacity-60" : ""
      }`}
      whileHover={isEnded ? {} : { y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.2 }}
    >
      {/* Campaign Image */}
      <div className="relative h-48 bg-gradient-to-br from-teal-600 to-teal-800">
        {campaign.image && (
          <Image
            src={urlFor(campaign.image).width(600).height(300).url()}
            alt={campaign.title}
            fill
            className="object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
            {label}
          </span>
        </div>

        {/* Icon */}
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <IconComponent className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>

        {/* Campaign Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDateRange(campaign.startDate, campaign.endDate, isOngoing)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              Daily amounts: ${campaign.presetAmounts[0]} - $
              {campaign.presetAmounts[campaign.presetAmounts.length - 1]}
            </span>
          </div>

          {campaign.subscriberCount !== undefined && campaign.subscriberCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{campaign.subscriberCount} donors joined</span>
            </div>
          )}
        </div>

        {/* Progress Bar (if goal exists) */}
        {campaign.goal && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                ${campaign.raised?.toLocaleString() || 0} raised
              </span>
              <span className="text-gray-500">
                ${campaign.goal.toLocaleString()} goal
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-500 to-lime-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <Link href={`/campaigns/${campaign.slug}`}>
          <Button
            variant={isEnded ? "outline" : "gold"}
            className="w-full"
            disabled={isEnded}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {isEnded ? "View Campaign" : "Join Campaign"}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function CampaignsContent({ campaigns }: CampaignsContentProps) {
  // Use Melbourne timezone for filtering
  const today = getMelbourneToday();

  // Separate active/upcoming/ongoing from ended campaigns
  const activeCampaigns = campaigns.filter((c) => {
    // Ongoing campaigns are always active
    if (c.isOngoing || !c.endDate) return true;
    return c.endDate >= today;
  });

  const endedCampaigns = campaigns.filter((c) => {
    // Ongoing campaigns never end
    if (c.isOngoing || !c.endDate) return false;
    return c.endDate < today;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page Header */}
      <section className="pt-8 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Donation <span className="text-teal-600">Campaigns</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Join our scheduled donation campaigns and make a daily impact. Sign up once and we&apos;ll handle the rest.
            </p>
          </div>
        </div>
      </section>

      {/* Active/Upcoming Campaigns */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {activeCampaigns.length > 0 ? (
            <>
              <FadeIn direction="up">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Active & Upcoming Campaigns
                </h2>
              </FadeIn>

              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCampaigns.map((campaign) => (
                  <StaggerItem key={campaign._id}>
                    <CampaignCard campaign={campaign} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </>
          ) : (
            <FadeIn direction="up">
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  No Active Campaigns
                </h2>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  There are no donation campaigns running at the moment. Check back
                  soon or make a regular donation in the meantime.
                </p>
                <Link href="/donate">
                  <Button variant="gold" icon={<Heart className="w-4 h-4" />}>
                    Make a Donation
                  </Button>
                </Link>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Past Campaigns */}
      {endedCampaigns.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Past Campaigns
              </h2>
            </FadeIn>

            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedCampaigns.map((campaign) => (
                <StaggerItem key={campaign._id}>
                  <CampaignCard campaign={campaign} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How Campaign Donations Work
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Simple, automated giving for the duration of the campaign
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StaggerItem>
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Choose Your Amount
                </h3>
                <p className="text-gray-600 text-sm">
                  Select how much you&apos;d like to donate each day of the campaign
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center">
                <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-lime-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Sign Up Once</h3>
                <p className="text-gray-600 text-sm">
                  Enter your details and payment information securely via Stripe
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Automatic Daily Giving
                </h3>
                <p className="text-gray-600 text-sm">
                  Your donation is processed daily until the campaign ends. Cancel
                  anytime.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
