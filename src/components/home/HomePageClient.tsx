"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import PageFooter from "@/components/PageFooter";
import PageHeader from "@/components/PageHeader";
import { ThemeList } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { siteSans } from "@/lib/siteFonts";

type Language = "en" | "zh";

const STORAGE_KEY = "homepage-language";
const primaryTemplates = Object.keys(ThemeList).slice(0, 3);

const copy = {
  en: {
    brandName: "Markdown Resume AI",
    githubLabel: "GitHub",
    heroTitle: "Write your resume in Markdown. Preview live. Export to PDF.",
    heroDescription:
      "Pick a template, edit in plain Markdown, and download a clean PDF — all in one place.",
    primaryCta: "Start Building",
    secondaryCta: "Browse Templates",
    templatesLabel: "Templates",
    openInEditor: "Open in editor",
    footerCopyright: `© ${new Date().getFullYear()} Markdown Resume AI. All rights reserved.`,
    footerCredit: "Built by Sirius Whiter",
  },
  zh: {
    brandName: "Markdown Resume AI",
    githubLabel: "GitHub",
    heroTitle: "用 Markdown 写简历，实时预览，一键导出 PDF。",
    heroDescription:
      "选模板、在编辑器里写 Markdown、下载 PDF，全部在一个页面完成。",
    primaryCta: "开始制作",
    secondaryCta: "浏览模板",
    templatesLabel: "模板",
    openInEditor: "在编辑器中打开",
    footerCopyright: `© ${new Date().getFullYear()} Markdown Resume AI. 保留所有权利。`,
    footerCredit: "由 Sirius Whiter 构建",
  },
} as const;

export default function HomePageClient() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") {
      setLanguage(stored);
      return;
    }
    setLanguage(
      window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en"
    );
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const t = copy[language];
  const languageOptions = useMemo(
    () => [
      { code: "zh", label: "中文" },
      { code: "en", label: "English" },
    ],
    []
  );

  return (
    <div className={cn(siteSans.className, "flex h-screen flex-col bg-white text-[--ui-text]")}>
      <PageHeader
        brandName={t.brandName}
        githubLabel={t.githubLabel}
        languages={languageOptions}
        currentLanguage={language}
        onLanguageChange={(next) => setLanguage(next as Language)}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Hero */}
        <section className="container mx-auto shrink-0 px-6 py-10 md:px-10 xl:px-16">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            {t.heroTitle}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[--ui-text-muted]">
            {t.heroDescription}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/editor?template=mashhad"
              className="inline-flex items-center gap-2 rounded-[var(--ui-radius)] bg-[--ui-text] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
              {t.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#templates"
              className="inline-flex items-center gap-2 rounded-[var(--ui-radius)] border border-[--ui-border] px-4 py-2 text-sm font-medium text-[--ui-text] transition-colors hover:border-[--ui-text]"
            >
              {t.secondaryCta}
            </Link>
          </div>
        </section>

        {/* Templates */}
        <section
          id="templates"
          className="container mx-auto flex min-h-0 flex-1 flex-col px-6 pb-4 md:px-10 xl:px-16"
        >
          <p className="mb-3 shrink-0 text-xs font-medium uppercase tracking-widest text-[--ui-text-muted]">
            {t.templatesLabel}
          </p>
          <div className="grid min-h-0 flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {primaryTemplates.map((template) => (
              <TemplateCard
                key={template}
                template={template}
                label={t.openInEditor}
              />
            ))}
          </div>
        </section>
      </main>

      <PageFooter
        copyrightText={t.footerCopyright}
        creditText={t.footerCredit}
      />
    </div>
  );
}

function TemplateCard({
  template,
  label,
}: {
  template: string;
  label: string;
}) {
  return (
    <Link
      href={`/editor?template=${template}`}
      className="group flex min-h-0 flex-col overflow-hidden rounded-[var(--ui-radius)] border border-[--ui-border] bg-[--ui-bg-subtle] transition-colors hover:border-[--ui-text]"
    >
      <div className="min-h-0 flex-1 overflow-hidden p-2">
        <Image
          src={`/screenshots/${template}-resume.png`}
          alt={`${template} resume template`}
          width={720}
          height={960}
          className="h-full w-full rounded-[4px] object-cover object-top"
        />
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-[--ui-border] px-4 py-3">
        <span className="text-sm font-medium text-[--ui-text]">
          {ThemeList[template as keyof typeof ThemeList]}
        </span>
        <span className="flex items-center gap-1 text-xs text-[--ui-text-muted] transition-colors group-hover:text-[--ui-text]">
          {label}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
