"use client";

import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { FeatureCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SanityService } from "@/types/sanity";
import {
  ArrowRight,
  Sparkles,
  Heart,
  Users,
  BookOpen,
  Award,
  HandHeart,
  Moon,
  Calendar,
  Star,
  Home,
  GraduationCap,
  Church,
} from "lucide-react";

// Map Sanity icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Moon: Moon,
  BookOpen: BookOpen,
  Heart: Heart,
  Users: Users,
  Calendar: Calendar,
  Star: Star,
  Home: Home,
  HandHeart: HandHeart,
  GraduationCap: GraduationCap,
  Church: Church,
  // Fallback mappings for legacy icon names
  prayer: Sparkles,
  mosque: BookOpen,
  heart: Heart,
  support: HandHeart,
  users: Users,
  certificate: Award,
};

interface ServicesSectionProps {
  services: SanityService[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  // Show nothing if no services
  if (services.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-neutral-100 rounded-full blur-3xl opacity-40 -translate-x-1/2" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-40 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Our Services
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Serving Our Community with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">Excellence</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From spiritual guidance to practical support, we offer comprehensive
              services to meet the diverse needs of our community.
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.slice(0, 6).map((service) => {
            const Icon = iconMap[service.icon] || Sparkles;
            return (
              <StaggerItem key={service._id}>
                <FeatureCard
                  icon={<Icon className="w-6 h-6" />}
                  title={service.title}
                  description={service.shortDescription}
                  href={`/services#${service.slug}`}
                />
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <FadeIn delay={0.4}>
          <div className="text-center mt-12">
            <Button
              href="/services"
              variant="outline"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              View All Services
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
