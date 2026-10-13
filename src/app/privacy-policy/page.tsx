import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — MatchEngine",
  description:
    "Learn how MatchEngine handles your data. We do not store, log, or share your resume or job description content. All analysis runs in-session only.",
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
    content: `When you use MatchEngine, you may paste or upload:

• Your resume text or PDF content
• A job description

This content is sent to our AI analysis API solely to generate a compatibility score and recommendations for your current session. It is never written to a database, never associated with a user identity, and never retained after your session ends.`,
  },
  {
    id: "data-storage",
    title: "No Persistent Data Storage",
    content: `We do not store your resume or job description on our servers. Analysis requests are processed in real-time and discarded immediately after a response is returned. We do not build profiles, logs, or histories of any submitted content.`,
  },
  {
    id: "third-party",
    title: "Third-Party AI Processing",
    content: `To generate analysis results, your resume and job description text is transmitted to a third-party AI provider (Google Gemini). This transmission is encrypted via HTTPS. You should review Google's privacy policies for information on how they handle data sent to their API. We do not grant any third party permission to use your data for training or any purpose beyond generating the immediate response.`,
  },
  {
    id: "cookies",
    title: "Cookies & Local Storage",
    content: `MatchEngine does not use tracking cookies, advertising cookies, or any third-party analytics that fingerprint you as an individual. We may use browser local storage to temporarily cache analysis results so you can navigate back to them within the same session. This data is stored only on your own device and is cleared when you close or refresh the app.`,
  },
  {
    id: "analytics",
    title: "Aggregate Analytics",
    content: `We may collect anonymized, aggregated usage statistics (such as total number of analyses run, page views, and general error rates) to help us improve the product. This data contains no personally identifiable information and cannot be linked back to any individual or their submitted content.`,
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    content: `MatchEngine is not directed at children under the age of 13. We do not knowingly collect any personal information from children. If you believe a child has submitted content through our service, please contact us and we will take appropriate steps.`,
  },
  {
    id: "security",
    title: "Security",
    content: `All data transmitted between your browser and our servers is encrypted using industry-standard TLS/HTTPS. We follow security best practices to prevent unauthorized access. However, no method of internet transmission is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. The "Last Updated" date at the top of this page will reflect any changes. Continued use of MatchEngine after changes are posted constitutes your acceptance of the revised policy.`,
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
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Back to MatchEngine home"
          >
            <span className="text-slate-400 group-hover:text-slate-200 transition-colors text-sm">
              ←
            </span>
            <span className="font-bold text-slate-200 text-sm tracking-tight">
              MatchEngine
            </span>
          </Link>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">
            Privacy Policy
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden border-b border-slate-800/50"
        aria-labelledby="privacy-heading"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                clipRule="evenodd"
              />
            </svg>
            Privacy First
          </span>

          <h1
            id="privacy-heading"
            className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight"
          >
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            We built MatchEngine around a simple principle:{" "}
            <span className="text-slate-200 font-medium">
              your data belongs to you
            </span>
            . No logins. No data storage. No tracking.
          </p>
          <p className="mt-4 text-xs text-slate-600 font-mono">
            Last updated: October 2026
          </p>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="border-b border-slate-800/50 bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
          <ul className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { icon: "🔒", label: "No data stored" },
              { icon: "👤", label: "No account needed" },
              { icon: "🚫", label: "No tracking cookies" },
              { icon: "🔐", label: "HTTPS encrypted" },
              { icon: "🗑️", label: "Session-only processing" },
            ].map(({ icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm text-slate-400"
              >
                <span className="text-base" aria-hidden="true">
                  {icon}
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Table of Contents ── */}
      <section className="max-w-4xl mx-auto w-full px-4 md:px-6 pt-12 pb-0">
        <nav
          aria-label="Table of contents"
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Contents
          </p>
          <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 list-none p-0 m-0">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      {/* ── Policy Sections ── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-12">
        <div className="space-y-6">
          {sections.map((section, i) => (
            <article
              key={section.id}
              id={section.id}
              className="scroll-mt-20 rounded-xl border border-slate-800/70 bg-slate-900/40 p-6 md:p-8 transition-colors hover:border-slate-700/80 hover:bg-slate-900/60"
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400"
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-slate-100 mb-3 leading-snug">
                    {section.title}
                  </h2>
                  <div className="text-slate-400 text-sm leading-relaxed space-y-2">
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

        {/* ── CTA ── */}
        <div className="mt-14 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-slate-900/60 to-indigo-500/10 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Ready to analyze your resume?
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Use MatchEngine risk-free. No login, no data retention, no strings attached.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 transition-colors shadow-lg shadow-blue-500/20"
          >
            Start Analyzing
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
