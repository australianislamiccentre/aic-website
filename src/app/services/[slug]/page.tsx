import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getServiceBySlug, getServices } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import { SanityService, SanityImage } from "@/types/sanity";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
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
} from "lucide-react";
import { ServiceContactForm } from "./ServiceContactForm";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

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
  prayer: Sparkles,
  mosque: BookOpen,
  heart: Heart,
  support: HandHeart,
  users: Users,
};

// Helper to get image URL
function getImageUrl(image: SanityImage | undefined): string {
  if (!image) return "/images/aic 1.jpg";
  return urlFor(image).width(1200).height(600).url();
}

// Generate static params for all services
export async function generateStaticParams() {
  const services = (await getServices()) as SanityService[];
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

  const imageUrl = getImageUrl(service.image);

  return {
    title: `${service.title} | Australian Islamic Centre`,
    description: service.shortDescription,
    openGraph: {
      title: service.title,
      description: service.shortDescription,
      images: [imageUrl],
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

  const imageUrl = getImageUrl(service.image);
  const Icon = iconMap[service.icon] || Sparkles;

  return (
    <>
      {/* Hero Section with Service Image */}
      <section className="relative h-[40vh] md:h-[50vh] min-h-[300px]">
        <Image
          src={imageUrl}
          alt={service.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-24 left-6 z-10">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
        </div>

        {/* Service Icon Badge */}
        <div className="absolute bottom-6 left-6 z-10">
          <div className="w-14 h-14 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg">
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </section>

      {/* Service Content */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content - Left side */}
            <div className="lg:col-span-2">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {service.title}
              </h1>

              {/* Short Description */}
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {service.shortDescription}
              </p>

              {/* Service Info Cards */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {/* Availability */}
                <div className="bg-neutral-50 rounded-xl p-4">
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
                <div className="bg-neutral-50 rounded-xl p-4">
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
                <div className="bg-neutral-50 rounded-xl p-4">
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

            {/* Sidebar - Contact Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ServiceContactForm serviceName={service.title} />

                {/* Direct Contact Info */}
                <div className="mt-6 bg-neutral-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Prefer to contact us directly?
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="mailto:info@australianislamiccentre.org.au"
                      className="flex items-center gap-3 text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">info@australianislamiccentre.org.au</span>
                    </a>
                    <a
                      href="tel:+61396435555"
                      className="flex items-center gap-3 text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="text-sm">(03) 9643 5555</span>
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
