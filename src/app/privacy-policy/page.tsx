import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — MatchEngine",
  description:
    "Learn how MatchEngine handles your data. We do not store, log, or share your resume or job description content. All analysis runs in-memory only.",
};

const sections = [
  {
    id: "overview",
    title: "Overview",
    content: `MatchEngine ("we", "our", or "us") is committed to protecting your privacy. This policy explains how we handle document data when you use our Resume vs. Job Description Compatibility Analyzer. By using MatchEngine, you acknowledge the practices described here.`,
  },
  {
    id: "no-login",
    title: "No Account Required",
    content: `MatchEngine is designed to be completely anonymous. We do not require you to create an account, provide an email address, or log in. You can use the full functionality of the tool without identifying yourself.`,
  },
  {
    id: "data-you-provide",
    title: "Data Processing",
    content: `When you use MatchEngine, you upload a resume PDF and paste target job description text. This content is held in volatile server memory solely to compute deterministic compatibility scores, extract skills, and generate recommendations. It is never written to a database or disk, and is released immediately once the HTTP response completes.`,
  },
  {
    id: "data-storage",
    title: "No Persistent Data Storage",
    content: `We do not store your resume or job description on our servers. Analysis requests are processed in ephemeral memory and discarded immediately. We do not build candidate profiles, logs, or histories of any uploaded documents.`,
  },
  {
    id: "zero-ai-apis",
    title: "Local In-Memory Architecture",
    content: `MatchEngine runs deterministically using rule-based parsers and similarity algorithms on the application server. Your resume and job description text are never transmitted to external third-party AI models (such as OpenAI or Google Gemini) and are never used for model training.`,
  },
  {
    id: "cookies",
    title: "Cookies & Local Storage",
    content: `MatchEngine does not use tracking cookies or advertising trackers. We use browser local storage solely to remember your preferred color theme (light/dark mode). In-memory React state is used during your session to display results.`,
  },
  {
    id: "security",
    title: "Transmission Security",
    content: `All data transmitted between your browser and our servers is encrypted using industry-standard TLS/HTTPS.`,
  },
  {
    id: "contact",
    title: "Contact",
    content: `If you have questions regarding this privacy policy, please contact the developer via: https://pratham-portfolio-sooty.vercel.app/`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#FFFDF9] dark:bg-[#121312] text-[#141514] dark:text-[#F4F2EE] font-sans antialiased overflow-x-hidden transition-colors">
      {/* Luminous Warm Pastel Aura */}
      <div className="luminous-glow" aria-hidden="true" />
      <Navbar />

      <main className="flex-1 max-w-[1060px] w-full mx-auto px-6 sm:px-8 md:px-10 py-10 md:py-16 flex flex-col">
        {/* Header */}
        <section className="mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.02em] text-[#141514] dark:text-[#F4F2EE] mb-3">
            Privacy Policy
          </h1>
          <p className="text-base text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed max-w-2xl font-sans">
            MatchEngine is built around a simple principle: your data belongs to you. No logins, no persistent database storage, and zero external AI API data sharing.
          </p>
          <p className="mt-3 text-xs text-[#82847E] dark:text-[#72736C] font-mono">
            Last updated: October 2026
          </p>
        </section>

        {/* Policy Articles */}
        <div className="space-y-4">
          {sections.map((section, i) => (
            <article
              key={section.id}
              id={section.id}
              className="rounded-2xl border border-[#EAE4DC] dark:border-[#2F302C] bg-white dark:bg-[#1B1C1A] p-6 md:p-7 transition-colors shadow-xs"
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-[#FAF7F2] dark:bg-[#222320] border border-[#EAE4DC] dark:border-[#2F302C] flex items-center justify-center text-xs font-mono font-semibold text-[#141514] dark:text-[#F4F2EE]"
                >
                  0{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-[#141514] dark:text-[#F4F2EE] mb-2">
                    {section.title}
                  </h2>
                  <div className="text-[#5C5E58] dark:text-[#9E9F97] text-xs sm:text-sm leading-relaxed space-y-2 font-sans">
                    {section.content.split("\n\n").map((para, j) => (
                      <p key={j} className="whitespace-pre-line">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 sm:p-7 rounded-2xl border border-[#EAE4DC] dark:border-[#2F302C] bg-white dark:bg-[#1B1C1A] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-base font-semibold text-[#141514] dark:text-[#F4F2EE]">
              Ready to evaluate a resume?
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-0.5 font-sans">
              100% in-memory processing. No account or setup required.
            </p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-[#111210] hover:bg-neutral-800 dark:bg-[#F4F2EE] dark:text-[#111210] dark:hover:bg-white text-white font-semibold text-xs tracking-wide transition-all shrink-0 cursor-pointer shadow-xs"
          >
            Go to Matcher
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
