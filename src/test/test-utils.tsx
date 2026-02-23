/**
 * Test Utilities
 *
 * Custom render function that wraps components with all required providers.
 * Re-exports everything from `@testing-library/react` and `user-event`
 * so test files can import from a single location:
 *
 * ```ts
 * import { render, screen, userEvent } from "@/test/test-utils";
 * ```
 *
 * @module test/test-utils
 */
import { render, RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";

/** Wraps components with all providers needed for testing. Add providers here as needed. */
function AllProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

// Override render method
export { customRender as render };
