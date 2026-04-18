/**
 * Tests for `useIsMounted` — the hook that gates `Date.now()`-dependent render
 * output so SSR and the first client render produce the same HTML.
 *
 * The contract we care about:
 * - When used inside a component rendered via `renderToString` (server
 *   rendering), the hook returns `false`.
 * - When used inside a component rendered via `@testing-library/react`'s
 *   `render` (client rendering), the hook returns `true` once the caller
 *   sees the final DOM — proves the subscribe/getSnapshot semantics fire
 *   the update that flips `false` → `true` after mount.
 */
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { render, screen } from "@/test/test-utils";
import { useIsMounted } from "./useIsMounted";

function MountedBadge() {
  const isMounted = useIsMounted();
  return <span data-testid="badge">{isMounted ? "mounted" : "pending"}</span>;
}

describe("useIsMounted", () => {
  it("returns false during server rendering (SSR)", () => {
    const html = renderToString(<MountedBadge />);
    expect(html).toContain("pending");
    expect(html).not.toContain("mounted");
  });

  it("returns true after mount in a client-rendered component", () => {
    render(<MountedBadge />);
    expect(screen.getByTestId("badge")).toHaveTextContent("mounted");
  });
});
