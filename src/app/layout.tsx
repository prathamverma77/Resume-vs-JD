import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AnalysisProvider } from "@/context/AnalysisContext";
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: ["400"],
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "MatchEngine — Resume vs. Job Description Compatibility Analyzer",
  description:
    "Evaluate candidate resume compatibility against target job descriptions, extract technical skills, identify requirement gaps, and receive tailored recommendations.",
  keywords: [
    "resume matcher",
    "job description analyzer",
    "ATS match score",
    "resume keyword checker",
  ],
  authors: [
    {
      name: "Pratham Verma",
      url: "https://pratham-portfolio-sooty.vercel.app/",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('matchengine-theme');if(s==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AnalysisProvider>{children}</AnalysisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
