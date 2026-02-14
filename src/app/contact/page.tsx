"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { BreadcrumbLight } from "@/components/ui/Breadcrumb";
import { aicInfo } from "@/data/content";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const inquiryTypes = [
  { value: "general", label: "General Enquiry" },
  { value: "services", label: "Services" },
  { value: "programs", label: "Programs & Education" },
  { value: "events", label: "Events" },
  { value: "donations", label: "Donations" },
  { value: "marriage", label: "Nikah Services" },
  { value: "funeral", label: "Funeral Services" },
  { value: "tours", label: "Tours & Visits" },
  { value: "media", label: "Media Interview" },
  { value: "volunteer", label: "Volunteer" },
  { value: "other", label: "Other" },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: aicInfo.socialMedia.facebook, color: "hover:bg-blue-600" },
  { name: "Instagram", icon: Instagram, href: aicInfo.socialMedia.instagram, color: "hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600" },
  { name: "YouTube", icon: Youtube, href: aicInfo.socialMedia.youtube, color: "hover:bg-red-600" },
];

const quickLinks = [
  { label: "Book a Visit", href: "/visit", icon: ArrowRight },
  { label: "Prayer Times", href: "/services#prayer-times", icon: ArrowRight },
  { label: "Nikah Services", href: "/services#nikah", icon: ArrowRight },
  { label: "Make a Donation", href: "/donate", icon: ArrowRight },
];

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    content: `${aicInfo.address.street}, ${aicInfo.address.suburb}`,
    subContent: `${aicInfo.address.state} ${aicInfo.address.postcode}`,
    action: {
      label: "Get Directions",
      href: `https://maps.google.com/?q=${encodeURIComponent(aicInfo.address.full)}`,
      external: true,
    },
  },
  {
    icon: Phone,
    title: "Call Us",
    content: aicInfo.phone,
    action: {
      label: "Call Now",
      href: `tel:${aicInfo.phone}`,
    },
  },
  {
    icon: Mail,
    title: "Email Us",
    content: aicInfo.email,
    action: {
      label: "Send Email",
      href: `mailto:${aicInfo.email}?subject=${encodeURIComponent('Contact Enquiry - Australian Islamic Centre')}`,
      external: true,
    },
  },
  {
    icon: Clock,
    title: "Opening Hours",
    content: "Open Daily: Fajr to Isha",
    subContent: "Office: 9AM - 5PM",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    inquiryType: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build email body with form data
    const inquiryLabel = inquiryTypes.find(t => t.value === formData.inquiryType)?.label || formData.inquiryType;
    const subject = `${inquiryLabel} - Australian Islamic Centre`;
    const body = `Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Enquiry Type: ${inquiryLabel}

Message:
${formData.message}`;

    // Open email client with pre-filled data
    const mailtoLink = `mailto:contact@australianislamiccentre.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');

    setSubmitted(true);
  };

  return (
    <>
      {/* Contact Cards Section */}
      <section className="pt-8 pb-16 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-8">
            <BreadcrumbLight />
          </div>

          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Get in <span className="text-teal-600">Touch</span>
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Have a question or need assistance? We&apos;re here to help.
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.content}</p>
                {item.subContent && (
                  <p className="text-gray-500 text-sm">{item.subContent}</p>
                )}
                {item.action && (
                  <a
                    href={item.action.href}
                    target={item.action.external ? "_blank" : undefined}
                    rel={item.action.external ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    {item.action.label}
                    {item.action.external ? (
                      <ExternalLink className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Form - Takes more space */}
            <FadeIn className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-teal-50 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-teal-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Message Sent!</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Thank you for contacting us. We&apos;ll get back to you as soon as possible.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="outline">
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
                      <p className="text-gray-600">Fill out the form below and we&apos;ll get back to you shortly.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
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

                      <div className="grid sm:grid-cols-2 gap-5">
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
                        options={inquiryTypes}
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

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        icon={<Send className="w-5 h-5" />}
                      >
                        Send Message
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </FadeIn>

            {/* Sidebar */}
            <FadeIn direction="right" delay={0.2} className="lg:col-span-2 space-y-6">
              {/* Quick Links */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {quickLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-gray-700 group-hover:text-teal-600 transition-colors">
                        {link.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Follow Us</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Stay connected with us on social media for updates and community news.
                </p>
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:text-white transition-all ${social.color}`}
                      aria-label={social.name}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Map Preview */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="relative h-48">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3152.4!2d144.88!3d-37.84!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4c2b349649%3A0x2a!2s23-27%20Blenheim%20Rd%2C%20Newport%20VIC%203015!5e0!3m2!1sen!2sau!4v1600000000000!5m2!1sen!2sau"
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
                  <p className="text-sm text-gray-600 mb-3">{aicInfo.address.full}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(aicInfo.address.full)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    Open in Google Maps
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
