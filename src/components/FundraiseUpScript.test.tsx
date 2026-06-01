/**
 * Tests for FundraiseUpScript.
 *
 * Under the enforced CSP (issue #68), script-src no longer allows
 * 'unsafe-inline' — the inline FundraiseUp bootstrap only runs if it carries
 * the per-request nonce. These tests prove the nonce reaches the rendered
 * <Script> on BOTH the default and the custom (Sanity) code paths.
 */
import { render } from "@/test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture the props passed to next/script so we can assert the nonce is threaded.
const { captured } = vi.hoisted(() => ({ captured: [] as Array<Record<string, unknown>> }));
vi.mock("next/script", () => ({
  default: (props: Record<string, unknown>) => {
    captured.push(props);
    return null;
  },
}));

import { FundraiseUpScript } from "./FundraiseUpScript";

beforeEach(() => {
  captured.length = 0;
});

describe("FundraiseUpScript — CSP nonce", () => {
  it("applies the nonce to the default bootstrap script", () => {
    render(<FundraiseUpScript settings={null} nonce="nonce-default-123" />);
    expect(captured).toHaveLength(1);
    expect(captured[0].nonce).toBe("nonce-default-123");
  });

  it("applies the nonce to the custom Sanity installation script", () => {
    const settings = {
      organizationKey: "ORGKEY",
      installationScript:
        '<script>(function(){var s="https://cdn.fundraiseup.com/widget/ORGKEY";})()</script>',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<FundraiseUpScript settings={settings as any} nonce="nonce-custom-456" />);
    expect(captured).toHaveLength(1);
    expect(captured[0].nonce).toBe("nonce-custom-456");
  });

  it("renders without a nonce prop without crashing (nonce optional)", () => {
    render(<FundraiseUpScript settings={null} />);
    expect(captured).toHaveLength(1);
    expect(captured[0].nonce).toBeUndefined();
  });
});
