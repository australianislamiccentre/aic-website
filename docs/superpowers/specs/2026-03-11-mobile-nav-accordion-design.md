# Mobile Nav Accordion Redesign

## Summary

Replace the current HeaderB mobile menu (grid layout with all links visible) with an accordion-style menu. Group titles are large bold text with a `+` icon; tapping expands to reveal sub-links. Contact is a standalone link at the bottom with no group title.

## Scope

- Mobile menu only (the `overlayOpen` state in `HeaderB.tsx`)
- Desktop hover mega-menu is unchanged
- Navigation data structure (`src/data/navigation.ts`) is unchanged

## Layout

Full-screen dark overlay (`bg-neutral-900`), vertically stacked:

1. **Close button** — top-right X icon (unchanged)
2. **Accordion groups** — left-aligned, `px-8` padding
   - Group title: `text-2xl font-bold text-white` with `+` icon (lucide `Plus`) on the right
   - Sub-links: `text-base text-white/70`, indented slightly, with hover → `text-white`
   - Active page link: `text-lime-400`
   - Separator: subtle `border-b border-white/10` between groups
3. **Contact** — standalone link (no group title), same size as sub-links, separated by divider
4. **Donate button** — stays at bottom (existing pattern)

Groups in order:
- About → Our Story, Our Imams, Affiliated Partners
- What's On → Events, Services, Announcements, Programs
- Our Mosque → For Worshippers, Plan Your Visit, Architecture
- Media & Resources → Media Gallery, Resources
- *(divider)*
- Contact *(standalone link)*
- Donate button

## Accordion Behaviour

- **Single-open**: only one group expanded at a time; opening one auto-closes the previous
- State: `expandedGroup: string | null`

## Animations (Framer Motion)

### Menu Open
- Overlay fades in: `opacity: 0 → 1`, 0.25s, `easeOut`
- Each accordion group staggers in: `y: 20 → 0`, `opacity: 0 → 1`, 0.05s delay between items
- Contact link and Donate button stagger in last after groups

### Menu Close
- Everything fades out together: `opacity: 1 → 0`, 0.2s — no stagger on exit

### Accordion Expand
- Height: `0 → auto`, 0.3s, `easeOut`
- Sub-links fade in simultaneously as height opens
- `+` icon rotates 45° to form `×`

### Accordion Collapse
- Height: `auto → 0`, 0.25s, `easeOut`
- Sub-links fade out
- `×` rotates back to `+`

### Respects `prefers-reduced-motion`
- All animations wrapped in `motion-safe` or checked via media query

## Accessibility

Preserved from current implementation:
- Focus trap within overlay
- Escape key closes menu
- Body scroll locked when open
- `aria-expanded` on accordion trigger buttons
- `aria-label` on close button
- `role="dialog"` and `aria-modal="true"` on overlay
- Focus returns to hamburger button on close

## Files Modified

- `src/components/layout/HeaderB.tsx` — mobile menu section only (desktop unchanged)

## Files NOT Modified

- `src/data/navigation.ts` — existing `headerNavGroups` structure works as-is
- Desktop mega-menu in HeaderB — untouched
- `Header.tsx` — not active, not modified
