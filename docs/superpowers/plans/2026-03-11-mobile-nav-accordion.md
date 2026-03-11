# Mobile Nav Accordion Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the HeaderB mobile menu grid layout with an accordion-style menu where group titles expand to reveal sub-links, with polished Framer Motion animations.

**Architecture:** Modify only the overlay section of `HeaderB.tsx` (lines 451-627). Replace the grid layout with a vertical accordion list. Add `expandedGroup` state. Desktop behaviour is unchanged — the overlay is used at all breakpoints but the accordion layout is naturally mobile-friendly.

**Tech Stack:** React 19, Framer Motion, Tailwind CSS 4, lucide-react (Plus icon)

**Spec:** `docs/superpowers/specs/2026-03-11-mobile-nav-accordion-design.md`

---

## Chunk 1: Implementation

### Task 1: Update motion variants for accordion menu

**Files:**
- Modify: `src/components/layout/HeaderB.tsx` (lines 87-113 — variant definitions)

- [ ] **Step 1: Replace the motion variants block**

Replace the existing `panelVariants`, `groupContainerVariants`, `groupItemVariants`, and `donateCardVariants` (lines 87-113) with accordion-specific variants:

```tsx
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const menuContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
  exit: {
    transition: { duration: 0.2 },
  },
};

const menuItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const accordionContentVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1, transition: { height: { duration: 0.3, ease: "easeOut" }, opacity: { duration: 0.25, delay: 0.05 } } },
  exit: { height: 0, opacity: 0, transition: { height: { duration: 0.25, ease: "easeOut" }, opacity: { duration: 0.15 } } },
};
```

- [ ] **Step 2: Add Plus import**

Add `Plus` to the lucide-react import (line 32-46). Add it alongside existing icons:

```tsx
import {
  Menu,
  X,
  Search,
  Heart,
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  Landmark,
  Play,
  MessageCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
```

- [ ] **Step 3: Run type-check**

