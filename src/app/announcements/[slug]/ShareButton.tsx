"use client";

import { Button } from "@/components/ui/Button";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text: string;
}

export function ShareButton({ title, text }: ShareButtonProps) {
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled the share dialog - this is normal, not an error
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        // For other errors, fall back to clipboard
        fallbackToClipboard();
      }
    } else {
      fallbackToClipboard();
    }
  };

  const fallbackToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      icon={<Share2 className="w-5 h-5" />}
    >
      Share
    </Button>
  );
}
