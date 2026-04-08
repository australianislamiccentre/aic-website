/**
 * Seed Partners
 *
 * Creates the AIC's affiliated partner documents (Newport Storm FC, AIC College)
 * using create() for missing docs and patch().set() for fields. Never uses
 * createOrReplace, createIfNotExists, or setIfMissing for content.
 *
 * Touches doc _ids: "partner-newport-storm", "partner-aicc".
 *
 * Usage: npx tsx scripts/seed-partners.ts
 */
import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  apiVersion: "2024-01-01",
  useCdn: false,
});

type Partner = {
  _id: string;
  _type: "partner";
  name: string;
  slug: { _type: "slug"; current: string };
  active: boolean;
  featured: boolean;
  shortDescription: string;
  fullDescription: Array<Record<string, unknown>>;
  icon: string;
  color: string;
  heroTheme: "teal" | "blue" | "green" | "purple" | "orange";
  highlights: Array<{ _key: string; icon: string; title: string; description: string }>;
  aboutHeading: string;
  location: string;
  ctaHeading: string;
  ctaDescription: string;
  ctaButtonLabel: string;
  website: string;
};

const partners: Partner[] = [
  {
    _id: "partner-newport-storm",
    _type: "partner",
    name: "Newport Storm FC",
    slug: { _type: "slug", current: "newport-storm" },
    active: true,
    featured: true,
    shortDescription:
      "Newport Storm Football Club is a community-based sports club affiliated with the Australian Islamic Centre, providing opportunities for youth and adults to participate in competitive football while fostering community bonds.",
    fullDescription: [
      {
        _type: "block",
        _key: "ns-b1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "ns-s1",
            text: "Newport Storm Football Club provides opportunities for youth and adults to participate in competitive football while fostering community bonds and promoting an active lifestyle. The club fields teams across multiple age groups in local football leagues, bringing together players and families from diverse backgrounds.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "ns-b2",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "ns-s2",
            text: "With year-round training sessions, matches, and community events, Newport Storm develops skills, discipline, and teamwork in young athletes while strengthening the bonds of the Australian Islamic Centre community.",
            marks: [],
          },
        ],
      },
    ],
    icon: "trophy",
    color: "from-blue-500 to-blue-600",
    heroTheme: "blue",
    highlights: [
      { _key: "ns-h1", icon: "trophy", title: "Competitive Teams", description: "Fielding teams across multiple age groups in local football leagues." },
      { _key: "ns-h2", icon: "users", title: "Community Spirit", description: "Bringing together players and families from diverse backgrounds." },
      { _key: "ns-h3", icon: "heart", title: "Youth Development", description: "Developing skills, discipline, and teamwork in young athletes." },
      { _key: "ns-h4", icon: "calendar", title: "Year-Round Programs", description: "Training sessions, matches, and community events throughout the season." },
    ],
    aboutHeading: "About Newport Storm FC",
    location: "Newport, Melbourne",
    ctaHeading: "Join Newport Storm FC",
    ctaDescription: "Whether you want to play, volunteer, or support from the sidelines, there is a place for you at Newport Storm FC.",
    ctaButtonLabel: "Visit Website",
    website: "https://www.newportstormfc.com.au/",
  },
  {
    _id: "partner-aicc",
    _type: "partner",
    name: "AIC College",
    slug: { _type: "slug", current: "aicc" },
    active: true,
    featured: true,
    shortDescription:
      "The Australian Islamic Centre College (AICC) is an educational institution that combines academic excellence with Islamic values, preparing students for success in both this world and the hereafter.",
    fullDescription: [
      {
        _type: "block",
        _key: "ac-b1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "ac-s1",
            text: "The Australian Islamic Centre College (AICC) provides quality education that combines academic excellence with Islamic values. The college offers a comprehensive curriculum meeting Australian educational standards while grounding education in Islamic principles and moral development.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "ac-b2",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "ac-s2",
            text: "AICC welcomes students from all backgrounds in a supportive environment, nurturing academic, spiritual, and personal growth in every student. The college prepares young people for success in both this world and the hereafter.",
            marks: [],
          },
        ],
      },
    ],
    icon: "graduation-cap",
    color: "from-teal-500 to-teal-600",
    heroTheme: "teal",
    highlights: [
      { _key: "ac-h1", icon: "graduation-cap", title: "Academic Excellence", description: "Comprehensive curriculum meeting Australian educational standards." },
      { _key: "ac-h2", icon: "book-open", title: "Islamic Values", description: "Education grounded in Islamic principles and moral development." },
      { _key: "ac-h3", icon: "users", title: "Inclusive Community", description: "Welcoming students from all backgrounds in a supportive environment." },
      { _key: "ac-h4", icon: "award", title: "Holistic Development", description: "Nurturing academic, spiritual, and personal growth in every student." },
    ],
    aboutHeading: "About AIC College",
    location: "Newport, Melbourne",
    ctaHeading: "Enrol at AIC College",
    ctaDescription: "Give your child the gift of quality education grounded in Islamic values. Visit the AICC website to learn about enrolment and programs.",
    ctaButtonLabel: "Visit Website",
    website: "https://aicc.vic.edu.au/",
  },
];

const REQUIRED_FIELDS: Array<keyof Partner> = [
  "name",
  "slug",
  "shortDescription",
  "fullDescription",
  "icon",
  "color",
  "website",
];

async function main() {
  console.log("=== Seed Partners ===\n");

  for (const partner of partners) {
    console.log(`Partner: ${partner.name} (${partner._id})`);

    const existing = await client.fetch<{ _id: string } | null>(
      `*[_id == $id][0]{ _id }`,
      { id: partner._id },
    );

    if (!existing) {
      console.log("  · does not exist, creating");
      await client.create({
        _id: partner._id,
        _type: partner._type,
        name: partner.name,
        slug: partner.slug,
      });
    } else {
      console.log("  · already exists, patching fields");
    }

    // Patch all content fields explicitly (overwrites any nulls)
    const { _id, _type, ...fields } = partner;
    void _type;
    await client.patch(_id).set(fields).commit();
    console.log("  · patched");

    // Read-back verify every required field
    const after = await client.fetch<Record<string, unknown> | null>(
      `*[_id == $id][0]`,
      { id: partner._id },
    );
    if (!after) throw new Error(`${partner._id} not found after patch`);
    for (const f of REQUIRED_FIELDS) {
      const v = after[f];
      const ok =
        v !== null &&
        v !== undefined &&
        !(Array.isArray(v) && v.length === 0) &&
        !(typeof v === "string" && v.trim() === "");
      if (!ok) {
        throw new Error(`Verification failed: ${partner._id}.${f} is empty after seed`);
      }
    }
    console.log(`  ✓ verified: name="${after.name}", slug="/${(after.slug as { current?: string })?.current}"\n`);
  }

  console.log("✓ All partners seeded and verified.");
}

main().catch((e) => {
  console.error("\n✗ Error:", e);
  process.exit(1);
});
