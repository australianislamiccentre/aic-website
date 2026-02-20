import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServiceBySlug, getServicesForStaticGeneration } from "@/sanity/lib/fetch";
import { SanityService } from "@/types/sanity";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { PortableText } from "@portabletext/react";
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

  return {
    title: `${service.title} | Australian Islamic Centre`,
    description: service.shortDescription,
    openGraph: {
      title: service.title,
      description: service.shortDescription,
      type: "website",
    },
  };
}

// Format fee display
function getFeeDisplay(fee: SanityService["fee"]): string {
  if (!fee) return "Contact us for details";
  switch (fee.type) {
    case "free":
      return "Free";
    case "fixed":
      return fee.amount ? `$${fee.amount}` : "Contact us for details";
    case "donation":
      return "Donation-based";
    case "contact":
      return "Contact us for details";
    default:
      return "Contact us for details";
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = (await getServiceBySlug(slug)) as SanityService | null;

  if (!service) {
    notFound();
  }

  const Icon = iconMap[service.icon] || Sparkles;

  return (
    <>
      {/* Page Header */}
      <section className="pt-8 pb-8 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <BreadcrumbLight />
          <div className="mt-8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {service.title}
              </h1>
              <p className="text-gray-600 max-w-2xl">
                {service.shortDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Content */}
      <section className="py-12 md:py-16 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content - Left side */}
            <div className="lg:col-span-2">
              {/* Service Info Cards */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {/* Availability */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Clock className="w-5 h-5 text-teal-600" />
                    </div>
                    <span className="text-sm text-gray-500">Availability</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {service.availability || "By appointment"}
                  </p>
                </div>

                {/* Fee */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-sm text-gray-500">Fee</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {getFeeDisplay(service.fee)}
                  </p>
                </div>

                {/* Location */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-500">Location</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    Australian Islamic Centre
                  </p>
                </div>
              </div>

              {/* Key Features */}
              {service.keyFeatures && service.keyFeatures.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {service.keyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              {service.fullDescription && service.fullDescription.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About This Service</h2>
                  <div className="prose prose-gray max-w-none">
                    <PortableText value={service.fullDescription} />
                  </div>
                </div>
              )}

              {/* Requirements */}
              {service.requirements && service.requirements.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                  <ul className="space-y-3">
                    {service.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Process Steps */}
              {service.processSteps && service.processSteps.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Process</h2>
                  <div className="space-y-4">
                    {service.processSteps.map((step, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 bg-neutral-50 rounded-xl"
                      >
                        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{step.step}</h3>
                          {step.description && (
                            <p className="text-gray-600 text-sm mt-1">
                              {step.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Button */}
              <div className="pt-6 border-t border-gray-200">
                <Button
                  href="/services"
                  variant="outline"
                  icon={<ArrowLeft className="w-5 h-5" />}
                >
                  All Services
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Contact Form */}
                <ServiceContactForm serviceName={service.title} serviceSlug={service.slug} />

                {/* Direct Contact Info */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Prefer to contact us directly?
                  </h3>
                  <div className="space-y-3 mt-4">
                    <a
                      href={`mailto:${service.contactEmail || "contact@australianislamiccentre.org"}`}
                      className="flex items-center gap-3 w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="text-sm font-medium">Email Us</span>
                    </a>
                    <a
                      href={`tel:${service.contactPhone ? service.contactPhone.replace(/\s/g, "") : "0390000177"}`}
                      className="flex items-center gap-3 w-full px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="text-sm font-medium">{service.contactPhone || "03 9000 0177"}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More Services Section */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">More Services</h2>
          <p className="text-gray-600 mb-6">
            Discover other services offered by the Australian Islamic Centre.
          </p>
          <Button href="/services" variant="primary">
            View All Services
          </Button>
        </div>
      </section>
    </>
  );
}
