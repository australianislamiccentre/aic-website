/**
 * Sanity client config for the content health check (`npm run check:sanity`).
 *
 * The check audits what the live site renders, so it reads the dataset the
 * same way the site's production `client` does: published content only, with
 * no token. The dataset is public, so no credential is needed.
 *
 * Tokens in the environment are deliberately ignored. An expired
 * `SANITY_API_READ_TOKEN` in `.env.local` used to make every query 401
 * ("Session not found"), failing `npm run validate` against a perfectly
 * healthy dataset. With no token there is nothing to expire.
 */
import type { ClientConfig } from "@sanity/client";

export function buildHealthCheckClientConfig(
  env: Record<string, string | undefined>,
): ClientConfig {
  const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = env.NEXT_PUBLIC_SANITY_DATASET;

  if (!projectId || !dataset) {
    throw new Error(
      "check:sanity needs NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET (set them in .env.local)",
    );
  }

  return {
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: false,
    perspective: "published",
  };
}
