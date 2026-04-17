"use client";

import Logo from "@/components/Logo";
import Link from "next/link";
import React from "react";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteMono, siteSans } from "@/lib/siteFonts";

interface LanguageOption {
  code: string;
  label: string;
}

interface PageHeaderProps {
  brandName?: string;
  githubLabel?: string;
  languageLabel?: string;
  languages?: LanguageOption[];
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
}

export default function PageHeader({
  brandName = "Markdown Resume AI",
  githubLabel = "GitHub",
  languageLabel = "Language",
  languages,
  currentLanguage,
  onLanguageChange,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        siteSans.className,
        "sticky top-0 z-30 border-b border-[#dad4c8] bg-[#faf9f7]/95 backdrop-blur"
      )}
    >
      <div className="container mx-auto px-6 py-4 md:px-10 xl:px-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="inline-flex items-center gap-3 text-black">
            <span className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-[#dad4c8] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)]">
              <Logo />
            </span>
            <span>
              <span
                className={cn(
                  siteMono.className,
                  "block text-[11px] uppercase tracking-[0.24em] text-[#55534e]"
                )}
              >
                Resume workspace
              </span>
              <span className="block text-xl font-semibold tracking-[-0.04em] md:text-2xl">
                {brandName}
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {languages && languages.length > 0 && onLanguageChange ? (
              <div className="inline-flex items-center gap-1 rounded-full border border-[#dad4c8] bg-white p-1 shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)]">
                <span
                  className={cn(
                    siteMono.className,
                    "px-2 text-[11px] uppercase tracking-[0.22em] text-[#55534e]"
                  )}
                >
                  {languageLabel}
                </span>
                {languages.map((language) => {
                  const isActive = language.code === currentLanguage;
                  return (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => onLanguageChange(language.code)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-transform duration-200 ${
                        isActive
                          ? "bg-[#000000] text-white"
                          : "text-[#333333] hover:-rotate-2 hover:-translate-y-0.5 hover:bg-[#f8cc65]"
                      }`}
                      aria-pressed={isActive}
                    >
                      {language.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <Link
              href="https://github.com/siriuswhiter/md-resume-ai"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-black bg-white px-4 py-2 text-sm font-medium text-black shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:-translate-y-1 hover:-rotate-2 hover:bg-[#3bd3fd] hover:shadow-[-7px_7px_0_#000000]"
            >
              <Github size={20} />
              {githubLabel}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
