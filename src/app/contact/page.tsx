"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useFormSettings } from "@/contexts/FormSettingsContext";
import {
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Facebook,
  Instagram,
  Youtube,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ContactPage() {
  const info = useSiteSettings();
  const forms = useFormSettings();

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: info.socialMedia.facebook, color: "hover:bg-blue-600" },
    { name: "Instagram", icon: Instagram, href: info.socialMedia.instagram, color: "hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600" },
    { name: "YouTube", icon: Youtube, href: info.socialMedia.youtube, color: "hover:bg-red-600" },
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      content: info.phone,
      href: `tel:${info.phone}`,
    },
    {
      icon: Mail,
      title: "Email Us",
      content: info.email,
      href: `mailto:${info.email}`,
      external: true,
    },
    {
      icon: Clock,
      title: "Hours",
      content: "4:30 AM \u2013 10:30 PM Daily",
    },
  ];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    inquiryType: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const inquiryLabel = forms.contactInquiryTypes.find(t => t.value === formData.inquiryType)?.label || formData.inquiryType;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          inquiryType: inquiryLabel,
          _gotcha: (document.getElementById("_gotcha") as HTMLInputElement)?.value || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-6 pb-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <BreadcrumbLight />
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            {forms.contactHeading}{forms.contactHeadingAccent ? <> <span className="text-teal-600">{forms.contactHeadingAccent}</span></> : null}
          </h1>
          <p className="text-gray-600">
            {forms.contactDescription}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Contact Form */}
          <FadeIn className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-teal-50 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{forms.contactSuccessHeading}</h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm">
                    {forms.contactSuccessMessage}
                  </p>
                  <Button onClick={() => {
                    setSubmitted(false);
                    setError(null);
                    setFormData({ firstName: "", lastName: "", email: "", phone: "", inquiryType: "", message: "" });
                  }} variant="outline">
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{forms.contactFormHeading}</h2>
                    <p className="text-gray-600 text-sm">{forms.contactFormDescription}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Honeypot field */}
                    <input
                      type="text"
                      id="_gotcha"
                      name="_gotcha"
                      autoComplete="off"
                      tabIndex={-1}
                      className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
                      aria-hidden="true"
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                      <Input
                        label="Last Name"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="+61 400 000 000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <Select
                      label="Enquiry Type"
                      options={forms.contactInquiryTypes}
                      placeholder="Select an enquiry type"
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      required
                    />

                    <Textarea
                      label="Your Message"
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />

                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={loading}
                      icon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </FadeIn>

          {/* Sidebar */}
          <FadeIn direction="right" delay={0.2} className="space-y-5">
            {/* Map */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="relative h-44">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3150.61239393943!2d144.85920877588677!3d-37.84595907196755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad661bb6c337e53%3A0x5e75928ff26d7f72!2sAustralian%20Islamic%20Centre!5e0!3m2!1sen!2sau!4v1771473009809!5m2!1sen!2sau"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Australian Islamic Centre Location"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-2">{info.address.full}</p>
                <a
                  href="https://maps.app.goo.gl/sjUbtLMo1q6AXHi86"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Get Directions
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Contact Details + Social */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">Contact Details</h3>
              <div className="space-y-3 mb-5">
                {contactInfo.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4.5 h-4.5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
                          className="text-sm text-gray-600 hover:text-teal-600 transition-colors"
                        >
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-600">{item.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-base font-bold text-gray-900 mb-3">Follow Us</h3>
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:text-white transition-all ${social.color}`}
                      aria-label={social.name}
                    >
                      <social.icon className="w-4.5 h-4.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
