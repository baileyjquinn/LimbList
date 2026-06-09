import { ImageResponse } from "next/og";
import { getCompanyBySlug } from "@/lib/companies";

export const alt = "Send your tree photos for a faster quote";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREAM = "#f4f0e6";
const PAPER = "#fffdf8";
const FOREST_DEEP = "#1f3d2f";
const FOREST = "#2f5d45";
const INK_SOFT = "#6b6256";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  const name = company?.name ?? "your tree pro";

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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              background: PAPER,
              border: `2px solid ${FOREST}`,
              color: FOREST_DEEP,
              padding: "10px 22px",
              borderRadius: "999px",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            Tree job request
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              color: FOREST_DEEP,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: "960px",
            }}
          >
            Send {name} your tree photos.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: INK_SOFT,
              marginTop: "30px",
              maxWidth: "880px",
              lineHeight: 1.3,
            }}
          >
            A few photos and quick questions give them everything they need to
            quote your job — about 2 minutes.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: FOREST_DEEP,
            }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "4px",
                background: CREAM,
                transform: "rotate(45deg)",
              }}
            />
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, color: FOREST_DEEP }}>
            Powered by LimbList
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
