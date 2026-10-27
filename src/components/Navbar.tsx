"use client";

import React, { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  showBack?: boolean;
  onBack?: () => void;
}

export default function Navbar({ showBack, onBack }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-[#EAE4DC]/60 dark:border-[#2F302C]/60 bg-[#FFFDF9]/80 dark:bg-[#121312]/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-[1060px] mx-auto px-6 sm:px-8 md:px-10 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#111210] text-white dark:bg-[#F4F2EE] dark:text-[#111210] flex items-center justify-center font-semibold text-xs tracking-tight shrink-0 shadow-xs">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#141514] dark:text-[#F4F2EE]">
            MatchEngine
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!showBack && (
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-7 text-xs sm:text-[13px] font-medium text-[#5C5E58] dark:text-[#9E9F97]"
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
          </nav>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-semibold text-[#141514] dark:text-[#F4F2EE] bg-white hover:bg-[#FAF7F2] dark:bg-[#1B1C1A] dark:hover:bg-[#222320] border border-[#EAE4DC] dark:border-[#2F302C] px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <svg className="w-3.5 h-3.5 text-[#5C5E58] dark:text-[#9E9F97]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Back to Matcher</span>
            </button>
          ) : (
            <a
              href="#analyzer"
              className="text-xs font-semibold text-white bg-[#111210] hover:bg-neutral-800 dark:bg-[#F4F2EE] dark:text-[#121312] dark:hover:bg-white px-4 py-2 rounded-full transition-all shadow-xs cursor-pointer"
            >
              Analyze Resume
            </a>
          )}

          {/* Mobile Menu Toggle */}
          {!showBack && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#5C5E58] dark:text-[#9E9F97] hover:text-[#141514] dark:hover:text-[#F4F2EE] p-1.5 rounded"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {!showBack && mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EAE4DC] dark:border-[#2F302C] bg-[#FFFDF9] dark:bg-[#121312] px-6 py-4 flex flex-col gap-3 text-xs font-medium text-[#5C5E58] dark:text-[#9E9F97]">
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 hover:text-[#141514] dark:hover:text-[#F4F2EE]"
          >
            How It Works
          </Link>
          <Link
            href="/#capabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 hover:text-[#141514] dark:hover:text-[#F4F2EE]"
          >
            Capabilities
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 hover:text-[#141514] dark:hover:text-[#F4F2EE]"
          >
            FAQ
          </Link>
        </div>
      )}
    </header>
  );
}
