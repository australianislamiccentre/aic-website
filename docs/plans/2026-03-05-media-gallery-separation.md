# Media Gallery Separation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Separate media page photos (singleton with image array, bulk upload) from general website images (existing `galleryImage` documents), and replace the masonry grid with a compact album-preview UI.

**Architecture:** New `mediaGallery` singleton schema with an `images` array field for the /media page. Existing `galleryImage` schema stays for homepage use but gets clearer naming. MediaContent swaps from `SanityGalleryImage[]` prop to `MediaGalleryImage[]` prop. UI changes from masonry grid to hero image + thumbnails + `+N` tile.

**Tech Stack:** Sanity CMS schemas, GROQ, Next.js App Router, React, Tailwind CSS, Vitest + Testing Library

---

### Task 1: Create `mediaGallery` Sanity Schema

**Files:**
- Create: `src/sanity/schemas/mediaGallery.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Create the schema file**

Create `src/sanity/schemas/mediaGallery.ts`:

```typescript
/**
 * Sanity Schema: Media Page Gallery
 *
 * Singleton document containing all photos displayed on the /media page.
 * Supports bulk upload — drag-and-drop multiple images into the array.
 * First image in the array is the hero/main image.
 *
 * @module sanity/schemas/mediaGallery
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "mediaGallery",
  title: "Media Page Gallery",
  type: "document",
  description: "Photos displayed on the /media page. Upload multiple images at once by dragging them into the images field.",
  fields: [
    defineField({
      name: "images",
      title: "Gallery Images",
      type: "array",
      description: "Drag and drop multiple images here. The first image will be the main/hero image on the media page.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              description: "Describe the image for accessibility",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
              description: "Optional caption displayed in the lightbox",
            }),
          ],
          preview: {
            select: {
              alt: "alt",
              media: "image",
            },
            prepare({ alt, media }) {
              return { title: alt || "Untitled image", media };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      images: "images",
    },
    prepare({ images }) {
      const count = images?.length || 0;
      return {
        title: "Media Page Gallery",
        subtitle: `${count} photo${count !== 1 ? "s" : ""}`,
      };
    },
  },
});
```

**Step 2: Register in schema index**

In `src/sanity/schemas/index.ts`, add the import and register it as a singleton:

```typescript
import mediaGallery from "./mediaGallery";
```

Add to the `schemaTypes` array in the Singletons section:

```typescript
  // Singletons
  siteSettings,
  prayerSettings,
  donationSettings,
  donatePageSettings,
  formSettings,
  mediaGallery,
```

**Step 3: Verify no TypeScript errors**

Run: `npm run type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add src/sanity/schemas/mediaGallery.ts src/sanity/schemas/index.ts
git commit -m "feat(sanity): add mediaGallery singleton schema for media page photos"
```

---

### Task 2: Register `mediaGallery` Singleton in Sanity Studio

**Files:**
- Modify: `sanity.config.ts`

**Step 1: Add singleton to desk structure**

In `sanity.config.ts`, add a new `S.listItem()` for "Media Page Gallery" in the sidebar. Add it after the "Forms" singleton and before the `S.divider()`:

```typescript
      S.listItem()
        .title("Media Page Gallery")
        .child(
          S.document()
            .schemaType("mediaGallery")
            .documentId("mediaGallery")
        ),
```

**Step 2: Add preview path mapping**

In the `previewPaths` record, add:

```typescript
  mediaGallery: () => "/media",
```

**Step 3: Exclude from auto-generated list**

Update the filter in `S.documentTypeListItems().filter()` to also exclude `"mediaGallery"`:

```typescript
      ...S.documentTypeListItems().filter(
        (item) => !["event", "announcement", "siteSettings", "prayerSettings", "donationSettings", "donatePageSettings", "donationCampaign", "formSettings", "mediaGallery"].includes(item.getId() || "")
      ),
```

**Step 4: Verify no TypeScript errors**

Run: `npm run type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add sanity.config.ts
git commit -m "feat(sanity): register mediaGallery singleton in Studio desk structure"
```

---

### Task 3: Rename `galleryImage` Title to "Website Image"

**Files:**
- Modify: `src/sanity/schemas/gallery.ts`

**Step 1: Update schema title and description**

In `src/sanity/schemas/gallery.ts`:
- Change `title: "Gallery Image"` to `title: "Website Image"`
- Add a `description` to the schema: `"Images used across the website (homepage gallery strip, etc.). For media page photos, use the Media Page Gallery instead."`

**Step 2: Verify no TypeScript errors**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/sanity/schemas/gallery.ts
git commit -m "refactor(sanity): rename galleryImage title to Website Image for clarity"
```

---

### Task 4: Add GROQ Query, Type, and Fetch Function

**Files:**
- Modify: `src/sanity/lib/queries.ts`
- Modify: `src/types/sanity.ts`
- Modify: `src/sanity/lib/fetch.ts`
- Modify: `src/test/setup.tsx`

**Step 1: Add GROQ query**

In `src/sanity/lib/queries.ts`, add after the existing gallery queries:

```typescript
// Media Page Gallery (singleton)
export const mediaGalleryQuery = groq`
  *[_id == "mediaGallery"][0] {
    images[] {
      image,
      alt,
      caption
    }
  }
`;
```

**Step 2: Add TypeScript type**

In `src/types/sanity.ts`, add after `SanityGalleryImage`:

```typescript
/** An image in the media page gallery (from the mediaGallery singleton). */
export interface MediaGalleryImage {
  image: SanityImage;
  alt: string;
  caption?: string;
}
```

**Step 3: Add fetch function**

In `src/sanity/lib/fetch.ts`, add the import for the new query and type, then add the function after `getFeaturedGalleryImages()`:

Import `mediaGalleryQuery` from queries.ts and `MediaGalleryImage` from types/sanity.ts.

```typescript
export async function getMediaGallery(): Promise<MediaGalleryImage[]> {
  try {
    const result = await sanityFetch<{ images: MediaGalleryImage[] } | null>(
      mediaGalleryQuery,
      {},
      ["mediaGallery"]
    );
    return result?.images ?? [];
  } catch (error) {
    console.error("Failed to fetch media gallery from Sanity:", error);
    return [];
  }
}
```

**Step 4: Add mock in test setup**

In `src/test/setup.tsx`, add to the Sanity fetch mock:

```typescript
  getMediaGallery: vi.fn().mockResolvedValue([]),
