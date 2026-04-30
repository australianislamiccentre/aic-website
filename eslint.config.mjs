import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Allow unused variables/args prefixed with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated / non-project files:
    "docs/**",
    // Claude Code tooling — git worktrees nest a full repo (with its own
    // .next/ build artifacts) under here. Without this ignore, ESLint
    // recurses into nested .next/dev/ files because the top-level
    // ".next/**" pattern only matches the project root.
    ".claude/**",
  ]),
]);

export default eslintConfig;
