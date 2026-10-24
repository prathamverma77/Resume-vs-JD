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
    content: `MatchEngine ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use our Resume vs. Job Description Compatibility Analyzer. By using MatchEngine, you agree to the practices described here.`,
  },
  {
    id: "no-login",
    title: "No Account Required",
    content: `MatchEngine is designed to be completely anonymous. We do not require you to create an account, provide an email address, or log in. You can use the full functionality of the tool without identifying yourself in any way.`,
  },
  {
    id: "data-you-provide",
    title: "Data You Provide",
    content: `When you use MatchEngine, you may upload or paste:

• Your resume document (PDF)
• A target job description (text or PDF)

This content is processed solely in-memory to compute deterministic compatibility scores, extract skills, and generate recommendations for your current session. It is never written to a database, never associated with an identity, and discarded immediately after the request finishes.`,
  },
  {
    id: "data-storage",
    title: "No Persistent Data Storage",
    content: `We do not store your resume or job description on our servers. Analysis requests are processed in ephemeral memory and discarded immediately once results are returned. We do not build candidate profiles, logs, or histories of any uploaded documents.`,
  },
  {
    id: "zero-ai-apis",
    title: "100% In-Memory Processing & Zero Third-Party AI APIs",
    content: `MatchEngine runs deterministically using local in-memory parsers and rule-based algorithms. Your resume and job description text are never transmitted to external third-party AI models (such as OpenAI or Google Gemini) and are never used to train machine learning models.`,
  },
  {
    id: "cookies",
    title: "Cookies & Local Storage",
    content: `MatchEngine does not use tracking cookies, advertising trackers, or any third-party analytics that fingerprint you. We use browser local storage solely to store your preferred color theme (light/dark mode) and to temporarily cache analysis results so you can view your report within the same session.`,
  },
  {
    id: "analytics",
    title: "Aggregate Analytics",
    content: `We may collect anonymized, aggregated usage statistics (such as page views or general error rates) to help improve performance. This data contains zero personally identifiable information and cannot be linked back to any individual or uploaded file.`,
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    content: `MatchEngine is not directed at children under the age of 13. We do not knowingly collect any personal information from children. If you believe a child has submitted content through our service, please contact us.`,
  },
  {
    id: "security",
    title: "Security",
    content: `All data transmitted between your browser and our servers is encrypted using industry-standard TLS/HTTPS. We follow strict security practices to prevent unauthorized access.`,
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page reflects any revisions. Continued use of MatchEngine after changes are posted constitutes your acceptance of the revised policy.`,
  },
  {
    id: "contact",
    title: "Contact",
    content: `If you have any questions or concerns about this Privacy Policy, you can reach out to the developer:

Pratham Verma
https://pratham-portfolio-sooty.vercel.app/`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between text-[var(--text-main)] font-sans antialiased selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col">
        {/* Hero Section */}
        <section className="text-center mb-10 max-w-3xl mx-auto pt-4 md:pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50/90 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 text-xs md:text-sm font-semibold mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            <span>Privacy First &bull; 100% In-Memory &bull; Zero Storage</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white mb-3.5 leading-tight">
            Privacy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Policy
            </span>
          </h1>

          <p className="text-base md:text-lg font-normal text-zinc-700 dark:text-zinc-200 leading-relaxed max-w-2xl mx-auto">
            We built MatchEngine around a simple principle:{" "}
            <span className="font-semibold text-zinc-950 dark:text-white">your data belongs to you</span>.
            No logins, no persistent database storage, and no tracking cookies.
          </p>

          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            Last updated: October 2026
          </p>
        </section>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto w-full mb-12">
          {[
            { icon: "🔒", label: "No data stored" },
            { icon: "👤", label: "No account needed" },
            { icon: "🚫", label: "No tracking cookies" },
            { icon: "🔐", label: "HTTPS encrypted" },
            { icon: "🗑️", label: "Session-only RAM" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col items-center justify-center text-center gap-1.5 transition-colors"
            >
              <span className="text-2xl" aria-hidden="true">
                {icon}
              </span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Table of Contents */}
        <nav
          aria-label="Table of contents"
          className="max-w-4xl mx-auto w-full mb-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xs transition-colors"
        >
          <div className="text-center mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Navigation
            </span>
            <h2 className="text-base font-bold text-zinc-950 dark:text-white mt-0.5">
              Table of Contents
            </h2>
          </div>
          <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-2 list-none p-0 m-0">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-xs md:text-sm font-semibold text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    {i + 1}.
                  </span>
                  <span>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Policy Articles */}
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {sections.map((section, i) => (
            <article
              key={section.id}
              id={section.id}
              className="scroll-mt-20 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 transition-colors shadow-2xs hover:border-blue-500/40 dark:hover:border-blue-500/40"
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-xs font-mono font-extrabold text-blue-600 dark:text-blue-400"
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-zinc-950 dark:text-white mb-3 leading-snug">
                    {section.title}
                  </h2>
                  <div className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base leading-relaxed space-y-2.5 font-normal">
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
        <div className="mt-14 max-w-4xl mx-auto w-full rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 dark:from-blue-950/30 dark:via-zinc-900 dark:to-indigo-950/30 p-8 md:p-10 text-center shadow-2xs">
          <h2 className="text-xl md:text-2xl font-extrabold text-zinc-950 dark:text-white mb-2">
            Ready to analyze your resume?
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-sm md:text-base max-w-lg mx-auto mb-6">
            Use MatchEngine risk-free. No login, no data retention, and 100% in-memory processing.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm md:text-base px-6 py-3 transition-all shadow-md shadow-blue-500/25 active:scale-[0.99] cursor-pointer"
          >
            <span>Start Analyzing</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
