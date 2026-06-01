/**
 * Tests for the Edge middleware Content-Security-Policy.
 *
 * Regression guards for issue #68: the CSP must be ENFORCED (not Report-Only),
 * must use a per-request nonce instead of script-src 'unsafe-inline', and must
 * allow the FundraiseUp runtime hosts so the donate flow keeps working.
 */
import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

function makeRequest(path = "/"): NextRequest {
  return new NextRequest(new URL(`http://localhost:3000${path}`));
}

function csp(res: Response): string {
  return res.headers.get("content-security-policy") ?? "";
}

/** Pull a single directive (e.g. "script-src") out of the CSP string. */
function directive(cspValue: string, name: string): string {
  return cspValue.split(";").map((d) => d.trim()).find((d) => d.startsWith(`${name} `) || d === name) ?? "";
}

afterEach(() => {
  delete process.env.CSP_REPORT_URI;
});

describe("middleware — CSP enforcement (issue #68)", () => {
  it("serves an ENFORCING Content-Security-Policy header, not Report-Only", () => {
    const res = middleware(makeRequest("/donate"));
    expect(res.headers.get("content-security-policy")).toBeTruthy();
    expect(res.headers.get("content-security-policy-report-only")).toBeNull();
  });

  it("uses a per-request nonce on script-src and drops 'unsafe-inline'", () => {
    const value = csp(middleware(makeRequest()));
    const scriptSrc = directive(value, "script-src");
    expect(scriptSrc).toMatch(/'nonce-[A-Za-z0-9+/_-]+={0,2}'/);
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it("keeps 'unsafe-eval' on script-src (required by the FundraiseUp SDK)", () => {
    const scriptSrc = directive(csp(middleware(makeRequest())), "script-src");
    expect(scriptSrc).toContain("'unsafe-eval'");
  });

  it("keeps 'unsafe-inline' on style-src (Tailwind / Next inline styles)", () => {
    const styleSrc = directive(csp(middleware(makeRequest())), "style-src");
    expect(styleSrc).toContain("'unsafe-inline'");
  });

  it("allows https://*.fundraiseup.com on every directive the checkout needs", () => {
    const value = csp(middleware(makeRequest("/donate")));
    for (const name of ["script-src", "style-src", "img-src", "font-src", "frame-src"]) {
      expect(directive(value, name), `${name} must allow *.fundraiseup.com`).toContain(
        "https://*.fundraiseup.com"
      );
    }
  });

  it("allows the FundraiseUp payment ecosystem (Stripe / PayPal / Google Pay / Uploadcare)", () => {
    // Per FundraiseUp's official CSP allow-list — the donation CHECKOUT loads
    // payment SDKs and assets from these third parties (not *.fundraiseup.com).
    const value = csp(middleware(makeRequest("/donate")));
    // Stripe — card field iframe + SDK + telemetry
    expect(directive(value, "script-src")).toContain("https://*.stripe.com");
    expect(directive(value, "frame-src")).toContain("https://*.stripe.com");
    expect(directive(value, "connect-src")).toContain("https://*.stripe.com");
    expect(directive(value, "font-src")).toContain("https://*.stripe.com");
    // PayPal + Google Pay SDKs
    expect(directive(value, "script-src")).toContain("https://*.paypal.com");
    expect(directive(value, "script-src")).toContain("https://pay.google.com");
    // Uploadcare images + FundraiseUp checkout telemetry hosts
    expect(directive(value, "img-src")).toContain("https://ucarecdn.com");
    expect(directive(value, "connect-src")).toContain("https://fndrsp-checkout.net");
    expect(directive(value, "connect-src")).toContain("https://fndrsp.net");
    // Google Pay readiness check hits the apex google.com (not a subdomain)
    expect(directive(value, "connect-src")).toContain("https://google.com");
  });

  it("allows the Cloudflare R2 host serving the hero video (media-src)", () => {
    expect(directive(csp(middleware(makeRequest())), "media-src")).toContain("https://*.r2.dev");
  });

  it("allows Sanity Studio's module CDN (sanity-cdn.com) so /studio's version check isn't blocked", () => {
    expect(directive(csp(middleware(makeRequest("/studio"))), "connect-src")).toContain(
      "https://sanity-cdn.com"
    );
  });

  it("allows the Sentry ingest host (incl. region DSNs like *.ingest.us.sentry.io) in connect-src", () => {
    // Regression: '*.ingest.sentry.io' does NOT match o<org>.ingest.us.sentry.io,
    // which silently broke the Sentry browser SDK once the CSP was enforced.
    const connectSrc = directive(csp(middleware(makeRequest())), "connect-src");
    expect(connectSrc).toContain("https://*.sentry.io");
    expect(connectSrc).not.toContain("https://*.ingest.sentry.io");
  });

  it("generates a different nonce on every request", () => {
    const nonceOf = (res: Response) => csp(res).match(/'nonce-([^']+)'/)?.[1];
    const a = nonceOf(middleware(makeRequest()));
    const b = nonceOf(middleware(makeRequest()));
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    expect(a).not.toBe(b);
  });

  it("threads the nonce onto the request so the app can read it via headers()", () => {
    const res = middleware(makeRequest());
    const nonce = csp(res).match(/'nonce-([^']+)'/)?.[1];
    // NextResponse.next({ request: { headers }}) encodes overridden request
    // headers as `x-middleware-request-<name>` on the response.
    expect(res.headers.get("x-middleware-request-x-nonce")).toBe(nonce);
  });

  it("omits reporting when CSP_REPORT_URI is not configured", () => {
    const res = middleware(makeRequest());
    expect(csp(res)).not.toContain("report-uri");
    expect(csp(res)).not.toContain("report-to");
    expect(res.headers.get("reporting-endpoints")).toBeNull();
  });

  it("adds report-uri/report-to + Reporting-Endpoints when CSP_REPORT_URI is set", () => {
    const endpoint = "https://o1.ingest.sentry.io/api/2/security/?sentry_key=abc";
    process.env.CSP_REPORT_URI = endpoint;
    const res = middleware(makeRequest());
    expect(csp(res)).toContain(`report-uri ${endpoint}`);
    expect(csp(res)).toContain("report-to csp-endpoint");
    expect(res.headers.get("reporting-endpoints")).toContain(`csp-endpoint="${endpoint}"`);
  });

  it("still sets the baseline security headers", () => {
    const res = middleware(makeRequest());
    expect(res.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("strict-transport-security")).toContain("max-age=");
  });
});
