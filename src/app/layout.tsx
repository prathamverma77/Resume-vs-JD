import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "MatchEngine — Resume vs. Job Description Compatibility Analyzer",
  description: "Evaluate candidate resume compatibility against target job descriptions, extract technical skills, identify requirement gaps, and receive tailored recommendations.",
  keywords: ["resume matcher", "job description analyzer", "ATS match score", "resume keyword checker"],
  authors: [{ name: "Pratham Verma", url: "https://pratham-portfolio-sooty.vercel.app/" }],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
