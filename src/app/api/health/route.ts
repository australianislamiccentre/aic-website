/**
 * Health Check Endpoint
 *
 * Returns 200 with service status for uptime monitoring. Checks:
 * - Server is running (implicit — if this returns, it is)
 * - Sanity CMS is reachable (GROQ query with 2s timeout)
 *
 * Point an uptime monitor (UptimeRobot, Vercel Cron, etc.) at
 * GET /api/health to be alerted when the site goes down.
 *
 * @route GET /api/health
 * @module app/api/health/route
 */
import { NextResponse } from "next/server";

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export async function GET() {
  const status: {
    status: "ok" | "degraded";
    timestamp: string;
    services: { sanity: "ok" | "error" };
  } = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: { sanity: "ok" },
  };

  // Check Sanity reachability with a lightweight query
  if (SANITY_PROJECT_ID) {
    try {
      const query = encodeURIComponent('count(*[_type == "siteSettings"])');
      const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${query}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) {
        status.services.sanity = "error";
        status.status = "degraded";
      }
    } catch {
      status.services.sanity = "error";
      status.status = "degraded";
    }
  }

  return NextResponse.json(status, {
    status: status.status === "ok" ? 200 : 503,
  });
}
