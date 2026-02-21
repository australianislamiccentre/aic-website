"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Calendar, FileText, Users, Book, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: "page" | "event" | "program" | "resource" | "service";
  href: string;
}

const mockResults: SearchResult[] = [
  {
    id: "1",
    title: "Friday Jumu'ah Prayer",
    description: "Join us every Friday for Jumu'ah prayer at 1:15 PM",
    category: "service",
    href: "/services#jumuah",
  },
  {
    id: "2",
    title: "Ramadan Programs 2024",
    description: "Taraweeh prayers, iftar, and special programs during Ramadan",
    category: "event",
    href: "/events",
  },
  {
    id: "3",
    title: "Youth Leadership Program",
    description: "Empowering young Muslims with leadership skills and Islamic values",
    category: "program",
    href: "/events",
  },
  {
    id: "4",
    title: "Marriage Services",
    description: "Islamic marriage ceremonies and pre-marital counselling",
    category: "service",
    href: "/services#marriage",
  },
  {
    id: "5",
    title: "Prayer Times",
    description: "Daily prayer times for the Australian Islamic Centre",
    category: "resource",
    href: "/resources#prayer-times",
  },
  {
    id: "6",
    title: "About Our Centre",
    description: "Learn about the history and mission of the Australian Islamic Centre",
    category: "page",
    href: "/about",
  },
  {
    id: "7",
    title: "Quran Memorization Classes",
    description: "Learn to memorize and recite the Holy Quran with proper tajweed",
    category: "program",
    href: "/events",
  },
  {
    id: "8",
    title: "Architecture & Design",
    description: "Explore the stunning Islamic architecture of our centre",
    category: "page",
    href: "/architecture",
  },
];

const categoryIcons = {
  page: FileText,
  event: Calendar,
  program: Users,
  resource: Book,
  service: Clock,
};

const categoryLabels = {
  page: "Page",
  event: "Event",
  program: "Program",
  resource: "Resource",
  service: "Service",
};

const quickLinks = [
  { name: "Prayer Times", href: "/resources#prayer-times" },
  { name: "Events Calendar", href: "/events" },
  { name: "Make a Donation", href: "/donate" },
  { name: "Visit Us", href: "/visit" },
];

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredResults = useCallback(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return mockResults.filter(
      (result) =>
        result.title.toLowerCase().includes(lowerQuery) ||
        result.description.toLowerCase().includes(lowerQuery) ||
        result.category.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  // Compute results directly from filteredResults
  const computedResults = filteredResults();

  useEffect(() => {
    setResults(computedResults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        window.location.href = results[selectedIndex].href;
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, results, selectedIndex, onClose]);

  // Reset state when dialog opens using a ref to track previous open state
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Dialog just opened
      setQuery("");
      setResults([]);
    }
    prevOpenRef.current = open;
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search for services, events, programs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 text-lg text-gray-900 placeholder-gray-400 outline-none"
                  autoFocus
                />
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="p-2">
                    {results.map((result, index) => {
                      const Icon = categoryIcons[result.category];
                      return (
                        <Link
                          key={result.id}
                          href={result.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-xl transition-colors",
                            index === selectedIndex
                              ? "bg-green-50"
                              : "hover:bg-gray-50"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            index === selectedIndex
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {result.title}
                              </h4>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
                                {categoryLabels[result.category]}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {result.description}
                            </p>
                          </div>
                          <ArrowRight className={cn(
                            "w-5 h-5 flex-shrink-0 transition-colors",
                            index === selectedIndex
                              ? "text-green-600"
                              : "text-gray-300"
                          )} />
                        </Link>
                      );
                    })}
                  </div>
                ) : query.trim() ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No results found for &quot;{query}&quot;</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try searching for events, services, or programs
                    </p>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                      Quick Links
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={onClose}
                          className="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{link.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-mono">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-mono">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-mono">↵</kbd>
                    to select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-mono">esc</kbd>
                  to close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
