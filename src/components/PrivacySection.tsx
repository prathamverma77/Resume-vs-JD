import React from "react";

export default function PrivacySection() {
  return (
    <section className="w-full scroll-mt-24">
      {/* Centered Editorial Header */}
      <div className="mb-8 md:mb-10 text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#141514] dark:text-[#F4F2EE] tracking-[-0.02em] font-normal leading-tight">
          Privacy & in-memory evaluation
        </h2>
        <p className="text-base sm:text-lg text-[#5C5E58] dark:text-[#9E9F97] mt-2.5 leading-relaxed font-sans">
          MatchEngine processes resume and job text strictly in ephemeral server memory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pt-6 border-t border-[#EAE4DC] dark:border-[#2F302C]">
        <div className="md:col-span-7">
          <p className="text-sm md:text-[15px] text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed">
            Uploaded document bytes are evaluated exclusively in an in-memory memory buffer and immediately released upon response completion. No files are written to disk, no user profiles are stored, and no candidate records are retained.
          </p>
        </div>

        <div className="md:col-span-5 space-y-5">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-[#141514] dark:text-[#F4F2EE] mb-1">
              Zero Database Storage
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed">
              No user accounts, tracking cookies, or scan histories are stored.
            </p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-medium text-[#141514] dark:text-[#F4F2EE] mb-1">
              No External AI APIs
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed">
              Text extraction, normalization, and similarity checks execute locally on the application server.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
