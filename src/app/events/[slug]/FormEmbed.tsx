"use client";

import { useState } from "react";
import { ClipboardCheck, ChevronDown, ChevronUp } from "lucide-react";

function isAllowedUrl(url: string, allowedDomains: string[]): boolean {
  if (allowedDomains.length === 0) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return allowedDomains.some(
      (d) => parsed.hostname === d || parsed.hostname.endsWith("." + d)
    );
  } catch {
    return false;
  }
}

interface FormEmbedProps {
  url: string;
  allowedDomains: string[];
}

/** Inline collapsible form section — open by default, toggleable */
export function FormEmbedSection({ url, allowedDomains }: FormEmbedProps) {
  const [open, setOpen] = useState(true);

  if (!isAllowedUrl(url, allowedDomains)) {
    return null;
  }

  return (
    <section id="registration-form" className="bg-green-50/60 border-t border-green-100">
      <div className="max-w-5xl mx-auto px-6">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-5 group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <ClipboardCheck className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900">Register for this event</h2>
          </div>
          {open ? (
            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          )}
        </button>
      </div>

      {open && (
        <div className="max-w-5xl mx-auto px-6 pb-8">
          <iframe
            src={url}
            title="Registration Form"
            className="w-full border-0 rounded-xl"
            style={{ height: "1400px", overflow: "hidden" }}
            scrolling="no"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
            allow="payment"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </section>
  );
}
