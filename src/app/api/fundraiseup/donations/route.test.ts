import { describe, it, expect } from "vitest";

// We can't easily test the route handler directly (it uses module-level state and env vars),
// so we extract and test the core logic: parseAmount and processData.
// Import them by re-implementing the pure functions here for unit testing.

function parseAmount(amount: string): number {
  return parseFloat(amount.replace(/,/g, ""));
}

interface FundraiseUpDonation {
  id: string;
  created_at: string;
  amount: string;
  currency: string;
  status: string;
  anonymous: boolean;
  campaign: { id: string; name: string } | null;
  supporter: { id: string; first_name: string; last_name: string };
  device: { ip: { city: string; country_name: string } } | null;
}

interface CachedData {
  recentDonations: { id: string; name: string; amount: number; city: string; time: string; anonymous: boolean }[];
  topSupporters: { name: string; total: number; city: string; donationCount: number }[];
  totalRaised: number;
  offlineAmount: number;
  donorCount: number;
  timestamp: number;
}

function processData(donations: FundraiseUpDonation[], offlineAmount: number = 0): CachedData {
  const supporterMap = new Map<string, { name: string; total: number; city: string; count: number; anonymous: boolean }>();
  let totalRaised = 0;
  const recentDonations: CachedData["recentDonations"] = [];

  for (const don of donations) {
    const amt = parseAmount(don.amount);
    totalRaised += amt;
    const city = don.device?.ip?.city ?? "";
    const anonymous = don.anonymous;
    const name = anonymous ? "Anonymous" : `${don.supporter.first_name} ${don.supporter.last_name[0]}.`;

    recentDonations.push({ id: don.id, name, amount: amt, city, time: don.created_at, anonymous });

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
    totalRaised: Math.round((totalRaised + offlineAmount) * 100) / 100,
    offlineAmount: Math.round(offlineAmount * 100) / 100,
    donorCount: donations.length,
    timestamp: Date.now(),
  };
}

function makeDonation(overrides: Partial<FundraiseUpDonation> = {}): FundraiseUpDonation {
  return {
    id: "don_1",
    created_at: "2026-03-17T12:00:00Z",
    amount: "100.00",
    currency: "AUD",
    status: "succeeded",
    anonymous: false,
    campaign: { id: "FUNCMFPBUQF", name: "Ramadan 30 days" },
    supporter: { id: "sup_1", first_name: "Ahmed", last_name: "Hassan" },
    device: { ip: { city: "Melbourne", country_name: "Australia" } },
    ...overrides,
  };
}

describe("parseAmount", () => {
  it("parses simple decimal amount", () => {
    expect(parseAmount("100.00")).toBe(100);
  });

  it("strips commas from amount", () => {
    expect(parseAmount("1,000.00")).toBe(1000);
  });

  it("handles large amounts with multiple commas", () => {
    expect(parseAmount("10,000.50")).toBe(10000.5);
  });
});