```

**Step 5: Add `mediaGallery` to revalidation route**

In `src/app/api/revalidate/route.ts`:
- Add `"mediaGallery"` to the `KNOWN_TYPES` array
- Add `mediaGallery: ["/media"]` to the `TYPE_TO_PATHS` mapping

**Step 6: Verify no TypeScript errors**

Run: `npm run type-check`
Expected: PASS

**Step 7: Commit**

```bash
git add src/sanity/lib/queries.ts src/types/sanity.ts src/sanity/lib/fetch.ts src/test/setup.tsx src/app/api/revalidate/route.ts
git commit -m "feat: add mediaGallery GROQ query, type, and fetch function"
```

---

### Task 5: Update MediaContent Props and page.tsx

**Files:**
- Modify: `src/app/media/page.tsx`
- Modify: `src/app/media/MediaContent.tsx`

**Step 1: Update page.tsx to fetch mediaGallery**

Replace the `getGalleryImages` import with `getMediaGallery`. Update the `Promise.all` to call `getMediaGallery()` instead. Pass the result as `mediaGalleryImages` prop instead of `galleryImages`.

```typescript
import { getMediaGallery } from "@/sanity/lib/fetch";
import type { MediaGalleryImage } from "@/types/sanity";
// ... remove SanityGalleryImage import and getGalleryImages import

const [mediaGalleryImages, youtubeVideos, liveStream] = await Promise.all([
  getMediaGallery(),
  getYouTubeVideos(),
  getYouTubeLiveStream(),
]);

