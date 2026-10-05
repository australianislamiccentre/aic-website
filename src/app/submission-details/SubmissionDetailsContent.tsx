/**
 * Request Submission Details — Client Component
 *
 * One button that asks the server to email a submission's full record to IT,
 * with sending, sent, error and invalid-link states.
 *
 * @module app/submission-details/SubmissionDetailsContent
 */
"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SubmissionDetailsContentProps {
  /** The record path from the link. */
  record: string | null;
  /** The link's signature. */
  sig: string | null;
  /** The submission ID, shown so staff can match it to the email. */
  reference: string | null;
  /** Whether the link carries this site's signature. */
  valid: boolean;
}

type Status = "idle" | "sending" | "sent" | "error";

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          {icon}
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-3">{title}</h1>
        <div aria-live="polite">{children}</div>
      </div>
    </section>
  );
}

export default function SubmissionDetailsContent({ record, sig, reference, valid }: SubmissionDetailsContentProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  if (!valid) {
    return (
      <Card icon={<AlertTriangle className="h-6 w-6" aria-hidden="true" />} title="This link isn't valid">
        <p className="text-gray-600">
          It may have been copied incompletely. Contact IT with the reference shown in the email instead.
        </p>
      </Card>
    );
  }

  if (status === "sent") {
    return (
      <Card icon={<CheckCircle2 className="h-6 w-6" aria-hidden="true" />} title="Details sent">
        <p className="text-gray-600">The full details of this submission are on their way to IT.</p>
      </Card>
    );
  }

  async function sendDetails() {
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/submission-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record, sig }),
      });
      if (res.ok) {
        setStatus("sent");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't send the details. Please try again.");
    } catch {
      setError("Couldn't send the details. Check your connection and try again.");
    }
    setStatus("error");
  }

  return (
    <Card icon={<ShieldCheck className="h-6 w-6" aria-hidden="true" />} title="Request submission details">
      <p className="text-gray-600 mb-2">
        Send the full details of this submission, including the sender&apos;s IP address and location, to IT?
      </p>
      <p className="text-sm text-gray-500 mb-6 break-all">Ref {reference}</p>
      {error && (
        <p role="alert" className="text-sm text-red-600 mb-4">
          {error}
        </p>
      )}
      <Button onClick={sendDetails} loading={status === "sending"} disabled={status === "sending"}>
        Send details
      </Button>
    </Card>
  );
}
