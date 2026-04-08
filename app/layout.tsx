import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://devscope.vercel.app";

export const metadata: Metadata = {
  title: "DevScope — AI GitHub Profile Analyzer",
  description:
    "Get an instant AI-powered report on any developer's GitHub profile. Analyze tech stack, seniority level, strengths, and job role recommendations.",
  openGraph: {
    title: "DevScope — AI GitHub Profile Analyzer",
    description:
      "Get an instant AI-powered report on any developer's GitHub profile.",
    url: APP_URL,
    siteName: "DevScope",
    images: [{ url: `${APP_URL}/og-image.png`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevScope — AI GitHub Profile Analyzer",
    description:
      "Get an instant AI-powered report on any developer's GitHub profile.",
    images: [`${APP_URL}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
