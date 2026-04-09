"use client";

import Logo from "@/components/Logo";
import Link from "next/link";
import React from "react";
import { Github } from "lucide-react";

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
    <header className="container mx-auto p-8 md:px-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Logo />
          <Link href="/" className="ml-3 text-2xl font-bold text-gray-900">
            {brandName}
          </Link>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {languages && languages.length > 0 && onLanguageChange ? (
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
              <span className="px-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {languageLabel}
              </span>
              {languages.map((language) => {
                const isActive = language.code === currentLanguage;
                return (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => onLanguageChange(language.code)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
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
            className="flex items-center gap-2 rounded-md border border-black bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Github size={20} />
            {githubLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
