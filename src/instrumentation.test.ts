/**
 * Regression guard — the server instrumentation hook must live in src/.
 *
 * With a `src/` directory, Next's build only registers `src/instrumentation.ts`.
 * The hook previously sat at the project root: it compiled, but was never
 * listed in `.next/required-server-files.json`, never shipped to Vercel, and
 * the Sentry server SDK never started. Sentry saw zero server-side events for
 * months, including every server render of /donate returning 500.
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const hookPath = join(root, "src", "instrumentation.ts");

describe("Next.js server instrumentation hook", () => {
  it("lives in src/, next to app/, where Next's build registers it", () => {
    expect(existsSync(hookPath)).toBe(true);
  });

  it("has no root-level copy, which would compile but never ship", () => {
    expect(existsSync(join(root, "instrumentation.ts"))).toBe(false);
  });

  it("initialises Sentry for the Node.js runtime", () => {
    const source = readFileSync(hookPath, "utf8");
    expect(source).toMatch(/export async function register\(/);
    expect(source).toMatch(/import\(["']\.\.\/sentry\.server\.config["']\)/);
  });

  it("initialises Sentry for the Edge runtime (middleware)", () => {
    const source = readFileSync(hookPath, "utf8");
    expect(source).toMatch(/import\(["']\.\.\/sentry\.edge\.config["']\)/);
  });

  it("forwards server request errors to Sentry", () => {
    const source = readFileSync(hookPath, "utf8");
    expect(source).toMatch(/export const onRequestError = Sentry\.captureRequestError/);
  });
});
