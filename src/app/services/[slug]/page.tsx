/**
 * Service Detail Page
 *
 * Server component that fetches a single service by slug from Sanity and
 * renders its full details using PortableText, including availability,
 * pricing, contact information, and requirements.
 *
 * @route /services/[slug]
 * @module app/services/[slug]/page
 */
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServiceBySlug, getServicesForStaticGeneration } from "@/sanity/lib/fetch";
import { SanityService } from "@/types/sanity";
import { urlFor } from "@/sanity/lib/image";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Heart,
  Users,
  BookOpen,
  HandHeart,
  Moon,
  Calendar,
  Star,
  Home,
  GraduationCap,
  Church,
  Baby,
  Scroll,
  MessageCircle,
  Scale,
} from "lucide-react";
import { ServiceContactForm } from "./ServiceContactForm";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

// Map Sanity icon names to Lucide components — keys match schema values
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Moon,
  Heart,
  BookOpen,
  Users,
  Calendar,
  Star,
  Home,
  HandHeart,
  GraduationCap,
  Church,
  Baby,
  Scroll,
  MessageCircle,
  Scale,
};

// Generate static params for all services
export async function generateStaticParams() {
  const services = (await getServicesForStaticGeneration()) as SanityService[];
  return services.map((service) => ({
    slug: service.slug || service._id,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = (await getServiceBySlug(slug)) as SanityService | null;

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  const ogImage = service.image ? urlFor(service.image).width(1200).height(630).url() : undefined;

  return {
    title: `${service.title} | Australian Islamic Centre`,
    description: service.shortDescription,
    openGraph: {
      title: service.title,
      description: service.shortDescription,
      type: "website",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
  };
}

// Format fee display
function getFeeDisplay(fee: SanityService["fee"]): string {
  if (!fee) return "Contact us";
  switch (fee.type) {
    case "free":
      return "Free";
    case "fixed":
      return fee.amount ? `$${fee.amount}` : "Contact us";
    case "donation":
      return "Donation-based";
    case "contact":
      return "Contact us";
    default:
      return "Contact us";
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = (await getServiceBySlug(slug)) as SanityService | null;

  if (!service) {
    notFound();
  }

  const Icon = iconMap[service.icon] || Sparkles;
  const heroImageUrl = service.image
    ? urlFor(service.image).width(1200).height(500).url()
    : null;

  return (
    <>
      {/* Hero Image Banner */}
      {heroImageUrl && (
        <section className="relative h-64 md:h-80 lg:h-96 bg-gray-900">
          <Image
            src={heroImageUrl}
            alt={service.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        </section>
      )}

      {/* Page Header */}
      <section className={`${heroImageUrl ? 'pt-6' : 'pt-8'} pb-6 bg-white border-b border-gray-100`}>
        <div className="max-w-5xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500">
                <Icon className="w-4 h-4 text-white" />
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {service.title}
              </h1>
            </div>
            {service.shortDescription && (
              <p className="text-base text-gray-500 max-w-2xl">
                {service.shortDescription}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content — 2 column layout */}
      <section className="py-8 md:py-10 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left Column — Main Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Key Features */}
              {service.keyFeatures && service.keyFeatures.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Key Features</h2>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {service.keyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              {service.fullDescription && service.fullDescription.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">About This Service</h2>
                  <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline">
                    <PortableText value={service.fullDescription} />
                  </div>
                </div>
              )}

              {/* Requirements */}
              {service.requirements && service.requirements.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Requirements</h2>
                  <ul className="space-y-2.5">
                    {service.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Process Steps */}
              {service.processSteps && service.processSteps.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Process</h2>
                  <div className="space-y-3">
                    {service.processSteps.map((step, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{step.step}</h3>
                          {step.description && (
                            <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column — Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-5">

                {/* Service Details Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Service Details</h3>
                  <div className="space-y-4">
                    {/* Availability */}
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-gray-900">
                        {service.availability || "By appointment"}
                      </p>
                    </div>

                    {/* Fee */}
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{getFeeDisplay(service.fee)}</p>
                        {service.fee?.note && (
                          <p className="text-xs text-gray-400 mt-0.5">{service.fee.note}</p>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=Australian+Islamic+Centre+23-27+Blenheim+Rd+Newport+VIC+3015"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                      >
                        Australian Islamic Centre
                      </a>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <ServiceContactForm serviceName={service.title} serviceSlug={service.slug} />

                {/* Direct Contact */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact</h3>
                  <div className="space-y-3">
                    <a
                      href={`mailto:${service.contactEmail || "contact@australianislamiccentre.org"}`}
                      className="flex items-center gap-2.5 text-sm text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{service.contactEmail || "contact@australianislamiccentre.org"}</span>
                    </a>
                    <a
                      href={`tel:${service.contactPhone ? service.contactPhone.replace(/\s/g, "") : "0390000177"}`}
                      className="flex items-center gap-2.5 text-sm text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      {service.contactPhone || "03 9000 0177"}
                    </a>
                  </div>
                </div>

                {/* Back Button */}
                <Button
                  href="/services"
                  variant="ghost"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  iconPosition="left"
                  className="w-full"
                >
                  All Services
                </Button>

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