return (
  <MediaContent
    mediaGalleryImages={mediaGalleryImages}
    youtubeVideos={youtubeVideos}
    liveStream={liveStream}
  />
);
```

**Step 2: Update MediaContent props**

In `MediaContent.tsx`:
- Replace `import { SanityGalleryImage } from "@/types/sanity"` with `import { MediaGalleryImage } from "@/types/sanity"`
- Change `MediaContentProps`:
  ```typescript
  interface MediaContentProps {
    mediaGalleryImages: MediaGalleryImage[];
    youtubeVideos?: YouTubeVideo[];
    liveStream?: YouTubeLiveStream;
  }
  ```
- Update the destructured props: `mediaGalleryImages` instead of `galleryImages`
- Update the `allImages` mapping to use the new prop — remove `category` since it's no longer in the schema:
  ```typescript
  const allImages = mediaGalleryImages
    .filter((img) => img.image)
    .map((img, index) => ({
      id: `media-${index}`,
      src: urlFor(img.image).width(600).url(),
      lightboxSrc: urlFor(img.image).width(1200).url(),
      alt: img.alt,
      caption: img.caption || "",
    }));
  ```

**Step 3: Verify no TypeScript errors**

Run: `npm run type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add src/app/media/page.tsx src/app/media/MediaContent.tsx
git commit -m "refactor(media): switch from galleryImages to mediaGalleryImages prop"
```

---

### Task 6: Replace Masonry Grid with Album Preview UI

**Files:**
- Modify: `src/app/media/MediaContent.tsx`

**Step 1: Replace the Photo Gallery section**

Replace the entire `{/* ── Photo Gallery — Masonry ── */}` section (lines ~336-387 in current file) with the album preview layout:

```tsx
      {/* ── Photo Gallery — Album Preview ── */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Photos</h2>
          </FadeIn>

          {allImages.length > 0 ? (
            <FadeIn>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Main/Hero Image — spans 2 cols and 2 rows */}
                <button
                  onClick={() => openLightbox(0)}
                  className="relative col-span-2 row-span-2 rounded-xl overflow-hidden group cursor-pointer"
                  aria-label={`View ${allImages[0].alt}`}
                >
                  <Image
                    src={allImages[0].src}
                    alt={allImages[0].alt}
                    width={600}
                    height={600}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>

                {/* Smaller thumbnails */}
                {allImages.slice(1, 4).map((image, index) => {
                  const isLastVisible = index === 2 && allImages.length > 4;
                  const remaining = allImages.length - 4;

                  return (
                    <button
                      key={image.id}
                      onClick={() => openLightbox(index + 1)}
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                      aria-label={
                        isLastVisible
                          ? `View all ${allImages.length} photos`
                          : `View ${image.alt}`
                      }
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={300}
                        height={300}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="w-full h-full object-cover"
                      />
                      {isLastVisible ? (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            +{remaining}
                          </span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>
            </FadeIn>
          ) : (
            <div className="text-center py-16">
              <Camera className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Photos Available
              </h3>
              <p className="text-gray-500">
                Gallery photos will appear here once added.
              </p>
            </div>
          )}
        </div>
      </section>
```

**Step 2: Update lightbox to remove category references**

In the lightbox section, remove the category badge rendering (the `{allImages[lightboxIndex]?.category && ...}` block). Since `MediaGalleryImage` has no `category` field, this must be removed.

**Step 3: Verify no TypeScript errors**

Run: `npm run type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add src/app/media/MediaContent.tsx
git commit -m "feat(media): replace masonry grid with album preview layout"
```

---

### Task 7: Update Tests

**Files:**
- Modify: `src/app/media/MediaContent.test.tsx`

**Step 1: Update test helper and imports**

Replace the `makeImage` helper to use `MediaGalleryImage` instead of `SanityGalleryImage`:

```typescript
import { MediaGalleryImage } from "@/types/sanity";
// Remove: import { SanityGalleryImage } from "@/types/sanity";

function makeImage(
  overrides: Partial<MediaGalleryImage & { _id?: string }> = {},
): MediaGalleryImage {
  return {
    image: {
      _type: "image",
      asset: { _ref: "image-abc-200x200-jpg", _type: "reference" },
    },
    alt: "Test image",
    ...overrides,
  };
}
```

**Step 2: Update all `galleryImages` prop references to `mediaGalleryImages`**

Find-and-replace all occurrences of `galleryImages={` with `mediaGalleryImages={` in the test file.

**Step 3: Update photo gallery tests for album preview layout**

Replace the photo gallery describe block. Key changes:
- Remove category-related tests (category badge, category filtering)
- Add test for hero image (first image is large)
- Add test for +N tile showing remaining count
- Add test for clicking +N tile opens lightbox
- Keep: empty state, filters missing images, Photos heading

Updated tests:

```typescript
  describe("photo gallery", () => {
    it("renders Photos heading", () => {
      render(<MediaContent mediaGalleryImages={[makeImage()]} />);
      expect(screen.getByText("Photos")).toBeInTheDocument();
    });

    it("renders hero image as first image", () => {
      const images = [
        makeImage({ alt: "Hero photo" }),
        makeImage({ alt: "Second photo" }),
      ];
      render(<MediaContent mediaGalleryImages={images} />);
      expect(screen.getByAltText("Hero photo")).toBeInTheDocument();
      expect(screen.getByLabelText("View Hero photo")).toBeInTheDocument();
    });

    it("shows +N tile when more than 4 images", () => {
      const images = Array.from({ length: 8 }, (_, i) =>
        makeImage({ alt: `Photo ${i + 1}` }),
      );
      render(<MediaContent mediaGalleryImages={images} />);
      expect(screen.getByText("+4")).toBeInTheDocument();
    });

    it("does not show +N tile when 4 or fewer images", () => {
      const images = [
        makeImage({ alt: "A" }),
        makeImage({ alt: "B" }),
        makeImage({ alt: "C" }),
      ];
      render(<MediaContent mediaGalleryImages={images} />);
      // No +N text should appear
      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });

    it("clicking +N tile opens lightbox", async () => {
      const user = userEvent.setup();
      const images = Array.from({ length: 6 }, (_, i) =>
        makeImage({ alt: `Photo ${i + 1}` }),
      );
      render(<MediaContent mediaGalleryImages={images} />);

      await user.click(screen.getByLabelText("View all 6 photos"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("shows empty state when no images", () => {
      render(<MediaContent mediaGalleryImages={[]} />);
      expect(screen.getByText("No Photos Available")).toBeInTheDocument();
      expect(
        screen.getByText("Gallery photos will appear here once added."),
      ).toBeInTheDocument();
    });

    it("filters out images with missing image data", () => {
      const images = [
        makeImage({ alt: "Good image" }),
        {
          alt: "Bad image",
          image: null as unknown as MediaGalleryImage["image"],
        },
      ];
      render(<MediaContent mediaGalleryImages={images} />);
      expect(screen.getByAltText("Good image")).toBeInTheDocument();
      expect(screen.queryByAltText("Bad image")).not.toBeInTheDocument();
    });
  });
```

**Step 4: Update lightbox tests**

Remove the test `"shows caption and category in lightbox overlay"` and replace with one that only checks caption (no category):

```typescript
    it("shows caption in lightbox overlay", async () => {
      const user = userEvent.setup();
      render(
        <MediaContent
          mediaGalleryImages={[
            makeImage({
              alt: "Eid prayer",
              caption: "Annual Eid celebration",
            }),
          ]}
        />,
      );

      await user.click(screen.getByLabelText("View Eid prayer"));

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveTextContent("Annual Eid celebration");
    });
```

**Step 5: Run tests**

Run: `npx vitest run src/app/media/MediaContent.test.tsx`
Expected: ALL PASS

**Step 6: Run full test suite**

Run: `npm run test:run`
Expected: ALL PASS (no regressions)

**Step 7: Commit**

```bash
git add src/app/media/MediaContent.test.tsx
git commit -m "test(media): update tests for album preview layout and mediaGalleryImages prop"
```

---

### Task 8: Final Validation

**Step 1: Run type-check**

Run: `npm run type-check`
Expected: PASS with zero errors

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS with zero warnings

**Step 3: Run all tests**

Run: `npm run test:run`
Expected: ALL PASS

**Step 4: Commit any remaining fixes if needed**
