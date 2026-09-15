import { describe, it, expect } from "vitest";
import { parse, evaluate } from "groq-js";
import {
  donatePageSettingsQuery,
  formSettingsQuery,
  servicesQuery,
  serviceBySlugQuery,
  featuredServicesQuery,
  eventBySlugQuery,
  announcementBySlugQuery,
  announcementsQuery,
  urgentAnnouncementsQuery,
  latestAnnouncementsQuery,
  teamMembersByCategoryQuery,
} from "./queries";

/** Runs a query against an in-memory dataset with real GROQ semantics. */
async function runQuery(
  query: string,
  dataset: object[],
  params: Record<string, unknown> = {},
  timestamp?: Date,
) {
  const value = await evaluate(parse(query, { params }), { dataset, params, timestamp });
  return value.get();
}

describe("announcement expiry (Melbourne calendar date, not UTC now())", () => {
  const announcement = (expiresAt?: string) => ({
    _id: "eid",
    _type: "announcement",
    title: "Eid Prayer",
    active: true,
    featured: true,
    priority: "urgent",
    date: "2026-09-01",
    ...(expiresAt && { expiresAt }),
  });
  // 6:21 pm in Melbourne on 15 Sep — the evening of the expiry day
  const eveningOfExpiryDay = new Date("2026-09-15T08:21:00Z");
  const queries = [
    ["announcementsQuery", announcementsQuery],
    ["urgentAnnouncementsQuery", urgentAnnouncementsQuery],
    ["latestAnnouncementsQuery", latestAnnouncementsQuery],
  ] as const;

  it.each(queries)(
    "%s keeps an announcement up for its whole expiry day (regression: it vanished at 10am)",
    async (_name, query) => {
      const result = await runQuery(query, [announcement("2026-09-15")], { today: "2026-09-15" }, eveningOfExpiryDay);
      expect(result).toHaveLength(1);
    },
  );

  it.each(queries)("%s hides the announcement from the day after it expires", async (_name, query) => {
    const result = await runQuery(query, [announcement("2026-09-15")], { today: "2026-09-16" });
    expect(result).toHaveLength(0);
  });

  it.each(queries)("%s keeps announcements that have no expiry date", async (_name, query) => {
    const result = await runQuery(query, [announcement()], { today: "2026-09-16" });
    expect(result).toHaveLength(1);
  });
});

describe("teamMembersByCategoryQuery", () => {
  it("returns the profile fields the Imams page renders", async () => {
    const member = {
      _id: "imam-1",
      _type: "teamMember",
      name: "Imam Example",
      category: "imam",
      active: true,
      bio: "Leads Friday prayers.",
      qualifications: ["Ijazah in Quran"],
      specializations: ["Tafsir"],
      showContactInfo: true,
      email: "imam@example.com",
      phone: "03 0000 0000",
      officeHours: "Mon–Thu, 10am–2pm",
    };
    const [result] = await runQuery(teamMembersByCategoryQuery, [member], { category: "imam" });
    expect(result).toMatchObject({
      bio: member.bio,
      qualifications: member.qualifications,
      specializations: member.specializations,
      showContactInfo: true,
      email: member.email,
      phone: member.phone,
      officeHours: member.officeHours,
    });
  });
});

