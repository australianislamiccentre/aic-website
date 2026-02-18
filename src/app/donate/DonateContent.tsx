"use client";

import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { Heart } from "lucide-react";
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
  const featuredCampaign = campaigns.find((c) => c.featured);
  const additionalCampaigns = campaigns.filter((c) => !c.featured);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-neutral-50 pt-10 pb-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Support Our Centre
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Make a <span className="text-green-600">Donation</span>
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Your generosity helps us maintain our centre, run educational
              programs, and support those in need.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Main Donation Form */}
      {goalMeter?.mainDonationFormElement && (
        <section className="py-10 bg-neutral-50">
          <div className="max-w-2xl mx-auto px-6">
            <FadeIn>
              <div
                className="fundraise-up-wrapper"
                dangerouslySetInnerHTML={{
                  __html: cleanElementCode(
                    goalMeter.mainDonationFormElement
                  ),
                }}
              />
            </FadeIn>
          </div>
        </section>
      )}

      {/* Campaigns */}
      {(campaigns.length > 0 ||
        (goalMeter?.enabled && goalMeter?.fundraiseUpElement)) && (
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <FadeIn>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                Active Campaigns
              </h2>
            </FadeIn>

            <div className="space-y-8">
              {/* Goal Meter */}
              {goalMeter?.enabled && goalMeter?.fundraiseUpElement && (
                <FadeIn>
                  <div
                    className="fundraise-up-goal-meter max-w-lg mx-auto"
                    dangerouslySetInnerHTML={{
                      __html: cleanElementCode(goalMeter.fundraiseUpElement),
                    }}
                  />
                </FadeIn>
              )}

              {/* Featured Campaign */}
              {featuredCampaign && (
                <FadeIn>
                  <div className="w-[300px] mx-auto rounded-xl overflow-hidden shadow-md">
                    <div className="bg-[#1a5d57] px-4 py-2.5">
                      <h3 className="text-white text-sm font-semibold text-center leading-snug">
                        {featuredCampaign.title}
                      </h3>
                    </div>
                    <div
                      className="fundraise-up-wrapper"
                      dangerouslySetInnerHTML={{
                        __html: cleanElementCode(
                          featuredCampaign.fundraiseUpElement
                        ),
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
                        <div className="bg-[#1a5d57] px-4 py-2">
                          <h4 className="text-white text-xs font-medium text-center leading-snug">
                            {campaign.title}
                          </h4>
                        </div>
                        <div
                          className="fundraise-up-wrapper"
                          dangerouslySetInnerHTML={{
                            __html: cleanElementCode(
                              campaign.fundraiseUpElement
                            ),
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

      {/* Recent Donations */}
      {goalMeter?.recentDonationsElement && (
        <section className="py-12 bg-neutral-50">
          <div className="max-w-4xl mx-auto px-6">
            <FadeIn>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                Recent Donations
              </h2>
              <div
                className="fundraise-up-wrapper"
                dangerouslySetInnerHTML={{
                  __html: cleanElementCode(goalMeter.recentDonationsElement),
                }}
              />
            </FadeIn>
          </div>
        </section>
      )}

      {/* Donation Map */}
      {goalMeter?.donationMapElement && (
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <FadeIn>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                Donations Around the World
              </h2>
              <div
                className="fundraise-up-wrapper"
                dangerouslySetInnerHTML={{
                  __html: cleanElementCode(goalMeter.donationMapElement),
                }}
              />
            </FadeIn>
          </div>
        </section>
      )}
    </div>
  );
}
