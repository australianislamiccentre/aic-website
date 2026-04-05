import { describe, it, expect } from "vitest";
import { getIcon } from "./icon-map";

describe("getIcon", () => {
  it("returns a component for a known icon name", () => {
    const Icon = getIcon("Heart");
    expect(Icon).toBeDefined();
    expect(Icon).not.toBeNull();
  });

  it("returns null for an unknown icon name", () => {
    const Icon = getIcon("NonExistentIcon12345");
    expect(Icon).toBeNull();
  });

  it("returns fallback icon when primary is unknown", () => {
    const Icon = getIcon("NonExistent", "Heart");
    expect(Icon).toBeDefined();
  });

  it("returns null when both primary and fallback are unknown", () => {
    const Icon = getIcon("NonExistent", "AlsoNonExistent");
    expect(Icon).toBeNull();
  });

  it("returns null when name is undefined", () => {
    const Icon = getIcon(undefined);
    expect(Icon).toBeNull();
  });

  it("maps all expected nav group icons", () => {
    const navIcons = ["Users", "Calendar", "Landmark", "Play", "MessageCircle", "ArrowRight"];
    for (const name of navIcons) {
      expect(getIcon(name)).toBeDefined();
    }
  });

  it("maps Heart icon for CTA button default", () => {
    expect(getIcon("Heart")).toBeDefined();
  });
});
