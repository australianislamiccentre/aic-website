/**
 * Sanity Studio Page
 *
 * Client component that renders the NextStudio wrapper around the Sanity
 * configuration. Acts as the catch-all route for all Sanity Studio tool
 * paths (e.g. /studio/desk, /studio/media).
 *
 * @route /studio/[[...tool]]
 * @module app/studio/[[...tool]]/page
 */
"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
