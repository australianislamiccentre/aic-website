"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface EventContactFormProps {
  eventName: string;
  contactEmail?: string;
}

export function EventContactForm({ eventName, contactEmail }: EventContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/event-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventName,
          contactEmail: contactEmail || "",
          _gotcha: (document.getElementById("_gotcha_event") as HTMLInputElement)?.value || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send inquiry");
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-teal-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Message Sent</h3>
        <p className="text-gray-500 text-sm mb-3">
          We&apos;ll get back to you as soon as possible.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setError(null);
            setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
          }}
          className="text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot */}
        <input
          type="text"
          id="_gotcha_event"
          name="_gotcha"
          autoComplete="off"
          tabIndex={-1}
          className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ev_firstName" className="block text-xs font-medium text-gray-600 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="ev_firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
            />
          </div>
          <div>
            <label htmlFor="ev_lastName" className="block text-xs font-medium text-gray-600 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="ev_lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="ev_email" className="block text-xs font-medium text-gray-600 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="ev_email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
          />
        </div>

        <div>
          <label htmlFor="ev_phone" className="block text-xs font-medium text-gray-600 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="ev_phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
          />
        </div>

        <div>
          <label htmlFor="ev_message" className="block text-xs font-medium text-gray-600 mb-1">
            Message *
          </label>
          <textarea
            id="ev_message"
            name="message"
            required
            rows={3}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm resize-none"
            placeholder={`Question about ${eventName}...`}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