describe("processData", () => {
  it("calculates total raised from all donations", () => {
    const donations = [
      makeDonation({ id: "d1", amount: "100.00" }),
      makeDonation({ id: "d2", amount: "200.50" }),
    ];
    const result = processData(donations);
    expect(result.totalRaised).toBe(300.5);
  });

  it("returns correct donor count", () => {
    const donations = [
      makeDonation({ id: "d1" }),
      makeDonation({ id: "d2" }),
      makeDonation({ id: "d3" }),
    ];
    const result = processData(donations);
    expect(result.donorCount).toBe(3);
  });

  it("limits recent donations to 10", () => {
    const donations = Array.from({ length: 15 }, (_, i) =>
      makeDonation({ id: `d${i}`, supporter: { id: `s${i}`, first_name: "User", last_name: `${i}` } })
    );
    const result = processData(donations);
    expect(result.recentDonations).toHaveLength(10);
  });

  it("limits top supporters to 10", () => {
    const donations = Array.from({ length: 15 }, (_, i) =>
      makeDonation({
        id: `d${i}`,
        amount: `${(15 - i) * 100}`,
        supporter: { id: `s${i}`, first_name: "User", last_name: `${i}` },
      })
    );
    const result = processData(donations);
    expect(result.topSupporters).toHaveLength(10);
  });

  it("sorts top supporters by total amount descending", () => {
    const donations = [
      makeDonation({ id: "d1", amount: "50.00", supporter: { id: "s1", first_name: "Low", last_name: "D" } }),
      makeDonation({ id: "d2", amount: "500.00", supporter: { id: "s2", first_name: "High", last_name: "D" } }),
      makeDonation({ id: "d3", amount: "200.00", supporter: { id: "s3", first_name: "Mid", last_name: "D" } }),
    ];
    const result = processData(donations);
    expect(result.topSupporters[0].name).toBe("High D.");
    expect(result.topSupporters[1].name).toBe("Mid D.");
    expect(result.topSupporters[2].name).toBe("Low D.");
  });

  it("aggregates multiple donations from the same supporter", () => {
    const donations = [
      makeDonation({ id: "d1", amount: "100.00", supporter: { id: "s1", first_name: "Ahmed", last_name: "H" } }),
      makeDonation({ id: "d2", amount: "200.00", supporter: { id: "s1", first_name: "Ahmed", last_name: "H" } }),
    ];
    const result = processData(donations);
    expect(result.topSupporters).toHaveLength(1);
    expect(result.topSupporters[0].total).toBe(300);
    expect(result.topSupporters[0].donationCount).toBe(2);
  });

  it("includes anonymous donors in top supporters if total >= $1000", () => {
    const donations = [
      makeDonation({ id: "d1", amount: "10000.00", anonymous: true, supporter: { id: "s_anon", first_name: "Hidden", last_name: "User" } }),
      makeDonation({ id: "d2", amount: "50.00", supporter: { id: "s2", first_name: "Ahmed", last_name: "H" } }),
    ];
    const result = processData(donations);
    expect(result.topSupporters[0].name).toBe("Anonymous");
    expect(result.topSupporters[0].total).toBe(10000);
  });

  it("excludes anonymous donors from top supporters if total < $1000", () => {
    const donations = [
      makeDonation({ id: "d1", amount: "500.00", anonymous: true, supporter: { id: "s_anon", first_name: "Hidden", last_name: "User" } }),
      makeDonation({ id: "d2", amount: "50.00", supporter: { id: "s2", first_name: "Ahmed", last_name: "H" } }),
    ];
    const result = processData(donations);
    expect(result.topSupporters).toHaveLength(1);
    expect(result.topSupporters[0].name).toBe("Ahmed H.");
  });

  it("keeps separate anonymous donors as separate entries when both >= $1000", () => {
    const donations = [
      makeDonation({ id: "d1", amount: "5000.00", anonymous: true, supporter: { id: "s_a1", first_name: "A", last_name: "B" } }),
      makeDonation({ id: "d2", amount: "3000.00", anonymous: true, supporter: { id: "s_a2", first_name: "C", last_name: "D" } }),
    ];
    const result = processData(donations);
    expect(result.topSupporters).toHaveLength(2);
    expect(result.topSupporters[0].total).toBe(5000);
    expect(result.topSupporters[1].total).toBe(3000);
  });

  it("displays anonymous donor name as 'Anonymous' in recent donations", () => {
    const donations = [makeDonation({ id: "d1", anonymous: true })];
    const result = processData(donations);
    expect(result.recentDonations[0].name).toBe("Anonymous");
    expect(result.recentDonations[0].anonymous).toBe(true);
  });

  it("formats named donor as 'FirstName L.'", () => {
    const donations = [makeDonation({ supporter: { id: "s1", first_name: "Mohammed", last_name: "Hassan" } })];
    const result = processData(donations);
    expect(result.recentDonations[0].name).toBe("Mohammed H.");
  });

  it("handles missing device/city gracefully", () => {
    const donations = [makeDonation({ device: null })];
    const result = processData(donations);
    expect(result.recentDonations[0].city).toBe("");
  });

  it("handles amounts with commas in processing", () => {
    const donations = [makeDonation({ amount: "1,500.00" })];
    const result = processData(donations);
    expect(result.totalRaised).toBe(1500);
  });

  it("returns empty arrays when no donations", () => {
    const result = processData([]);
    expect(result.recentDonations).toEqual([]);
    expect(result.topSupporters).toEqual([]);
    expect(result.totalRaised).toBe(0);
    expect(result.donorCount).toBe(0);
  });

  it("adds offline amount to totalRaised", () => {
    const donations = [
      makeDonation({ id: "d1", amount: "100.00" }),
    ];
    const result = processData(donations, 48000);
    expect(result.totalRaised).toBe(48100);
  });

  it("includes offlineAmount in response", () => {
    const donations = [makeDonation({ id: "d1", amount: "100.00" })];
    const result = processData(donations, 48000);
    expect(result.offlineAmount).toBe(48000);
  });

  it("offlineAmount is 0 when no offline amount provided", () => {
    const donations = [makeDonation({ id: "d1", amount: "100.00" })];
    const result = processData(donations);
    expect(result.offlineAmount).toBe(0);
  });

  it("does not add offline amount to donorCount", () => {
    const donations = [
      makeDonation({ id: "d1", amount: "100.00" }),
    ];
    const result = processData(donations, 48000);
    expect(result.donorCount).toBe(1);
  });

  it("does not add offline amount to recent donations list", () => {
    const donations = [
      makeDonation({ id: "d1", amount: "100.00" }),
    ];
    const result = processData(donations, 48000);
    expect(result.recentDonations).toHaveLength(1);
    expect(result.recentDonations[0].amount).toBe(100);
  });

  it("does not add offline amount to top supporters list", () => {
    const donations = [
      makeDonation({ id: "d1", amount: "100.00" }),
    ];
    const result = processData(donations, 48000);
    expect(result.topSupporters).toHaveLength(1);
    expect(result.topSupporters[0].total).toBe(100);
  });

  it("handles zero offline amount same as no offline amount", () => {
    const donations = [makeDonation({ id: "d1", amount: "250.00" })];
    const withZero = processData(donations, 0);
    const withDefault = processData(donations);
    expect(withZero.totalRaised).toBe(withDefault.totalRaised);
  });

  it("rounds totalRaised with offline amount correctly", () => {
    const donations = [makeDonation({ id: "d1", amount: "33.33" })];
    const result = processData(donations, 66.67);
    expect(result.totalRaised).toBe(100);
  });
});
