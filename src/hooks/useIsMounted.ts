/**
 * React hook that returns `false` during SSR and the first client render
 * (hydration), then flips to `true` once the component has mounted on the
 * client.
 *
 * Use this to gate any render output that depends on `Date.now()` or other
 * inherently non-deterministic values (e.g. countdown text like "in 3 min",
 * "5 minutes ago", relative timestamps). The SSR HTML will show the
 * placeholder branch; the client takes over after mount without a hydration
 * mismatch.
 *
 * Implemented via `useSyncExternalStore` with a no-op subscribe so it never
 * re-renders on its own and doesn't trip the `react-hooks/set-state-in-effect`
 * lint rule.
 *
 * Lives in its own file (separate from `src/lib/time.ts`) so the pure tz
 * helpers there can be imported from server components without pulling the
 * React hook into server-only module graphs.
 *
 * @example
 *   const isMounted = useIsMounted();
 *   const label = isMounted ? formatRelativeTime(donationDate) : "";
 *   return <span>{label}</span>;
 *
 * @module hooks/useIsMounted
 * @see src/lib/time.ts — the related Melbourne-tz helpers
 */
import { useSyncExternalStore } from "react";

const noopSubscribe: (onStoreChange: () => void) => () => void = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

export function useIsMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, alwaysTrue, alwaysFalse);
}