describe("GROQ Queries", () => {
  describe("formSettingsQuery", () => {
    it("is defined", () => {
      expect(formSettingsQuery).toBeDefined();
    });

    it("is a string", () => {
      expect(typeof formSettingsQuery).toBe("string");
    });

    it("queries formSettings singleton by ID", () => {
      expect(formSettingsQuery).toContain('_id == "formSettings"');
    });

    it("returns only the first document (singleton)", () => {
      expect(formSettingsQuery).toContain("[0]");
    });

    it("includes contact form fields", () => {
      expect(formSettingsQuery).toContain("contactRecipientEmail");
      expect(formSettingsQuery).toContain("contactEnabled");
      expect(formSettingsQuery).toContain("contactHeading");
      expect(formSettingsQuery).toContain("contactHeadingAccent");
      expect(formSettingsQuery).toContain("contactDescription");
      expect(formSettingsQuery).toContain("contactFormHeading");
      expect(formSettingsQuery).toContain("contactFormDescription");
      expect(formSettingsQuery).toContain("contactInquiryTypes");
      expect(formSettingsQuery).toContain("contactSuccessHeading");
      expect(formSettingsQuery).toContain("contactSuccessMessage");
    });

    it("includes service inquiry fields", () => {
      expect(formSettingsQuery).toContain("serviceInquiryRecipientEmail");
      expect(formSettingsQuery).toContain("serviceInquiryEnabled");
      expect(formSettingsQuery).toContain("serviceInquiryFormHeading");
      expect(formSettingsQuery).toContain("serviceInquiryFormDescription");
      expect(formSettingsQuery).toContain("serviceInquirySuccessHeading");
      expect(formSettingsQuery).toContain("serviceInquirySuccessMessage");
    });

    it("includes newsletter fields", () => {
      expect(formSettingsQuery).toContain("newsletterRecipientEmail");
      expect(formSettingsQuery).toContain("newsletterEnabled");
      expect(formSettingsQuery).toContain("newsletterHeading");
      expect(formSettingsQuery).toContain("newsletterDescription");
      expect(formSettingsQuery).toContain("newsletterButtonText");
      expect(formSettingsQuery).toContain("newsletterSuccessMessage");
    });

    it("does not include unnecessary fields", () => {
      expect(formSettingsQuery).not.toContain("_rev");
      expect(formSettingsQuery).not.toContain("_createdAt");
      expect(formSettingsQuery).not.toContain("_updatedAt");
    });
  });

  describe("donatePageSettingsQuery", () => {
    it("is defined", () => {
      expect(donatePageSettingsQuery).toBeDefined();
    });

    it("is a string", () => {
      expect(typeof donatePageSettingsQuery).toBe("string");
    });

    it("queries donatePageSettings singleton by ID", () => {
      expect(donatePageSettingsQuery).toContain('_id == "donatePageSettings"');
    });

    it("returns only the first document (singleton)", () => {
      expect(donatePageSettingsQuery).toContain("[0]");
    });

    it("includes _id field", () => {
      expect(donatePageSettingsQuery).toContain("_id");
    });

    it("includes hero fields", () => {
      expect(donatePageSettingsQuery).toContain("heroHeading");
      expect(donatePageSettingsQuery).toContain("heroDescription");
    });

    it("includes form element field", () => {
      expect(donatePageSettingsQuery).toContain("formElement");
    });

    it("includes campaigns array with dereference", () => {
      expect(donatePageSettingsQuery).toContain("campaigns[]->");
    });

    it("includes impactStats field", () => {
      expect(donatePageSettingsQuery).toContain("impactStats");
    });

    it("includes dereferenced campaign fields", () => {
      expect(donatePageSettingsQuery).toContain("title");
      expect(donatePageSettingsQuery).toContain("fundraiseUpElement");
      expect(donatePageSettingsQuery).toContain("active");
    });

    it("does not include removed settings fields", () => {
      expect(donatePageSettingsQuery).not.toContain("goalElement");
      expect(donatePageSettingsQuery).not.toContain("donorListElement");
      expect(donatePageSettingsQuery).not.toContain("mapElement");
    });

    it("does not include removed campaign fields", () => {
      // description and image are common words, so check for order specifically
      expect(donatePageSettingsQuery).not.toContain("order");
    });

    it("does not include unnecessary fields", () => {
      expect(donatePageSettingsQuery).not.toContain("_rev");
      expect(donatePageSettingsQuery).not.toContain("_createdAt");
      expect(donatePageSettingsQuery).not.toContain("_updatedAt");
    });
  });

  describe("servicesQuery", () => {
    it("is defined", () => {
      expect(servicesQuery).toBeDefined();
    });

    it("filters by active services", () => {
      expect(servicesQuery).toContain("active != false");
    });

    it("orders by orderRank", () => {
      expect(servicesQuery).toContain("order(orderRank asc)");
    });

    it("includes new highlights field", () => {
      expect(servicesQuery).toContain("highlights");
    });

    it("includes new keyFeatures field", () => {
      expect(servicesQuery).toContain("keyFeatures");
    });

    it("includes new formRecipientEmail field", () => {
      expect(servicesQuery).toContain("formRecipientEmail");
    });

    it("includes core service fields", () => {
      expect(servicesQuery).toContain("title");
      expect(servicesQuery).toContain("shortDescription");
      expect(servicesQuery).toContain("icon");
      expect(servicesQuery).toContain("image");
      expect(servicesQuery).toContain("requirements");
      expect(servicesQuery).toContain("contactEmail");
    });
  });

  describe("serviceBySlugQuery", () => {
    it("is defined", () => {
      expect(serviceBySlugQuery).toBeDefined();
    });

    it("filters by slug parameter", () => {
      expect(serviceBySlugQuery).toContain("slug.current == $slug");
    });

    it("excludes inactive services", () => {
      expect(serviceBySlugQuery).toContain("active != false");
    });

    it("returns a single document", () => {
      expect(serviceBySlugQuery).toContain("[0]");
    });

    it("includes new highlights field", () => {
      expect(serviceBySlugQuery).toContain("highlights");
    });

    it("includes new keyFeatures field", () => {
      expect(serviceBySlugQuery).toContain("keyFeatures");
    });

    it("includes new formRecipientEmail field", () => {
      expect(serviceBySlugQuery).toContain("formRecipientEmail");
    });
  });

  describe("eventBySlugQuery", () => {
    it("excludes inactive events", () => {
      expect(eventBySlugQuery).toContain("active != false");
    });
  });

  describe("announcementBySlugQuery", () => {
    it("excludes inactive announcements", () => {
      expect(announcementBySlugQuery).toContain("active != false");
    });
  });

  describe("featuredServicesQuery", () => {
    it("is defined", () => {
      expect(featuredServicesQuery).toBeDefined();
    });

    it("filters by featured services", () => {
      expect(featuredServicesQuery).toContain("featured == true");
    });

    it("filters by active services", () => {
      expect(featuredServicesQuery).toContain("active != false");
    });

    it("limits results", () => {
      expect(featuredServicesQuery).toContain("[0...6]");
    });
  });
});
