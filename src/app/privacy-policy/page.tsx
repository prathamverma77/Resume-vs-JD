import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — MatchEngine",
  description:
    "Learn how MatchEngine handles your data. We do not store, log, or share your resume or job description content. All analysis runs strictly in volatile memory.",
};

const pillars = [
  {
    title: "Zero Database Storage",
    desc: "Your resume and job description exist solely in volatile RAM during comparison and are discarded immediately.",
    icon: (
      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    title: "100% Anonymous",
    desc: "No accounts, no email logins, and no user profiles. You can test as many documents as you need without revealing your identity.",
    icon: (
      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "No Third-Party AI Sharing",
    desc: "Deterministic in-house parsing engine. Your career records are never transmitted to external LLM APIs for AI model training.",
    icon: (
      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

const sections = [
  {
    id: "overview",
    tag: "Core Charter",
    title: "Overview & Privacy Philosophy",
    content: `MatchEngine ("we", "our", or "us") operates on a simple, privacy-first premise: your professional background belongs strictly to you.\n\nMost modern HR tools silently compile candidate dossiers, sell aggregate hiring data, or pipe resumes into public generative AI APIs. MatchEngine is architected to be the exact opposite: an ephemeral, client-focused audit utility that provides transparent ATS matching with zero cloud retention.`,
  },
  {
    id: "no-login",
    tag: "Anonymity",
    title: "No Account or Identity Required",
    content: `MatchEngine is engineered to be 100% anonymous.\n\nWe do not require you to create an account, verify an email address, link a LinkedIn profile, or submit your name. You can use every feature of the engine without identifying yourself.`,
  },
  {
    id: "data-processing",
    tag: "Lifecycle",
    title: "Volatile In-Memory Processing",
    content: `When you upload a resume (.pdf or .docx) and provide job description text, the document data is read directly into ephemeral server memory (RAM).\n\nThe text is parsed strictly to normalize skills, compute weighted compatibility scores, extract seniority timelines, and generate actionable feedback. Once the JSON response is delivered back to your browser, all memory allocated to that request is immediately freed. Your text is never written to a disk, cache, or persistent database.`,
  },
  {
    id: "zero-ai-apis",
    tag: "Model Privacy",
    title: "No External AI API Sharing",
    content: `All parsing and matching algorithms run in-engine using our proprietary deterministic taxonomy and tokenizer.\n\nYour resume content, work history, contact details, and employer job specifications are never transmitted to OpenAI, Anthropic, Google Gemini, or any external third-party AI provider. Your career history will never be used to train large language models.`,
  },
  {
    id: "cookies",
    tag: "Tracking",
    title: "Zero Tracking Cookies or Ad Pixels",
    content: `MatchEngine does not deploy tracking cookies, advertising beacons, or third-party behavioral analytics.\n\nWe only utilize browser local storage to preserve your theme preference (Light or Dark mode). Analysis results are held strictly in temporary React application state during your active browser tab session.`,
  },
  {
    id: "security",
    tag: "Encryption",
    title: "Transport Security & Encryption",
    content: `All document payloads and communications between your client device and our application servers are encrypted in transit using industry-standard TLS 1.3 / HTTPS encryption.`,
  },
  {
    id: "contact",
    tag: "Inquiries",
    title: "Developer Contact",
    content: `If you have technical questions or privacy inquiries regarding MatchEngine's architecture, you may reach the maintainer via the portfolio at: https://pratham-portfolio-sooty.vercel.app/`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#FFFDF9] dark:bg-[#121312] text-[#141514] dark:text-[#F4F2EE] font-sans antialiased overflow-x-hidden transition-colors">
      {/* Balanced Atmospheric Aura (No lopsided edge smudges) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#FFEBE4]/40 via-[#F3ECE4]/20 to-transparent dark:from-[#2A2B27]/35 dark:via-[#1B1C1A]/15 dark:to-transparent blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />

      <Navbar />

      <main className="relative z-10 flex-1 max-w-[1060px] w-full mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16 flex flex-col">
        {/* Header Strip */}
        <section className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141514]/5 dark:bg-white/10 border border-[#EAE4DC] dark:border-[#2F302C] text-[11px] font-mono uppercase tracking-wider text-[#5C5E58] dark:text-[#A8A9A2] mb-3">
            <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>Security & Data Architecture &bull; In-Memory Only</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.025em] text-[#141514] dark:text-[#F4F2EE] mb-3 leading-tight">
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed max-w-2xl font-sans">
            MatchEngine is built on an unwavering principle: your data belongs to you. No logins, no candidate profiling, zero persistent database storage, and zero external AI model data sharing.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 text-xs text-[#82847E] dark:text-[#72736C] font-mono">
            <span>Last Updated: October 2026</span>
            <span>&bull;</span>
            <span>Policy Version 2.0</span>
          </div>
        </section>

        {/* 3 Core Trust Pillars Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white/90 dark:bg-[#181917]/90 border border-[#EAE4DC] dark:border-[#2F302C] shadow-2xs backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] dark:bg-[#222320] border border-[#EAE4DC] dark:border-[#2F302C] flex items-center justify-center mb-3">
                  {pillar.icon}
                </div>
                <h2 className="text-sm font-semibold text-[#141514] dark:text-[#F4F2EE] mb-1.5">
                  {pillar.title}
                </h2>
                <p className="text-xs text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed font-sans">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Policy Articles Accordion / Cards */}
        <section className="space-y-4">
          {sections.map((section, i) => (
            <article
              key={section.id}
              id={section.id}
              className="rounded-2xl border border-[#EAE4DC] dark:border-[#2F302C] bg-white/90 dark:bg-[#181917]/90 backdrop-blur-md p-6 sm:p-7 transition-all shadow-2xs hover:border-[#D6CEC4] dark:hover:border-[#41423C]"
            >
              <div className="flex items-start gap-4 sm:gap-5">
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 w-8 h-8 rounded-xl bg-[#141514] text-white dark:bg-[#F4F2EE] dark:text-[#141514] font-mono font-bold text-xs flex items-center justify-center shadow-xs"
                >
                  0{i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#82847E] dark:text-[#72736C]">
                      {section.tag}
                    </span>
                  </div>

                  <h2 className="text-base font-semibold text-[#141514] dark:text-[#F4F2EE] mb-2.5">
                    {section.title}
                  </h2>

                  <div className="text-[#5C5E58] dark:text-[#9E9F97] text-xs sm:text-sm leading-relaxed space-y-2.5 font-sans">
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
        </section>

        {/* CTA Card */}
        <section className="mt-12 p-6 sm:p-8 rounded-3xl border border-[#EAE4DC] dark:border-[#2F302C] bg-white/95 dark:bg-[#181917]/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#141514] dark:text-[#F4F2EE]">
              Ready to evaluate candidate compatibility?
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-1 font-sans">
              100% ephemeral memory execution. No logins or document retention.
            </p>
          </div>

          <Link
            href="/"
            className="px-6 py-2.5 rounded-full bg-[#141514] hover:bg-neutral-800 dark:bg-[#F4F2EE] dark:text-[#141514] dark:hover:bg-white text-white font-semibold text-xs tracking-wide transition-all shrink-0 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            Launch MatchEngine
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
