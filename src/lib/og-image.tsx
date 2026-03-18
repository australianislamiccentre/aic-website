/**
 * Shared OpenGraph Image Generator
 *
 * Creates branded OG images (1200×630) for link sharing thumbnails.
 * Each page passes its own title and optional subtitle to produce
 * a unique, consistent thumbnail with the AIC brand.
 *
 * @module lib/og-image
 */
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

interface OgImageOptions {
  title: string;
  subtitle?: string;
}

export function generateOgImage({ title, subtitle }: OgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #01476b 0%, #013a57 50%, #012d44 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Green accent bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #00ad4c, #8cc63f)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {/* Site name */}
          <p
            style={{
              fontSize: 22,
              color: "rgba(255, 255, 255, 0.5)",
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            Australian Islamic Centre
          </p>

          {/* Page title */}
          <h1
            style={{
              fontSize: title.length > 30 ? 48 : 60,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              marginBottom: subtitle ? 20 : 32,
              maxWidth: 900,
            }}
          >
            {title}
          </h1>

          {/* Subtitle if provided */}
          {subtitle && (
            <p
              style={{
                fontSize: 26,
                color: "rgba(255, 255, 255, 0.7)",
                lineHeight: 1.4,
                marginBottom: 32,
                maxWidth: 800,
              }}
            >
              {subtitle}
            </p>
          )}

          {/* Green accent line */}
          <div
            style={{
              width: 60,
              height: 3,
              background: "#00ad4c",
              borderRadius: 2,
              marginBottom: 32,
            }}
          />

          {/* Location */}
          <p
            style={{
              fontSize: 18,
              color: "rgba(255, 255, 255, 0.45)",
            }}
          >
            Newport, Melbourne
          </p>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
