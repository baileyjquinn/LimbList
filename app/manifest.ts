import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LimbList",
    short_name: "LimbList",
    description:
      "Send your tree photos and get a faster quote — no wasted trips.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f0e6",
    theme_color: "#1f3d2f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
