import { describe, it, expect } from "vitest";
import { pageTitle } from "./seo";

describe("pageTitle", () => {
  it("strips the site name an editor typed, because the layout template appends it (regression: doubled titles)", () => {
    expect(pageTitle("About Us | Australian Islamic Centre", "About Us")).toBe("About Us");
  });

  it("strips the site name after other common separators", () => {
    expect(pageTitle("Donate - Australian Islamic Centre", "Donate")).toBe("Donate");
    expect(pageTitle("Donate – Australian Islamic Centre", "Donate")).toBe("Donate");
  });

  it("keeps a title that doesn't include the site name", () => {
    expect(pageTitle("Weekly Programs", "Events")).toBe("Weekly Programs");
  });

  it("keeps the site name when it's part of the title itself", () => {
    expect(pageTitle("Visiting the Australian Islamic Centre with a school group", "Visit")).toBe(
      "Visiting the Australian Islamic Centre with a school group",
    );
  });

  it("uses the fallback when Sanity has no usable title", () => {
    expect(pageTitle(undefined, "Visit Us")).toBe("Visit Us");
    expect(pageTitle(null, "Visit Us")).toBe("Visit Us");
    expect(pageTitle("   ", "Visit Us")).toBe("Visit Us");
    expect(pageTitle("Australian Islamic Centre", "Visit Us")).toBe("Visit Us");
  });
});
