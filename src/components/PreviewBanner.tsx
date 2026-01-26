"use client";

import { useRouter } from "next/navigation";

export function PreviewBanner() {
  const router = useRouter();

  const handleDisable = async () => {
    await fetch("/api/disable-draft");
    router.refresh();
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span className="font-medium">Preview Mode</span>
      </div>
      <button
        onClick={handleDisable}
        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
      >
        Exit Preview
      </button>
    </div>
  );
}
