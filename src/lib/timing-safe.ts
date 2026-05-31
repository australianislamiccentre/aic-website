/**
 * Constant-time secret comparison.
 *
 * Comparing shared secrets with `===` / `!==` short-circuits on the first
 * differing byte, which leaks timing information that can (in principle) be
 * used to recover the secret byte-by-byte. `crypto.timingSafeEqual` compares
 * in constant time, but throws when the two buffers differ in length — so we
 * length-check first (this only leaks the length, never the contents) and
 * treat any null/undefined/non-string input as a non-match (deny by default).
 *
 * Node runtime only (uses `node:crypto`). All API routes that compare secrets
 * run on the Node.js runtime, never the Edge runtime.
 *
 * @module lib/timing-safe
 */
import { timingSafeEqual } from "node:crypto";

/**
 * Returns `true` only if `a` and `b` are both strings of equal length with
 * identical bytes, compared in constant time. Any null/undefined/non-string
 * input returns `false`.
 */
export function safeEqual(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
