import type { Metadata, Viewport } from "next";
import { Geist, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { APP_URL } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "LimbList — Send your tree photos, get a faster quote",
  description:
    "Snap a few photos of your tree, answer a few quick questions, and your tree pro gets everything they need to quote the job — without a wasted trip.",
  openGraph: {
    title: "LimbList — Send your tree photos, get a faster quote",
    description:
      "Customers send photos and the details that matter before you load the truck. Fewer wasted trips, faster quotes.",
    siteName: "LimbList",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LimbList — Send your tree photos, get a faster quote",
    description:
      "Customers send photos and the details that matter before you load the truck.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f3d2f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
