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
    },
  },
});
