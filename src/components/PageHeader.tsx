"use client";

import Logo from "@/components/Logo";
import Link from "next/link";
import React from "react";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteSans } from "@/lib/siteFonts";

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
  languages,
  currentLanguage,
  onLanguageChange,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        siteSans.className,
        "sticky top-0 z-30 border-b border-[--ui-border] bg-white/95 backdrop-blur"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-3 md:px-10 xl:px-16">
        <Link href="/" className="inline-flex items-center gap-2.5 text-[--ui-text]">
          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--ui-radius)] border border-[--ui-border]">
            <Logo />
          </span>
          <span className="text-sm font-semibold tracking-tight">{brandName}</span>
        </Link>

        <div className="flex items-center gap-3">
          {languages && languages.length > 0 && onLanguageChange ? (
            <div className="flex items-center gap-1 rounded-[var(--ui-radius)] border border-[--ui-border] p-0.5">
              {languages.map((language) => {
                const isActive = language.code === currentLanguage;
                return (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => onLanguageChange(language.code)}
                    className={`rounded-[4px] px-3 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[--ui-text] text-white"
                        : "text-[--ui-text-muted] hover:text-[--ui-text]"
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
            className="inline-flex items-center gap-1.5 rounded-[var(--ui-radius)] border border-[--ui-border] px-3 py-1.5 text-xs font-medium text-[--ui-text-muted] transition-colors hover:border-[--ui-text] hover:text-[--ui-text]"
          >
            <Github size={14} />
            {githubLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
