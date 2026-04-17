import React from "react";
import { cn } from "@/lib/utils";
import { siteMono, siteSans } from "@/lib/siteFonts";

interface PageFooterProps {
  copyrightText?: string;
  creditText?: string;
}

export default function PageFooter({
  copyrightText,
  creditText = "Built by Sirius Whiter",
}: PageFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn(siteSans.className, "pb-10 pt-6")}>
      <div className="container mx-auto px-6 md:px-10 xl:px-16">
        <div className="rounded-[40px] border border-[#dad4c8] bg-white px-6 py-6 shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)] md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p
                className={cn(
                  siteMono.className,
                  "text-[11px] uppercase tracking-[0.24em] text-[#55534e]"
                )}
              >
                Markdown, AI, export
              </p>
              <p className="mt-3 text-sm text-[#55534e]">
                {copyrightText ?? `© ${year} Markdown Resume AI. All rights reserved.`}
              </p>
            </div>
            <p className="text-sm font-medium text-[#333333]">{creditText}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
