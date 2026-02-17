import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MouseFollowEffect } from "@/components/MouseFollowEffect";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Job & Skill Navigator",
  description:
    "AI-powered career intelligence for students: resume parsing, skill gaps, and learning roadmap.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} app-grid-bg antialiased bg-background text-foreground`}
      >
        <MouseFollowEffect />
        <div className="relative min-h-screen">
          <div className="relative z-10 flex min-h-screen flex-col">
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
              <div className="mx-auto max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
