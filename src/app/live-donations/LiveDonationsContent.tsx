"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Moon, Star, User, Trophy, Clock } from "lucide-react";

const POLL_INTERVAL = 5_000; // 5 seconds
const CAMPAIGN_GOAL = 360_000; // $360,000 AUD
const MILESTONES = [5000, 10000, 15000, 20000, 25000, 50000, 75000, 100000, 150000, 200000, 250000, 300000, 360000];

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

interface DonationData {
  recentDonations: RecentDonation[];
  topSupporters: TopSupporter[];
  totalRaised: number;
  offlineAmount: number;
  donorCount: number;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins}m ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  }
  const days = Math.floor(diff / 86400);
  return `${days}d ago`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCompact(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`;
  return `$${amount}`;
}

// Animated number that counts up smoothly
function AnimatedNumber({ value, duration = 700 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;
    prevRef.current = to;

    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{formatCurrency(display)}</>;
}

function AnimatedCount({ value, duration = 700 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;
    prevRef.current = to;

    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display}</>;
}

export default function LiveDonationsContent() {
  const [data, setData] = useState<DonationData | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [milestone, setMilestone] = useState<string | null>(null);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const prevIdsRef = useRef<Set<string>>(new Set());
  const prevTotalRef = useRef(0);
  const fetchCountRef = useRef(0);
  const lastFetchRef = useRef(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/fundraiseup/donations");
      if (!res.ok) return;
      const json = await res.json();
      if (json.data) {
        const incoming = json.data as DonationData;

        // Detect new donations since last fetch
        const incomingIds = new Set(incoming.recentDonations.map((d: RecentDonation) => d.id));
        const freshIds = new Set<string>();
        for (const id of incomingIds) {
          if (!prevIdsRef.current.has(id) && prevIdsRef.current.size > 0) {
            freshIds.add(id);
          }
        }
        prevIdsRef.current = incomingIds;

        if (freshIds.size > 0) {
          setNewIds(freshIds);
          setTimeout(() => setNewIds(new Set()), 2000);
        }

        // Check milestone crossings — show the highest one crossed
        // Skip first 2 fetches (initialisation) so page load never triggers milestones
        fetchCountRef.current += 1;
        const prevTotal = prevTotalRef.current;
        const newTotal = incoming.totalRaised;
        if (fetchCountRef.current > 2 && prevTotal > 0 && newTotal > prevTotal) {
          let highestCrossed: number | null = null;
          for (const m of MILESTONES) {
            if (prevTotal < m && newTotal >= m) {
              highestCrossed = m;
            }
          }
          if (highestCrossed) {
            setMilestone(formatCompact(highestCrossed));
            setTimeout(() => setMilestone(null), 4000);
          }
        }
        prevTotalRef.current = newTotal;

        setData(incoming);
        lastFetchRef.current = Date.now();
        setSecondsSinceUpdate(0);
      }
    } catch {
      // Silently fail — stale data is fine
    }
  }, []);

  useEffect(() => {
    const initialTimeout = setTimeout(fetchData, 0);
    const timer = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(timer);
    };
  }, [fetchData]);

  // Kiosk mode — hide site header, footer, scroll UI
  useEffect(() => {
    document.body.classList.add("kiosk-mode");
    return () => document.body.classList.remove("kiosk-mode");
  }, []);

  // "Last updated" ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      setSecondsSinceUpdate(Math.floor((Date.now() - lastFetchRef.current) / 1000));
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  const progress = data ? Math.min((data.totalRaised / CAMPAIGN_GOAL) * 100, 100) : 0;

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#01476b] via-[#01354f] to-[#011e30]">
      {/* Milestone celebration overlay */}
      {milestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-milestone-overlay">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative animate-milestone-pop text-center px-8 py-12 sm:px-16 sm:py-16 rounded-2xl bg-gradient-to-br from-yellow-400/20 via-[#00ad4c]/20 to-yellow-400/20 border border-yellow-400/30 shadow-2xl shadow-yellow-400/10">
            <div className="text-7xl sm:text-9xl mb-4">&#127881;</div>
            <p className="text-yellow-200 text-lg sm:text-xl font-medium uppercase tracking-widest mb-2">
              Milestone
            </p>
            <p className="text-white text-5xl sm:text-7xl font-bold font-serif drop-shadow-lg mb-3">
              {milestone}
            </p>
            <p className="text-yellow-200/80 text-xl sm:text-2xl font-medium">
              Alhamdulillah!
            </p>
          </div>
        </div>
      )}

      {/* Decorative stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Star className="absolute top-[8%] left-[6%] w-3 h-3 text-yellow-300/30 rotate-12" />
        <Star className="absolute top-[15%] right-[10%] w-4 h-4 text-yellow-200/20 -rotate-6" />
        <Star className="absolute bottom-[20%] left-[15%] w-2.5 h-2.5 text-yellow-300/25 rotate-45" />
        <Star className="absolute bottom-[10%] right-[5%] w-3 h-3 text-yellow-200/20 rotate-12" />
        <Star className="absolute top-[40%] left-[3%] w-2 h-2 text-yellow-300/15 -rotate-12" />
        <Star className="absolute top-[60%] right-[3%] w-2.5 h-2.5 text-yellow-200/15 rotate-30" />
        <Moon className="absolute top-6 right-6 sm:top-8 sm:right-10 w-12 h-12 sm:w-16 sm:h-16 text-yellow-200/10 -rotate-45" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col min-h-screen">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/15 text-yellow-200 text-xs font-medium mb-1">
            <Moon className="w-3.5 h-3.5" />
            Ramadan Campaign
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-serif tracking-tight">
            Live Donations
          </h1>
        </div>

        {/* Donation Goal / Progress */}
        <div className="rounded-lg bg-white/[0.07] border border-white/[0.08] px-4 py-4 mb-3">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <p className="text-white font-bold text-2xl sm:text-3xl">
                {data ? <AnimatedNumber value={data.totalRaised} /> : "$--"}
              </p>
              {data && data.offlineAmount > 0 && (
                <p className="text-white/30 text-xs">
                  (incl. {formatCurrency(data.offlineAmount)} from offline donations/pledges)
                </p>
              )}
            </div>
            <p className="text-white/50 text-sm">
              Goal: {formatCurrency(CAMPAIGN_GOAL)}
            </p>
          </div>
          <div className="relative w-full h-5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00ad4c] to-[#00d45a] transition-all duration-700 ease-out relative"
              style={{ width: `${Math.max(progress, 1)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-white/40 text-xs">
              {data ? (
                <>
                  <AnimatedCount value={data.donorCount} /> donation{data.donorCount !== 1 ? "s" : ""}
                </>
              ) : ""}
            </p>
            <div className="flex items-center gap-3">
              <p className="text-white/40 text-xs">
                {data ? `${progress.toFixed(1)}%` : ""}
              </p>
              {data && (
                <p className="text-white/30 text-[10px] flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {secondsSinceUpdate < 5 ? "just now" : `${secondsSinceUpdate}s ago`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main content: Recent | QR (center) | Top Supporters */}
        <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
          {/* Most Recent Donations — API powered */}
          <div className="flex-1 rounded-lg bg-white/[0.07] border border-white/[0.08] p-3 overflow-auto order-2 lg:order-1">
            <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-yellow-200/70" />
              Recent Donations
            </h2>
            {data?.recentDonations.length ? (
              <div className="space-y-2">
                {data.recentDonations.map((don) => (
                  <div
                    key={don.id}
                    className={`flex items-center justify-between gap-2 py-2 px-3 rounded-md transition-all duration-500 ${
                      newIds.has(don.id)
                        ? "bg-[#00ad4c]/20 ring-1 ring-[#00ad4c]/40"
                        : "bg-white/[0.05]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {newIds.has(don.id) && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ad4c] mr-1.5 animate-pulse" />
                        )}
                        {don.name}
                      </p>
                      <p className="text-white/40 text-[11px]">
                        {don.city ? `${don.city} · ` : ""}
                        {timeAgo(don.time)}
                      </p>
                    </div>
                    <p className="text-[#00ad4c] font-bold text-sm shrink-0">
                      {formatCurrency(don.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-white/30 text-sm">
                Loading donations...
              </div>
            )}
          </div>

          {/* QR Code — Donate CTA (center focus) */}
          <div className="lg:w-[380px] shrink-0 rounded-lg bg-white/[0.07] border border-white/[0.08] p-6 flex flex-col items-center text-center order-1 lg:order-2">
            <div className="bg-white rounded-xl p-4 mb-4">
              <Image
                src="/images/donate-qr.png"
                alt="QR code linking to australianislamiccentre.org/donate"
                width={280}
                height={280}
                className="w-52 h-52 sm:w-64 sm:h-64"
              />
            </div>
            <p className="text-white text-3xl font-bold mb-2">Donate Now</p>
            <p className="text-yellow-200/70 text-lg mb-4 max-w-sm">
              Every good deed in Ramadan is multiplied beyond measure
            </p>
            <p className="text-white/50 text-sm mb-4">Scan to donate</p>
            <a
              href="https://australianislamiccentre.org/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-3.5 rounded-lg bg-[#00ad4c] hover:bg-[#009a43] text-white text-base font-bold transition-colors"
            >
              australianislamiccentre.org/donate
            </a>
          </div>

          {/* Top Supporters — API powered */}
          <div className="flex-1 rounded-lg bg-white/[0.07] border border-white/[0.08] p-3 overflow-auto order-3">
            <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-200/70" />
              Top Supporters
            </h2>
            {data?.topSupporters.length ? (
              <div className="space-y-2">
                {data.topSupporters.map((sup, i) => (
                  <div
                    key={`${sup.name}-${i}`}
                    className="flex items-center gap-3 py-2 px-3 rounded-md bg-white/[0.05]"
                  >
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0
                          ? "bg-yellow-400 text-yellow-900"
                          : i === 1
                            ? "bg-gray-300 text-gray-700"
                            : i === 2
                              ? "bg-amber-600 text-amber-100"
                              : "bg-white/10 text-white/50"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">
                        {sup.name}
                      </p>
                      <p className="text-white/40 text-[11px]">
                        {sup.city
                          ? `${sup.city} · `
                          : ""}
                        {sup.donationCount} donation
                        {sup.donationCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="text-[#00ad4c] font-bold text-sm shrink-0">
                      {formatCurrency(sup.total)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-white/30 text-sm">
                Loading supporters...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS animations and kiosk mode */}
      <style jsx global>{`
        body.kiosk-mode header,
        body.kiosk-mode footer {
          display: none !important;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        @keyframes milestone-overlay {
          0% { opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-milestone-overlay {
          animation: milestone-overlay 4s ease-out forwards;
        }
        @keyframes milestone-pop {
          0% { opacity: 0; transform: scale(0.5); }
          15% { opacity: 1; transform: scale(1.08); }
          30% { transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }
        .animate-milestone-pop {
          animation: milestone-pop 4s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
