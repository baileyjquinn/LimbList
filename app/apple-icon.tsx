import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — solid background (iOS doesn't honor transparency well) with
// the LimbList diamond mark, matching the brand.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f3d2f",
        }}
      >
        <div
          style={{
            width: "84px",
            height: "84px",
            borderRadius: "20px",
            background: "#f4f0e6",
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
