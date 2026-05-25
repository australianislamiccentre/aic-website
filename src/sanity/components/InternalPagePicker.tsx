/**
 * InternalPagePicker
 *
 * Sanity Studio custom input for picking ANY active page on the site, not
 * just a hardcoded static list. Queries Sanity at admin time for every
 * published document type that has a public-facing slug route, then offers
 * them grouped alongside the static top-level routes.
 *
 * Use in a schema field via:
 *
 *   defineField({
 *     name: "...",
 *     type: "string",
 *     components: { input: InternalPagePicker },
 *   })
 *
 * The field still stores a plain string (the URL path), so consumers can
 * read it via the same query/types they use today.
 *
 * @module sanity/components/InternalPagePicker
 */
import { useEffect, useState } from "react";
import { Select, Spinner, Stack, Text } from "@sanity/ui";
import { set, unset, useClient } from "sanity";
import type { StringInputProps } from "sanity";

// Top-level static routes. Routes that aren't slug-driven live here so
// they're always in the picker even with an empty Sanity dataset.
const STATIC_ROUTES = [
  { title: "Home", value: "/" },
  { title: "About", value: "/about" },
  { title: "Our Imams", value: "/imams" },
  { title: "Partners", value: "/partners" },
  { title: "Events", value: "/events" },
  { title: "Services", value: "/services" },
  { title: "Announcements", value: "/announcements" },
  { title: "For Worshippers", value: "/worshippers" },
  { title: "Plan Your Visit", value: "/visit" },
  { title: "Architecture", value: "/architecture" },
  { title: "Media Gallery", value: "/media" },
  { title: "Resources", value: "/resources" },
  { title: "Donate", value: "/donate" },
  { title: "Contact", value: "/contact" },
  { title: "Privacy Policy", value: "/privacy" },
  { title: "Terms of Use", value: "/terms" },
];

// One query, multiple buckets. Each bucket fetches only published docs
// with a non-empty slug. Lists capped at 200 so a runaway dataset can't
// freeze the Studio dropdown.
const PAGES_QUERY = /* groq */ `{
  "announcements": *[_type == "announcement" && active != false && defined(slug.current)] | order(date desc) [0...200] {
    title, "slug": slug.current
  },
  "events":        *[_type == "event"        && active != false && defined(slug.current)] | order(date desc) [0...200] {
    title, "slug": slug.current
  },
  "services":      *[_type == "service"      && active != false && defined(slug.current)] | order(title asc)  [0...200] {
    title, "slug": slug.current
  },
  "partners":      *[_type == "partner"      && active != false && defined(slug.current)] | order(name asc)   [0...200] {
    "title": name, "slug": slug.current
  },
  "pages":         *[_type == "pageContent"  && defined(slug.current)]                    | order(title asc)  [0...200] {
    title, "slug": slug.current
  }
}`;

interface PageOption {
  title: string;
  value: string;
}

interface PageGroup {
  label: string;
  options: PageOption[];
}

interface QueryResult {
  announcements: Array<{ title: string; slug: string }>;
  events: Array<{ title: string; slug: string }>;
  services: Array<{ title: string; slug: string }>;
  partners: Array<{ title: string; slug: string }>;
  pages: Array<{ title: string; slug: string }>;
}

export function InternalPagePicker(props: StringInputProps) {
  const { value, onChange, elementProps } = props;
  const client = useClient({ apiVersion: "2024-01-01" });
  const [groups, setGroups] = useState<PageGroup[]>([
    { label: "Site Pages", options: STATIC_ROUTES },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial state already covers loading=true / error=null, so we don't
    // re-set them here. `useClient()` returns a stable instance so this
    // effect runs once on mount — re-runs aren't a real concern.
    let cancelled = false;
    client
      .fetch<QueryResult>(PAGES_QUERY)
      .then((result) => {
        if (cancelled) return;
        const next: PageGroup[] = [
          { label: "Site Pages", options: STATIC_ROUTES },
        ];
        if (result.announcements.length > 0) {
          next.push({
            label: "Announcements",
            options: result.announcements.map((d) => ({
              title: d.title,
              value: `/announcements/${d.slug}`,
            })),
          });
        }
        if (result.events.length > 0) {
          next.push({
            label: "Events",
            options: result.events.map((d) => ({
              title: d.title,
              value: `/events/${d.slug}`,
            })),
          });
        }
        if (result.services.length > 0) {
          next.push({
            label: "Services",
            options: result.services.map((d) => ({
              title: d.title,
              value: `/services/${d.slug}`,
            })),
          });
        }
        if (result.partners.length > 0) {
          next.push({
            label: "Partners",
            options: result.partners.map((d) => ({
              title: d.title,
              value: `/partners/${d.slug}`,
            })),
          });
        }
        if (result.pages.length > 0) {
          next.push({
            label: "Custom Pages",
            options: result.pages.map((d) => ({
              title: d.title,
              value: `/${d.slug}`,
            })),
          });
        }
        setGroups(next);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? "Failed to load pages");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  return (
    <Stack space={2}>
      <Select
        {...elementProps}
        value={value ?? ""}
        onChange={(event) => {
          const v = (event.target as HTMLSelectElement).value;
          onChange(v ? set(v) : unset());
        }}
      >
        <option value="">Select a page…</option>
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.title}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
      {loading && (
        <Stack space={2} style={{ flexDirection: "row", alignItems: "center", display: "flex", gap: 8 }}>
          <Spinner muted />
          <Text size={1} muted>
            Loading site pages…
          </Text>
        </Stack>
      )}
      {error && (
        <Text size={1} style={{ color: "var(--card-badge-critical-fg-color)" }}>
          {error}
        </Text>
      )}
    </Stack>
  );
}
