/**
 * Sanity Environment Variables
 *
 * Validates and exports the required Sanity configuration from environment
 * variables. Throws at startup if NEXT_PUBLIC_SANITY_DATASET or
 * NEXT_PUBLIC_SANITY_PROJECT_ID are missing.
 *
 * @module sanity/env
 */

/** Sanity API version date string. Defaults to "2024-01-01" if not set. */
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}
