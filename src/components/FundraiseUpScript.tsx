"use client";

import Script from "next/script";
import { DonationSettings } from "@/sanity/lib/fetch";

interface FundraiseUpScriptProps {
  settings: DonationSettings | null;
}

// Default organization key (fallback if not set in Sanity)
const DEFAULT_ORG_KEY = "AGUWBDNC";

// Extract JavaScript content from HTML script tags
function extractScriptContent(html: string): string {
  // If it contains <script> tags, extract the content between them
  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch) {
    return scriptMatch[1].trim();
  }
  // If no script tags, return as-is (assume it's raw JS)
  return html.trim();
}

export function FundraiseUpScript({ settings }: FundraiseUpScriptProps) {
  // Use custom script from Sanity if provided, otherwise use default
  const customScript = settings?.installationScript;
  const orgKey = settings?.organizationKey || DEFAULT_ORG_KEY;

  // If there's a custom script in Sanity, extract the JS and use it
  if (customScript) {
    const scriptContent = extractScriptContent(customScript);
    return (
      <Script
        id="fundraise-up"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: scriptContent,
        }}
      />
    );
  }

  // Default Fundraise Up installation script
  return (
    <Script
      id="fundraise-up"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,n,a){if(!w[n]){var l='call,catch,on,once,set,then,track,openCheckout'
.split(','),i,o=function(n){return'function'==typeof n?o.l.push([arguments])&&o
:function(){return o.l.push([n,arguments])&&o}},t=d.getElementsByTagName(s)[0],
j=d.createElement(s);j.async=!0;j.src='https://cdn.fundraiseup.com/widget/'+a+'';
t.parentNode.insertBefore(j,t);o.s=Date.now();o.v=5;o.h=w.location.href;o.l=[];
for(i=0;i<8;i++)o[l[i]]=o(l[i]);w[n]=o}
})(window,document,'script','FundraiseUp','${orgKey}');`,
      }}
    />
  );
}
