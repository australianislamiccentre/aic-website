/**
 * Form Embed
 *
 * Client component that renders an external registration or sign-up form
 * inside a collapsible iframe. Validates the embed URL against the built-in
 * trusted providers plus the domains listed in Sanity before rendering.
 *
 * The iframe is only created after mount: a server-rendered iframe starts
 * loading before hydration, and JotForm posts its one `setHeight` message
 * before the listener below exists — leaving the form stuck at MIN_HEIGHT.
 *
 * @module app/events/[slug]/FormEmbed
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ClipboardCheck, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMounted } from "@/hooks/useIsMounted";
import { isAllowedEmbedUrl } from "@/lib/embed-domains";

/** Minimum height so the iframe never collapses to nothing */
const MIN_HEIGHT = 320;

interface FormEmbedProps {
  url: string;
  allowedDomains: string[];
}

/** Inline collapsible form section — open by default, toggleable */
export function FormEmbedSection({ url, allowedDomains }: FormEmbedProps) {
  const [open, setOpen] = useState(true);
  const [iframeHeight, setIframeHeight] = useState<number>(MIN_HEIGHT);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isMounted = useIsMounted();

  // Listen for postMessage height updates from the embedded form.
  // JotForm sends: { type: "jotform-height", height: N }  or  "setHeight:N:frameId"
  // Typeform and others send similar messages.
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Only accept messages from the iframe's origin
      try {
        const iframeOrigin = new URL(url).origin;
        if (event.origin !== iframeOrigin) return;
      } catch {
        return;
      }

      let height: number | null = null;

      // JotForm string format: "setHeight:800:iframeId"
      if (typeof event.data === "string" && event.data.startsWith("setHeight:")) {
        const parts = event.data.split(":");
        height = parseInt(parts[1], 10);
      }

      // Object format (JotForm, Typeform, generic): { height: N } or { type: "...", height: N }
      if (typeof event.data === "object" && event.data !== null) {
        const h = event.data.height ?? event.data.scrollHeight;
        if (typeof h === "number") {
          height = h;
        } else if (typeof h === "string") {
          height = parseInt(h, 10);
        }
      }

      if (height && !isNaN(height) && height >= MIN_HEIGHT) {
        setIframeHeight(height);
      }
    },
    [url]
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [open, handleMessage]);

  if (!isAllowedEmbedUrl(url, allowedDomains)) {
    return null;
  }

  return (
    <section id="registration-form" className="bg-green-50/60 border-t border-green-100">
      <div className="max-w-5xl mx-auto px-6">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
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
          {isMounted ? (
            /* sandbox: allow-same-origin is required for JotForm/Typeform to function;
               allow-top-navigation and allow-popups-to-escape-sandbox removed for security */
            <iframe
              ref={iframeRef}
              src={url}
              title="Registration Form"
              className="w-full border-0 rounded-xl transition-[height] duration-200"
              style={{ height: `${iframeHeight}px` }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              allow="payment"
              referrerPolicy="no-referrer"
            />
          ) : (
            // Same footprint as the iframe so nothing shifts when it mounts
            <div aria-hidden="true" className="w-full" style={{ height: `${iframeHeight}px` }} />
          )}
        </div>
      )}
    </section>
  );
}
