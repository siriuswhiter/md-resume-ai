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
    heroTitle: "Build a resume that feels crafted, not assembled from tools.",
    heroDescription:
      "A focused resume workspace for turning rough notes into clean Markdown, live previews, and a share-ready PDF.",
    primaryCta: "Start Building",
    secondaryCta: "Explore Templates",
    templatesLabel: "Templates",
    openInEditor: "Open in editor",
    footerCopyright: `© ${new Date().getFullYear()} Markdown Resume AI. All rights reserved.`,
    footerCredit: "Built by Sirius Whiter",
  },
  zh: {
    brandName: "Markdown Resume AI",
    githubLabel: "GitHub",
    heroTitle: "把简历做成有设计感的成品，而不是工具拼起来的文件。",
    heroDescription:
      "用一个更聚焦的工作区，把零散经历整理成清晰的 Markdown 简历、实时预览和可直接发送的 PDF。",
    primaryCta: "开始制作",
    secondaryCta: "查看模板",
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
    <div className={cn(siteSans.className, "min-h-screen bg-white text-[--ui-text]")}>
      <PageHeader
        brandName={t.brandName}
        githubLabel={t.githubLabel}
        languages={languageOptions}
        currentLanguage={language}
        onLanguageChange={(next) => setLanguage(next as Language)}
      />

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 py-20 md:px-10 xl:px-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="mt-4 text-base leading-7 text-[--ui-text-muted] md:text-lg">
              {t.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/editor?template=mashhad"
                className="inline-flex items-center gap-2 rounded-[var(--ui-radius)] bg-[--ui-text] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
              >
                {t.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#templates"
                className="inline-flex items-center gap-2 rounded-[var(--ui-radius)] border border-[--ui-border] px-5 py-2.5 text-sm font-medium text-[--ui-text] transition-colors hover:border-[--ui-text]"
              >
                {t.secondaryCta}
              </Link>
            </div>
          </div>
        </section>

        {/* Templates */}
        <section
          id="templates"
          className="container mx-auto px-6 pb-20 md:px-10 xl:px-16"
        >
          <p className="mb-6 text-xs font-medium uppercase tracking-widest text-[--ui-text-muted]">
            {t.templatesLabel}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      className="group overflow-hidden rounded-[var(--ui-radius)] border border-[--ui-border] bg-[--ui-bg-subtle] transition-colors hover:border-[--ui-text]"
    >
      <div className="p-2">
        <Image
          src={`/screenshots/${template}-resume.png`}
          alt={`${template} resume template`}
          width={720}
          height={960}
          className="h-auto w-full rounded-[4px]"
        />
      </div>
      <div className="flex items-center justify-between border-t border-[--ui-border] px-4 py-3">
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
