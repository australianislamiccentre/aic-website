/**
 * aic-website.vercel.app sits behind Vercel Deployment Protection: every
 * request redirects to a Vercel login page. Anything the site, its emails or
 * the Studio load from that host silently breaks — the logo in every form
 * email did. Use https://australianislamiccentre.org instead.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const PROTECTED_HOST = "aic-website.vercel.app";
// Match URLs, not comments that explain why the host is avoided
const PROTECTED_URL = `://${PROTECTED_HOST}`;

function runtimeSourceFiles(): string[] {
  const srcFiles = readdirSync(path.join(root, "src"), { recursive: true, encoding: "utf8" })
    .filter((file) => /\.(ts|tsx)$/.test(file) && !/\.test\.(ts|tsx)$/.test(file))
    .map((file) => path.join("src", file));
  return [...srcFiles, "sanity.config.ts"];
}

describe("login-protected Vercel host", () => {
  it(`is not used as a URL by any runtime source file (${PROTECTED_HOST})`, () => {
    const offenders = runtimeSourceFiles().filter((file) =>
      readFileSync(path.join(root, file), "utf8").includes(PROTECTED_URL),
    );
    expect(offenders).toEqual([]);
  });
});
