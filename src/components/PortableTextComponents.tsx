/**
 * Portable Text Components
 *
 * Shared PortableText custom components for rendering Sanity rich-text
 * content. Handles inline images with Next.js Image optimisation and
 * proper alt text / captions.
 *
 * @module components/PortableTextComponents
 */
import { PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

export const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const imageUrl = urlFor(value).width(1200).height(800).url();
      return (
        <figure className="my-8">
          <div className="relative w-full overflow-hidden rounded-xl">
            <Image
              src={imageUrl}
              alt={value.alt || ""}
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
          {value.caption && (
            <figcaption className="text-sm text-gray-500 mt-2 text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};
