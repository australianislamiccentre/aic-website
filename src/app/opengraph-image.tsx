import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Australian Islamic Centre";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
              fontSize: 40,
            }}
          >
            &#9770;
          </div>
          <h1
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            Australian Islamic Centre
          </h1>
          <p
            style={{
              fontSize: 28,
              color: "rgba(255, 255, 255, 0.8)",
              lineHeight: 1.4,
              marginBottom: 32,
            }}
          >
            A Place of Worship, Learning & Community
          </p>
          <div
            style={{
              width: 60,
              height: 3,
              background: "#00ad4c",
              borderRadius: 2,
              marginBottom: 32,
            }}
          />
          <p
            style={{
              fontSize: 18,
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            Newport, Melbourne &bull; Serving the community for over 40 years
          </p>
        </div>
      </div>
    ),
    { ...size },
  );
}
