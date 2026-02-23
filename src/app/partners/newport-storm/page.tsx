/**
 * Newport Storm Partner Page
 *
 * Client component showcasing the Newport Storm FC partnership. Displays
 * the football club's highlights including competitive teams, community
 * spirit, youth development, and links to the club's external site.
 *
 * @route /partners/newport-storm
 * @module app/partners/newport-storm/page
 */
"use client";

import Image from "next/image";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import {
  Trophy,
  Users,
  Heart,
  Calendar,
  MapPin,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const highlights = [
  {
    icon: Trophy,
    title: "Competitive Teams",
    description: "Fielding teams across multiple age groups in local football leagues.",
  },
  {
    icon: Users,
    title: "Community Spirit",
    description: "Bringing together players and families from diverse backgrounds.",
  },
  {
    icon: Heart,
    title: "Youth Development",
    description: "Developing skills, discipline, and teamwork in young athletes.",
  },
  {
    icon: Calendar,
    title: "Year-Round Programs",
    description: "Training sessions, matches, and community events throughout the season.",
  },
];

export default function NewportStormPage() {
  return (
    <>
      {/* Header */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-neutral-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <BreadcrumbLight />

          <div className="mt-8 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <Trophy className="w-4 h-4" />
                Affiliated Partner
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Newport <span className="text-blue-600">Storm FC</span>
              </h1>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Newport Storm Football Club is a community-based sports club affiliated with the
                Australian Islamic Centre. The club provides opportunities for youth and adults
                to participate in competitive football while fostering community bonds and
                promoting an active lifestyle.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  href="https://www.newportstormfc.com.au/"
                  variant="primary"
                  icon={<ExternalLink className="w-4 h-4" />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Visit Website
                </Button>
                <Button
                  href="/contact"
                  variant="outline"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Get In Touch
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/aic 5.jpg"
                  alt="Newport Storm FC"
                  width={600}
                  height={400}
                  className="w-full h-72 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What We Offer</h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {highlights.map((item) => (
              <FadeIn key={item.title}>
                <div className="bg-neutral-50 rounded-xl p-4 border border-gray-100 text-center h-full">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About Newport Storm FC</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Newport Storm FC was established as a sporting arm of the Australian Islamic Centre
                  to encourage physical fitness, teamwork, and healthy competition within the community.
                  The club competes in local football leagues and welcomes players of all backgrounds
                  and skill levels.
                </p>
                <p>
                  Beyond the pitch, Newport Storm FC serves as a vehicle for social inclusion and youth
                  engagement. The club organises community events, training camps, and social gatherings
                  that strengthen the bonds between players, families, and the broader Newport community.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Newport, Melbourne</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-4">
              Join Newport Storm FC
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Whether you want to play, volunteer, or support from the sidelines,
              there is a place for you at Newport Storm FC.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                href="https://www.newportstormfc.com.au/"
                variant="gold"
                size="lg"
                icon={<ExternalLink className="w-5 h-5" />}
              >
                Visit Website
              </Button>
              <Button
                href="/partners"
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                All Partners
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
