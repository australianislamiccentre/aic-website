"use client";

import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import {
  Heart,
  Lock,
  CheckCircle2,
  Sparkles,
  Calendar,
} from "lucide-react";
import { DonationGoalMeter } from "@/sanity/lib/fetch";

interface Campaign {
  _id: string;
  title: string;
  fundraiseUpElement: string;
  featured: boolean;
}

interface DonateContentProps {
  campaigns: Campaign[];
  goalMeter?: DonationGoalMeter | null;
}

// Clean Fundraise Up element code of hidden Unicode characters
const cleanElementCode = (code: string) => {
  return code.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
};

export default function DonateContent({
  campaigns,
  goalMeter,
}: DonateContentProps) {
  const featuredCampaign = campaigns.find(c => c.featured);
  const additionalCampaigns = campaigns.filter(c => !c.featured);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-white to-green-50/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Make a Difference
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Support Our <span className="text-green-600">Mission</span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Your generosity helps us maintain our centre, run educational programs,
              and support those in need. Every contribution makes a difference.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                <Lock className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Tax Deductible</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">100% Goes to Cause</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      {campaigns.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Active Campaigns</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Choose a campaign to support and make an impact today.
                </p>
              </div>
            </FadeIn>

            <div className="space-y-8">
              {/* Overall Goal Meter (Fundraise Up Element) */}
              {goalMeter?.enabled && goalMeter?.fundraiseUpElement && (
                <FadeIn>
                  <div
                    className="fundraise-up-goal-meter max-w-lg mx-auto mb-4"
                    dangerouslySetInnerHTML={{
                      __html: cleanElementCode(goalMeter.fundraiseUpElement),
                    }}
                  />
                </FadeIn>
              )}

              {/* Featured Campaign - integrated title header */}
              {featuredCampaign && (
                <FadeIn>
                  <div className="w-[300px] mx-auto rounded-xl overflow-hidden shadow-md">
                    {/* Title bar - matches Fundraise Up widget header */}
                    <div className="bg-[#1a5d57] px-4 py-2.5">
                      <h3 className="text-white text-sm font-semibold text-center leading-snug">
                        {featuredCampaign.title}
                      </h3>
                    </div>
                    {/* Fundraise Up Element */}
                    <div
                      className="fundraise-up-wrapper"
                      dangerouslySetInnerHTML={{
                        __html: cleanElementCode(featuredCampaign.fundraiseUpElement),
                      }}
                    />
                  </div>
                </FadeIn>
              )}

              {/* Additional Campaigns */}
              {additionalCampaigns.length > 0 && (
                <StaggerContainer className="flex flex-wrap justify-center gap-6">
                  {additionalCampaigns.map((campaign) => (
                    <StaggerItem key={campaign._id}>
                      <div className="w-[300px] rounded-xl overflow-hidden shadow-md">
                        {/* Title bar */}
                        <div className="bg-[#1a5d57] px-4 py-2">
                          <h4 className="text-white text-xs font-medium text-center leading-snug">
                            {campaign.title}
                          </h4>
                        </div>
                        {/* Fundraise Up Element */}
                        <div
                          className="fundraise-up-wrapper"
                          dangerouslySetInnerHTML={{
                            __html: cleanElementCode(campaign.fundraiseUpElement),
                          }}
                        />
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Why Donate Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Donate With Us?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your contributions directly support our community and make a lasting impact.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Lock, title: "100% Secure", description: "All payments are processed securely" },
              { icon: CheckCircle2, title: "Tax Deductible", description: "Receive a tax receipt for your donation" },
              { icon: Heart, title: "Direct Impact", description: "100% of your donation goes to the cause" },
              { icon: Calendar, title: "Flexible Options", description: "One-time or recurring donations available" },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Other Ways to Give */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Other Ways to Give</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Beyond online donations, there are many ways you can support our mission.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Bank Transfer",
                description: "Make a direct bank transfer to our account.",
                details: "BSB: 000-000 | Account: 12345678",
              },
              {
                title: "In-Person",
                description: "Visit our centre and make a donation in person.",
                details: "23-27 Blenheim Rd, Newport VIC 3015",
              },
              {
                title: "Legacy Giving",
                description: "Include the centre in your will for lasting impact.",
                details: "Contact us for more information",
              },
            ].map((method) => (
              <StaggerItem key={method.title}>
                <div className="p-8 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{method.title}</h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <p className="text-sm text-green-600 font-medium">{method.details}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
