import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#EAE4DC] dark:border-[#2F302C] bg-[#FFFDF9] dark:bg-[#121312] text-[#5C5E58] dark:text-[#9E9F97] py-10 transition-colors">
      <div className="max-w-[1060px] mx-auto px-6 sm:px-8 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-normal">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#141514] dark:text-[#F4F2EE]">
            MatchEngine
          </span>
          <span className="text-[#82847E]">&bull;</span>
          <span>In-Memory Resume vs JD Engine</span>
        </div>

        <nav
          aria-label="Footer Navigation"
          className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium"
        >
          <Link
            href="/#how-it-works"
            className="hover:text-[#141514] dark:hover:text-[#F4F2EE] transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#capabilities"
            className="hover:text-[#141514] dark:hover:text-[#F4F2EE] transition-colors"
          >
            Capabilities
          </Link>
          <Link
            href="/#faq"
            className="hover:text-[#141514] dark:hover:text-[#F4F2EE] transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/privacy-policy"
            className="hover:text-[#141514] dark:hover:text-[#F4F2EE] transition-colors"
          >
            Privacy
          </Link>
        </nav>

        <div className="text-[11px] text-[#82847E] dark:text-[#72736C] font-mono">
          &copy; {new Date().getFullYear()} MatchEngine
        </div>
      </div>
    </footer>
  );
}
