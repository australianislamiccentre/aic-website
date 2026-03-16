import { NextResponse } from "next/server";

const API_KEY = process.env.FUNDRAISEUP_API_KEY;
const BASE_URL = "https://api.fundraiseup.com/v1/donations";
const CAMPAIGN_ID = "FUNCMFPBUQF"; // Ramadan 30 days
const CACHE_TTL = 5_000; // 5 seconds

interface FundraiseUpDonation {
  id: string;
  created_at: string;
  amount: string;
  currency: string;
  status: string;
  anonymous: boolean;
  campaign: { id: string; name: string } | null;
  supporter: {
    id: string;
    first_name: string;
    last_name: string;
  };
  device: {
    ip: {
      city: string;
      country_name: string;
    };
  } | null;
}

interface CachedData {
  recentDonations: RecentDonation[];
  topSupporters: TopSupporter[];
  totalRaised: number;
  donorCount: number;
  timestamp: number;
}

interface RecentDonation {
  id: string;
  name: string;
  amount: number;
  city: string;
  time: string;
  anonymous: boolean;
}

interface TopSupporter {
  name: string;
  total: number;
  city: string;
  donationCount: number;
}

let cache: CachedData | null = null;

async function fetchAllDonations(): Promise<FundraiseUpDonation[]> {
  if (!API_KEY) return [];

  const allDonations: FundraiseUpDonation[] = [];
  let hasMore = true;
  let cursor: string | null = null;
  let pages = 0;

  while (hasMore && pages < 200) {
    const url = new URL(BASE_URL);
    url.searchParams.set("livemode", "true");
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("starting_after", cursor);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${API_KEY}` },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `[FundraiseUp API] Error ${res.status}: ${await res.text()}`
      );
      break;
    }

    const data = await res.json();
    pages++;

    for (const don of data.data) {
      if (
        don.campaign?.id === CAMPAIGN_ID &&
        don.status === "succeeded"
      ) {
        allDonations.push(don);
      }
    }

    hasMore = data.has_more;
    if (hasMore && data.data.length > 0) {
      cursor = data.data[data.data.length - 1].id;
    } else {
      hasMore = false;
    }
  }

  return allDonations;
}

function parseAmount(amount: string): number {
  return parseFloat(amount.replace(/,/g, ""));
}

function processData(donations: FundraiseUpDonation[]): CachedData {
  const supporterMap = new Map<
    string,
    { name: string; total: number; city: string; count: number; anonymous: boolean }
  >();

  let totalRaised = 0;
  const recentDonations: RecentDonation[] = [];

  for (const don of donations) {
    const amt = parseAmount(don.amount);
    totalRaised += amt;

    const city = don.device?.ip?.city ?? "";
    const anonymous = don.anonymous;
    const name = anonymous
      ? "Anonymous"
      : `${don.supporter.first_name} ${don.supporter.last_name[0]}.`;

    recentDonations.push({
      id: don.id,
      name,
      amount: amt,
      city,
      time: don.created_at,
      anonymous,
    });

    // Aggregate supporters for leaderboard
    const sid = don.supporter.id;
    const existing = supporterMap.get(sid);
    if (existing) {
      existing.total += amt;
      existing.count += 1;
      existing.anonymous = existing.anonymous && anonymous;
    } else {
      supporterMap.set(sid, { name, total: amt, city, count: 1, anonymous });
    }
  }

  // Include named donors + anonymous donors only if total >= $1000
  const topSupporters = Array.from(supporterMap.values())
    .filter((s) => !s.anonymous || s.total >= 1000)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((s) => ({
      name: s.name,
      total: Math.round(s.total * 100) / 100,
      city: s.city,
      donationCount: s.count,
    }));

  return {
    recentDonations: recentDonations.slice(0, 10),
    topSupporters,
    totalRaised: Math.round(totalRaised * 100) / 100,
    donorCount: donations.length,
    timestamp: Date.now(),
  };
}

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "FundraiseUp API key not configured", status: 500 },
      { status: 500 }
    );
  }

  // Return cached data if fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({ data: cache });
  }

  try {
    const donations = await fetchAllDonations();
    cache = processData(donations);
    return NextResponse.json({ data: cache });
  } catch (error) {
    console.error("[FundraiseUp API] Fetch error:", error);

    // Return stale cache if available
    if (cache) {
      return NextResponse.json({ data: cache });
    }

    return NextResponse.json(
      { error: "Failed to fetch donation data", status: 500 },
      { status: 500 }
    );
  }
}
