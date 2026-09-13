/**
 * Regression guard — /donate must never server-render DOMPurify.
 *
 * On 2026-08-13 the live donate page returned a hard 500 for every visitor.
 * `DonateContent` imported `isomorphic-dompurify`, which drags jsdom into the
 * SSR module graph; on Vercel one of jsdom's transitive deps CommonJS-
 * `require()`s an ES module and throws ERR_REQUIRE_ESM at module evaluation:
 *
 *   Failed to load external module jsdom-…: [ERR_REQUIRE_ESM]: require() of
 *   ES Module @exodus/bytes/encoding-lite.js from
 *   isomorphic-dompurify/node_modules/html-encoding-sniffer/…
 *
 * It never reproduced locally — dev and `next start` both served 200 — because
 * the fault is in how Vercel's bundler externalises jsdom, not in the code path.
 * These tests therefore guard the two invariants that keep it fixed, rather
 * than trying to reproduce the crash.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@/test/test-utils";
import type { DonatePageSettings } from "@/sanity/lib/fetch";

const settings: DonatePageSettings = {
  _id: "donatePageSettings",
  formElement: '<a href="#XMQEKYNP" style="display: none"></a>',
};

describe("/donate SSR safety", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("leaves the widget empty before mount, so SSR never calls DOMPurify", async () => {
    // useIsMounted() returns false during SSR and the first client render.
    vi.doMock("@/hooks/useIsMounted", () => ({ useIsMounted: () => false }));

    const { default: DonateContent } = await import("./DonateContent");
    const { container } = render(<DonateContent settings={settings} />);

    const wrapper = container.querySelector(".fundraise-up-wrapper");
    // The wrapper still renders — the flex layout must be identical either
    // side of hydration — but its contents are deferred.
    expect(wrapper).not.toBeNull();
    expect(wrapper?.innerHTML).toBe("");
  });

  it("injects the sanitised snippet once mounted", async () => {
    vi.doMock("@/hooks/useIsMounted", () => ({ useIsMounted: () => true }));

    const { default: DonateContent } = await import("./DonateContent");
    const { container } = render(<DonateContent settings={settings} />);

    const wrapper = container.querySelector(".fundraise-up-wrapper");
    expect(wrapper?.querySelector('a[href="#XMQEKYNP"]')).not.toBeNull();
  });

  it("does not depend on isomorphic-dompurify", () => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8")
    );
    expect(pkg.dependencies).not.toHaveProperty("isomorphic-dompurify");
    expect(pkg.dependencies).toHaveProperty("dompurify");
  });

  it("imports the browser-only dompurify build, not the isomorphic one", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/donate/DonateContent.tsx"),
      "utf8"
    );
    expect(source).toMatch(/from ["']dompurify["']/);
    expect(source).not.toMatch(/from ["']isomorphic-dompurify["']/);
  });
});
