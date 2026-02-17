import { createClient } from "next-sanity";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Skip ISR cache

export async function GET() {
  // Fresh client with NO CDN cache
  const freshClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: "2024-01-01",
    useCdn: false, // Bypass Sanity CDN
    perspective: "published", // Only published docs
  });

  const prayerSettings = await freshClient.fetch(`*[_type == "prayerSettings"][0] {
    taraweehEnabled, taraweehTime,
    eidFitrActive, eidFitrTime,
    eidAdhaActive, eidAdhaTime,
    _updatedAt
  }`);

  return NextResponse.json({
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    prayerSettings,
    timestamp: new Date().toISOString(),
  });
}
