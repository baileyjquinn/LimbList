import { ImageResponse } from "next/og";

export const alt = "LimbList — send your tree photos, get a faster quote";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette (approximate hex of the oklch tokens, for the OG renderer).
const CREAM = "#f4f0e6";
const FOREST_DEEP = "#1f3d2f";
const INK_SOFT = "#6b6256";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CREAM,
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: FOREST_DEEP,
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "5px",
                background: CREAM,
                transform: "rotate(45deg)",
              }}
            />
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, color: FOREST_DEEP }}>
            LimbList
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 700,
              color: FOREST_DEEP,
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              maxWidth: "940px",
            }}
          >
            Stop driving to jobs you can&apos;t quote.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: INK_SOFT,
              marginTop: "30px",
              maxWidth: "860px",
              lineHeight: 1.3,
            }}
          >
            Customers send photos and the details that matter — before you load
            the truck.
          </div>
        </div>

        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              background: FOREST_DEEP,
              color: CREAM,
              padding: "14px 26px",
              borderRadius: "999px",
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            For tree companies
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