Run: `npm run type-check`
Expected: PASS (no type errors)

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/HeaderB.tsx
git commit -m "refactor: update motion variants for accordion mobile nav"
```

---

### Task 2: Add accordion state and replace overlay content

**Files:**
- Modify: `src/components/layout/HeaderB.tsx` (lines 245-633 — component body)

- [ ] **Step 1: Add expandedGroup state**

Inside the `HeaderB` component, after the existing `searchOpen` state (line 250), add:

```tsx
const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
```

- [ ] **Step 2: Add toggle handler**

After the `handleOverlayNavClick` callback (line 311), add:

```tsx
const toggleGroup = useCallback((label: string) => {
  setExpandedGroup((prev) => (prev === label ? null : label));
}, []);
```

- [ ] **Step 3: Reset expanded group when overlay closes**

In the existing body-scroll `useEffect` (line 263-272), add a reset when overlay closes. Replace:

```tsx
useEffect(() => {
  if (overlayOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
  return () => {
    document.body.style.overflow = "";
  };
}, [overlayOpen]);
```

With:

```tsx
useEffect(() => {
  if (overlayOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
    setExpandedGroup(null);
  }
  return () => {
    document.body.style.overflow = "";
  };
}, [overlayOpen]);
```

- [ ] **Step 4: Replace the overlay panel content**

Replace the entire overlay panel content — from the `{/* Panel */}` comment (line 465) through the closing `</motion.div>` before the `AnimatePresence` closing tag (line 624). Replace with:

```tsx
{/* Panel */}
<motion.div
  ref={overlayRef}
  variants={overlayVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
  transition={{ duration: 0.25 }}
  className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950"
  role="dialog"
  aria-modal="true"
  aria-label="Navigation menu"
>
  {/* Geometric pattern overlay */}
  <div
    className="absolute inset-0 opacity-[0.03] pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
      backgroundSize: "60px 60px",
    }}
  />

  {/* Panel header with logo + close */}
  <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/10">
    <Image
      src="/images/aic logo.png"
      alt="Australian Islamic Centre"
      width={150}
      height={60}
      className="h-14 w-auto object-contain"
    />
    <button
      onClick={() => setOverlayOpen(false)}
      className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:rotate-90"
      aria-label="Close menu"
    >
      <X className="w-6 h-6 text-white" />
    </button>
  </div>

  {/* Accordion nav */}
  <div className="relative px-8 py-8">
    <motion.div
      variants={menuContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-lg"
    >
      {headerNavGroups.map((group) => {
        const isExpanded = expandedGroup === group.label;

        return (
          <motion.div
            key={group.label}
            variants={menuItemVariants}
            className="border-b border-white/10"
          >
            {/* Accordion trigger */}
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between py-4 group/accordion"
              aria-expanded={isExpanded}
            >
              <span className="text-2xl font-bold text-white">
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isExpanded ? 45 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Plus className="w-6 h-6 text-white/50 group-hover/accordion:text-white transition-colors" />
              </motion.span>
            </button>

            {/* Accordion content */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  variants={accordionContentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <ul className="pb-4 pl-1 space-y-1">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "block py-1.5 text-base transition-colors",
                              "text-white/60 hover:text-white",
                            )}
                          >
                            {link.name}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            onClick={() => handleOverlayNavClick(link.href)}
                            className={cn(
                              "block py-1.5 text-base transition-colors",
                              isActive(link.href)
                                ? "text-lime-400"
                                : "text-white/60 hover:text-white",
                            )}
                          >
                            {link.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Contact — standalone link, no accordion */}
      <motion.div variants={menuItemVariants} className="border-b border-white/10">
        <Link
          href="/contact"
          onClick={() => handleOverlayNavClick("/contact")}
          className={cn(
            "block py-4 text-base transition-colors",
            isActive("/contact")
              ? "text-lime-400"
              : "text-white/60 hover:text-white",
          )}
        >
          Contact Us
        </Link>
      </motion.div>

      {/* Donate feature card */}
      <motion.div variants={menuItemVariants} className="mt-8">
        <Link
          href="/donate"
          onClick={() => handleOverlayNavClick("/donate")}
          className="group/donate flex items-center justify-between gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-lime-500/15 to-green-500/10 border border-lime-500/20 hover:border-lime-400/40 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-500/20">
              <Heart className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <span className="block text-base font-semibold text-white">
                Support Our Community
              </span>
              <span className="block text-sm text-white/40">
                Your generosity helps us serve the community
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-lime-400 font-semibold text-sm">
            <span className="hidden sm:inline">Donate</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/donate:translate-x-1" />
          </div>
        </Link>
      </motion.div>
    </motion.div>
  </div>

  {/* Contact info strip */}
  <div className="relative border-t border-white/10 px-8 py-4 mt-auto">
    <div className="flex flex-col gap-3 text-sm text-white/40">
      <div className="flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
        <span>
          {info.address.street}, {info.address.suburb} {info.address.state}{" "}
          {info.address.postcode}
        </span>
      </div>
      <a
        href={`tel:${info.phone}`}
        className="flex items-center gap-2 hover:text-white/70 transition-colors"
      >
        <Phone className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
        <span>{info.phone}</span>
      </a>
      <a
        href={`mailto:${info.email}`}
        className="flex items-center gap-2 hover:text-white/70 transition-colors"
      >
        <Mail className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
        <span>{info.email}</span>
      </a>
    </div>
  </div>
</motion.div>
```

- [ ] **Step 5: Remove unused imports and groupMeta**

Remove these items that are no longer used:
- `groupMeta` constant (lines 75-81) — group icons/descriptions are no longer shown
- `NavLinkItem` component (lines 171-239) — replaced by inline link rendering
- Remove unused icon imports from lucide-react that were only used by `groupMeta` or `NavLinkItem`: `Users`, `Calendar`, `Landmark`, `Play`, `MessageCircle`

Updated import:

```tsx
import {
  Menu,
  X,
  Search,
  Heart,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Plus,
} from "lucide-react";
```

- [ ] **Step 6: Run type-check and lint**

Run: `npm run type-check && npm run lint`
Expected: PASS (no new errors)

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/HeaderB.tsx
git commit -m "feat: replace mobile nav grid with accordion layout"
```

---

### Task 3: Update tests for accordion behaviour

**Files:**
- Modify: `src/components/layout/HeaderB.test.tsx`

- [ ] **Step 1: Update existing tests**

Several tests need updating to match the new accordion structure:

1. The "clicking hamburger opens overlay with all group headings visible" test (line 124-136) — "Get In Touch" heading no longer exists (Contact is a standalone link). Update:

```tsx
it("clicking hamburger opens overlay with all group headings visible", async () => {
  const user = userEvent.setup();
  render(<HeaderB />);

  await user.click(screen.getByLabelText("Open menu"));

  // Group labels are rendered as accordion trigger text
  expect(screen.getByText("About")).toBeInTheDocument();
  expect(screen.getByText("What's On")).toBeInTheDocument();
  expect(screen.getByText("Our Mosque")).toBeInTheDocument();
  expect(screen.getByText("Media & Resources")).toBeInTheDocument();
  // Contact is a standalone link, not a group heading
  expect(screen.getByText("Contact Us")).toBeInTheDocument();
});
```

2. The "does not show group descriptions in overlay" test (line 171-186) — still valid since we removed descriptions, but rename for clarity:

```tsx
it("does not show group descriptions or icons in overlay", async () => {
  const user = userEvent.setup();
  render(<HeaderB />);

  await user.click(screen.getByLabelText("Open menu"));

  expect(screen.queryByText("Learn about our centre")).not.toBeInTheDocument();
  expect(screen.queryByText("Events, services & programs")).not.toBeInTheDocument();
  expect(screen.queryByText("Prayer, worship & visiting")).not.toBeInTheDocument();
  expect(screen.queryByText("Gallery & downloads")).not.toBeInTheDocument();
  expect(screen.queryByText("Connect with us")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Add accordion-specific tests**

Add these new tests after the existing ones:

```tsx
it("sub-links are hidden until accordion group is expanded", async () => {
  const user = userEvent.setup();
  render(<HeaderB />);

  await user.click(screen.getByLabelText("Open menu"));

  // Sub-links should not be visible before expanding
  expect(screen.queryByText("Our Story")).not.toBeInTheDocument();
  expect(screen.queryByText("Events")).not.toBeInTheDocument();
});

it("clicking accordion group reveals its sub-links", async () => {
  const user = userEvent.setup();
  render(<HeaderB />);

  await user.click(screen.getByLabelText("Open menu"));
  await user.click(screen.getByText("About"));

  await waitFor(() => {
    expect(screen.getByText("Our Story")).toBeInTheDocument();
    expect(screen.getByText("Our Imams")).toBeInTheDocument();
    expect(screen.getByText("Affiliated Partners")).toBeInTheDocument();
  });
});

it("only one accordion group can be open at a time", async () => {
  const user = userEvent.setup();
  render(<HeaderB />);

  await user.click(screen.getByLabelText("Open menu"));

  // Open About
  await user.click(screen.getByText("About"));
  await waitFor(() => {
    expect(screen.getByText("Our Story")).toBeInTheDocument();
  });

  // Open What's On — About should close
  await user.click(screen.getByText("What's On"));
  await waitFor(() => {
    expect(screen.getByText("Events")).toBeInTheDocument();
    expect(screen.queryByText("Our Story")).not.toBeInTheDocument();
  });
});

it("accordion trigger has aria-expanded attribute", async () => {
  const user = userEvent.setup();
  render(<HeaderB />);

  await user.click(screen.getByLabelText("Open menu"));

  const aboutButton = screen.getByText("About").closest("button");
  expect(aboutButton).toHaveAttribute("aria-expanded", "false");

  await user.click(screen.getByText("About"));
  expect(aboutButton).toHaveAttribute("aria-expanded", "true");
});

it("Contact Us is a standalone link, not an accordion group", async () => {
  const user = userEvent.setup();
  render(<HeaderB />);

  await user.click(screen.getByLabelText("Open menu"));

  const contactLink = screen.getByText("Contact Us");
  expect(contactLink.tagName).toBe("A");
  expect(contactLink).toHaveAttribute("href", "/contact");
});
```

- [ ] **Step 3: Run tests**

Run: `npm run test:run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/HeaderB.test.tsx
git commit -m "test: update HeaderB tests for accordion mobile nav"
```

---

### Task 4: Final validation

- [ ] **Step 1: Run full validation**

Run: `npm run validate`
Expected: type-check, lint, test, build all PASS

- [ ] **Step 2: Manual check**

Open `localhost:3000` in a mobile viewport (375px). Verify:
- Hamburger opens full-screen dark overlay
- Group titles stagger in one by one
- Tapping a group shows `+` rotating to `×` and sub-links sliding in
- Tapping another group auto-closes the previous one
- Contact Us is a plain link at the bottom
- Donate card appears below
- Close button and Escape key work
- Links navigate correctly and close the menu

- [ ] **Step 3: Commit any fixes**

If any adjustments are needed from manual testing, commit them.
