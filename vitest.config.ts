/**
 * Vitest Configuration
 *
 * Test runner setup for the AIC project. Uses jsdom environment with
 * React plugin. Resolves `@/` alias and mocks `server-only` for tests
 * that import server-side modules.
 *
 * @module vitest.config
 * @see src/test/setup.tsx — global test setup (mocks for Next.js, Sanity, browser APIs)
 * @see src/test/test-utils.tsx — custom render function with providers
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Lock Node's process timezone to Melbourne for all tests. Several time-sensitive
// tests (notably PrayerWidget's countdown) rely on `Date.prototype.setHours` /
// `getHours`, which are local-tz-relative. Devs run locally in Melbourne tz so
// these tests pass, but GitHub Actions runs under UTC and they fail. Pinning
// here (before vitest spawns workers) aligns both environments with the
// Melbourne-first product and keeps assertions deterministic.
process.env.TZ = "Australia/Melbourne";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.tsx"],
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Mock server-only package for tests
      "server-only": path.resolve(__dirname, "./src/test/mocks/server-only.ts"),
      // Mock sanity to avoid styled-components CJS/ESM incompatibility on Node 18
      "sanity": path.resolve(__dirname, "./src/test/mocks/sanity.ts"),
    },
  },
});
