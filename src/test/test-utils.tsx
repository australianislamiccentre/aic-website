import { render, RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";

// Add providers here if needed (e.g., ThemeProvider, QueryClientProvider)
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
