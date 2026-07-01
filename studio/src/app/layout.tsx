import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face — geometric, modern, cinematic at large sizes.
const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mohamed Negm — Creative Front-End Developer",
  description:
    "A cinematic, interactive portfolio. Mohamed Negm crafts fast, immersive web experiences with React, Three.js and motion design.",
  metadataBase: new URL("https://mohamednegm.vercel.app"),
  authors: [{ name: "Mohamed Negm" }],
  keywords: ["Mohamed Negm", "Front-End Developer", "React", "Three.js", "WebGL", "Creative Developer", "Portfolio"],
  openGraph: {
    title: "Mohamed Negm — Creative Front-End Developer",
    description: "A cinematic, interactive 3D portfolio built with React, Three.js and motion design.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
