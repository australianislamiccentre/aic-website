/**
 * Draft Mode Enable (next-sanity Integration)
 *
 * Uses next-sanity's `defineEnableDraftMode` helper to create a GET handler
 * that the Sanity Presentation tool calls to activate Next.js draft mode.
 * Requires a Sanity API read token to authenticate the preview session.
 *
 * @route GET /api/draft-mode/enable
 * @module api/draft-mode/enable
 * @see src/app/api/draft/route.ts        — alternative draft mode toggle
 * @see src/app/api/disable-draft/route.ts — disables draft mode
 */
import { client } from "@/sanity/lib/client";
import { defineEnableDraftMode } from "next-sanity/draft-mode";

/** Sanity client augmented with a read token for authenticated preview queries. */
const clientWithToken = client.withConfig({
  token: process.env.SANITY_API_READ_TOKEN,
});

export const { GET } = defineEnableDraftMode({
  client: clientWithToken,
});
