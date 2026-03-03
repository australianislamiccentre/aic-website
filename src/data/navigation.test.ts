import { describe, it, expect } from "vitest";
import {
  headerNavGroups,
  footerNavGroups,
  buildAffiliateLinks,
} from "./navigation";

describe("navigation data", () => {
  describe("headerNavGroups", () => {
    it("has exactly 4 groups", () => {
      expect(headerNavGroups).toHaveLength(4);
    });

    it("contains About, What's On, Our Mosque, Media & Resources", () => {
      const labels = headerNavGroups.map((g) => g.label);
      expect(labels).toEqual([
        "About",
        "What's On",
        "Our Mosque",
        "Media & Resources",
      ]);
    });

    it("every link has a name and href", () => {
      for (const group of headerNavGroups) {
        for (const link of group.links) {
          expect(link.name).toBeTruthy();
          expect(link.href).toBeTruthy();
        }
      }
    });

    it("all hrefs start with /", () => {
      for (const group of headerNavGroups) {
        for (const link of group.links) {
          expect(link.href.startsWith("/")).toBe(true);
        }
      }
    });
  });

  describe("footerNavGroups", () => {
    it("includes all header groups plus Get Involved", () => {
      const labels = footerNavGroups.map((g) => g.label);
      expect(labels).toContain("About");
      expect(labels).toContain("What's On");
      expect(labels).toContain("Our Mosque");
      expect(labels).toContain("Media & Resources");
      expect(labels).toContain("Get Involved");
    });

    it("Get Involved contains Donate, Contact Us, Volunteer", () => {
      const getInvolved = footerNavGroups.find(
        (g) => g.label === "Get Involved"
      );
      expect(getInvolved).toBeDefined();
      const names = getInvolved!.links.map((l) => l.name);
      expect(names).toContain("Donate");
      expect(names).toContain("Contact Us");
      expect(names).toContain("Volunteer");
    });
  });

  describe("buildAffiliateLinks", () => {
    it("returns 3 external links", () => {
      const links = buildAffiliateLinks({
        college: "https://college.test",
        bookstore: "https://bookstore.test",
        newportStorm: "https://storm.test",
      });
      expect(links).toHaveLength(3);
      expect(links.every((l) => l.external)).toBe(true);
    });

    it("uses provided URLs", () => {
      const links = buildAffiliateLinks({
        college: "https://example.com/college",
        bookstore: "https://example.com/bookstore",
        newportStorm: "https://example.com/storm",
      });
      expect(links[0].href).toBe("https://example.com/college");
      expect(links[1].href).toBe("https://example.com/bookstore");
      expect(links[2].href).toBe("https://example.com/storm");
    });
  });
});
