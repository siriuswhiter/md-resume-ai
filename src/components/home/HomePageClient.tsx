"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  FileDown,
  LayoutTemplate,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import PageFooter from "@/components/PageFooter";
import PageHeader from "@/components/PageHeader";
import { ThemeList } from "@/lib/constants";
import type { BlogPost } from "@/app/blog/utils";
import { cn } from "@/lib/utils";
import { siteMono, siteSans } from "@/lib/siteFonts";

type Language = "en" | "zh";

interface HomePageClientProps {
  latestPosts: BlogPost[];
}

const STORAGE_KEY = "homepage-language";
const primaryTemplates = Object.keys(ThemeList).slice(0, 3);
const clayShadow =
  "shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)]";
const clayButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-black px-6 py-3.5 text-sm font-medium transition-transform duration-200 hover:-translate-y-1 hover:-rotate-2 hover:shadow-[-7px_7px_0_#000000]";
const monoLabel = cn(
  siteMono.className,
  "text-[11px] font-normal uppercase tracking-[0.28em]"
);

const copy = {
  en: {
    brandName: "Markdown Resume AI",
    languageLabel: "Language",
    githubLabel: "GitHub",
    heroBadge: "AI drafting, template switching, PDF export",
    heroTitle: "Build a resume that feels crafted, not assembled from tools.",
    heroDescription:
      "A focused resume workspace for turning rough notes into clean Markdown, live previews, and a share-ready PDF.",
    primaryCta: "Start Building",
    secondaryCta: "Explore Templates",
    trustPoints: [
      "Editor and paper preview side by side",
      "Markdown that stays easy to revise",
      "ATS-friendly output by default",
    ],
    editorImageAlt:
      "Markdown Resume AI editor workspace with editor, preview, and export controls",
    workflowEyebrow: "How it works",
    workflowTitle: "Everything important fits into one short path.",
    workflowDescription:
      "The page now focuses on the three steps users care about most: draft, tune, export.",
    workflowSteps: [
      {
        title: "Draft from rough notes",
        description:
          "Paste raw experience or old bullets and turn them into a structured first version.",
      },
      {
        title: "Adjust layout live",
        description:
          "Compare templates, spacing, and typography in the same workspace.",
      },
      {
        title: "Export the final PDF",
        description:
          "Check the paper preview first, then export a clean file that matches what you see.",
      },
    ],
    templatesEyebrow: "Templates",
    templatesTitle: "Start from a layout that already looks hire-ready.",
    templatesDescription:
      "Open a strong default, then fine-tune fonts, spacing, and colors only if needed.",
    openEditor: "Open the editor",
    templateCardDescription: "Open in the editor and continue from there.",
    templatePreviewLabel: "Template preview",
    resourcesEyebrow: "Resources",
    resourcesTitle: "A few resume guides if you want them.",
    resourcesDescription:
      "Useful reading without turning the homepage into a content wall.",
    resourceLabel: "Resume guide",
    readArticle: "Read article",
    footerCopyright: `© ${new Date().getFullYear()} Markdown Resume AI. All rights reserved.`,
    footerCredit: "Built by Sirius Whiter",
  },
  zh: {
    brandName: "Markdown Resume AI",
    languageLabel: "语言",
    githubLabel: "GitHub",
    heroBadge: "AI 起草、模板切换、PDF 导出",
    heroTitle: "把简历做成有设计感的成品，而不是工具拼起来的文件。",
    heroDescription:
      "用一个更聚焦的工作区，把零散经历整理成清晰的 Markdown 简历、实时预览和可直接发送的 PDF。",
    primaryCta: "开始制作",
    secondaryCta: "查看模板",
    trustPoints: [
      "同屏完成编辑与纸张预览",
      "Markdown 内容便于持续修改",
      "默认输出 ATS 友好的版式",
    ],
    editorImageAlt: "Markdown Resume AI 编辑器工作区，包含编辑、预览与导出控制区域",
    workflowEyebrow: "使用方式",
    workflowTitle: "用户真正关心的流程，其实只需要三步。",
    workflowDescription:
      "首页重点保留起草、微调、导出三件事，信息更集中，也更容易理解。",
    workflowSteps: [
      {
        title: "从原始经历起草",
        description:
          "把项目要点、旧简历或零散笔记整理成可编辑的第一版内容。",
      },
      {
        title: "实时调整版式",
        description:
          "在同一工作区里对比模板、间距和字体，不需要来回切工具。",
      },
      {
        title: "导出最终 PDF",
        description:
          "先看纸张预览，再导出和预览一致的正式文件。",
      },
    ],
    templatesEyebrow: "模板",
    templatesTitle: "从已经足够专业的版式开始，而不是从空白排版开始。",
    templatesDescription:
      "先选一个合适的默认版式，再决定是否继续细调字体、间距和配色。",
    openEditor: "打开编辑器",
    templateCardDescription: "在编辑器中打开，然后直接继续。",
    templatePreviewLabel: "模板预览",
    resourcesEyebrow: "资源",
    resourcesTitle: "如果你还想多看一点，这里有几篇简历指南。",
    resourcesDescription: "保留少量入口，但不再让首页像内容列表。",
    resourceLabel: "简历指南",
    readArticle: "阅读文章",
    footerCopyright: `© ${new Date().getFullYear()} Markdown Resume AI. 保留所有权利。`,
    footerCredit: "由 Sirius Whiter 构建",
  },
} as const;

const workflowIcons = [WandSparkles, LayoutTemplate, FileDown] as const;
const workflowAccentStyles = [
  "bg-[#f8cc65] text-[#333333]",
  "bg-[#84e7a5] text-[#02492a]",
  "bg-[#3bd3fd] text-[#01418d]",
];

export default function HomePageClient({ latestPosts }: HomePageClientProps) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
    if (storedLanguage === "en" || storedLanguage === "zh") {
      setLanguage(storedLanguage);
      return;
    }

    const browserLanguage = window.navigator.language.toLowerCase().startsWith("zh")
      ? "zh"
      : "en";
    setLanguage(browserLanguage);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const t = copy[language];
  const featuredPosts = latestPosts.slice(0, 2);
  const languageOptions = useMemo(
    () => [
      { code: "zh", label: "中文" },
      { code: "en", label: "English" },
    ],
    []
  );

  return (
    <div
      className={cn(
        siteSans.className,
        "min-h-screen bg-[#faf9f7] text-black"
      )}
    >
      <PageHeader
        brandName={t.brandName}
        githubLabel={t.githubLabel}
        languageLabel={t.languageLabel}
        languages={languageOptions}
        currentLanguage={language}
        onLanguageChange={(nextLanguage) => setLanguage(nextLanguage as Language)}
      />

      <main className="pb-6">
        <section className="container mx-auto px-6 pb-6 pt-8 md:px-10 xl:px-16">
          <div
            className={cn(
              clayShadow,
              "overflow-hidden rounded-[40px] border border-[#dad4c8] bg-[#f8cc65]"
            )}
          >
            <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:p-8 xl:p-10">
              <div className="flex flex-col justify-between">
                <div>
                  <div
                    className={cn(
                      clayShadow,
                      "inline-flex max-w-max items-center gap-2 rounded-full border border-[#dad4c8] bg-white px-4 py-2 text-[#333333]"
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm">{t.heroBadge}</span>
                  </div>

                  <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.08em] md:text-6xl xl:text-[5rem]">
                    {t.heroTitle}
                  </h1>

                  <p className="mt-5 max-w-2xl text-lg leading-8 text-[#333333] md:text-xl">
                    {t.heroDescription}
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/editor?template=mashhad"
                      className={cn(clayButton, "bg-white text-black hover:bg-[#fc7981]")}
                    >
                      {t.primaryCta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="#templates"
                      className={cn(
                        clayButton,
                        "bg-transparent text-black hover:bg-[#c1b0ff]"
                      )}
                    >
                      {t.secondaryCta}
                    </Link>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {t.trustPoints.map((point) => (
                    <span
                      key={point}
                      className={cn(
                        clayShadow,
                        "rounded-full border border-[#dad4c8] bg-white px-4 py-2.5 text-sm text-[#333333]"
                      )}
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div
                  className={cn(
                    clayShadow,
                    "rounded-[32px] border border-[#dad4c8] bg-white p-3 md:p-4"
                  )}
                >
                  <Image
                    src="/screenshots/editor-workspace.png"
                    alt={t.editorImageAlt}
                    width={1600}
                    height={1200}
                    priority
                    className="h-auto w-full rounded-[24px] border border-[#dad4c8] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-6 md:px-10 xl:px-16">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div
              className={cn(
                clayShadow,
                "rounded-[40px] border border-[#dad4c8] bg-white p-7 md:p-8"
              )}
            >
              <p className={cn(monoLabel, "text-[#55534e]")}>{t.workflowEyebrow}</p>
              <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
                {t.workflowTitle}
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-[#333333]">
                {t.workflowDescription}
              </p>
            </div>

            <div
              className={cn(
                clayShadow,
                "overflow-hidden rounded-[40px] border border-[#dad4c8] bg-white"
              )}
            >
              {t.workflowSteps.map((item, index) => {
                const Icon = workflowIcons[index];

                return (
                  <article
                    key={item.title}
                    className={cn(
                      "flex gap-4 px-6 py-6 md:px-7",
                      index !== 0 ? "border-t border-[#eee9df]" : ""
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-12 w-12 flex-none items-center justify-center rounded-[18px] border border-black bg-white",
                        workflowAccentStyles[index % workflowAccentStyles.length]
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className={cn(monoLabel, "text-[#55534e]")}>{`0${index + 1}`}</p>
                      <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.03em] text-black">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-[#55534e]">{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-6 md:px-10 xl:px-16" id="templates">
          <div
            className={cn(
              clayShadow,
              "overflow-hidden rounded-[40px] border border-[#dad4c8] bg-[#3bd3fd]"
            )}
          >
            <div className="p-7 md:p-8 lg:p-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <p className={cn(monoLabel, "text-[#01418d]")}>{t.templatesEyebrow}</p>
                  <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
                    {t.templatesTitle}
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-[#01418d]">{t.templatesDescription}</p>
                </div>

                <Link
                  href="/editor?template=tehran"
                  className={cn(clayButton, "bg-white text-black hover:bg-[#84e7a5]")}
                >
                  {t.openEditor}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {primaryTemplates.map((template, index) => (
                  <TemplateCard
                    key={template}
                    template={template}
                    description={t.templateCardDescription}
                    previewLabel={t.templatePreviewLabel}
                    accent={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-6 md:px-10 xl:px-16" id="blog-posts">
          <div
            className={cn(
              clayShadow,
              "rounded-[40px] border border-[#dad4c8] bg-white p-7 md:p-8 lg:p-10"
            )}
          >
            <div className="mb-10 max-w-2xl">
              <p className={cn(monoLabel, "text-[#55534e]")}>{t.resourcesEyebrow}</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
                {t.resourcesTitle}
              </h2>
              <p className="mt-4 text-lg leading-8 text-[#333333]">{t.resourcesDescription}</p>
            </div>

            {featuredPosts.length > 0 ? (
              <div className="overflow-hidden rounded-[28px] border border-[#dad4c8]">
                {featuredPosts.map((post, index) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className={cn(
                      "block bg-[#faf9f7] px-6 py-6 transition-colors hover:bg-[#fff4d0] md:px-7",
                      index !== 0 ? "border-t border-[#dad4c8]" : ""
                    )}
                  >
                    <p className={cn(monoLabel, "text-[#55534e]")}>{t.resourceLabel}</p>
                    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="max-w-3xl">
                        <h3 className="text-2xl font-semibold leading-tight tracking-[-0.03em] text-black">
                          {post.metadata.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[#55534e]">
                          {post.metadata.summary}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-black">
                        {t.readArticle}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <PageFooter copyrightText={t.footerCopyright} creditText={t.footerCredit} />
    </div>
  );
}

function TemplateCard({
  template,
  description,
  previewLabel,
  accent,
}: {
  template: string;
  description: string;
  previewLabel: string;
  accent: number;
}) {
  const accents = ["hover:bg-[#fc7981]", "hover:bg-[#84e7a5]", "hover:bg-[#f8cc65]", "hover:bg-[#c1b0ff]"];

  return (
    <Link
      href={`/editor?template=${template}`}
      className={cn(
        clayShadow,
        "group overflow-hidden rounded-[28px] border border-[#dad4c8] bg-white p-3 transition-transform duration-200 hover:-translate-y-1 hover:-rotate-1 hover:shadow-[-7px_7px_0_#000000]",
        accents[accent % accents.length]
      )}
    >
      <Image
        src={`/screenshots/${template}-resume.png`}
        alt={`${template} resume template preview`}
        width={720}
        height={960}
        className="h-auto w-full rounded-[20px] border border-[#dad4c8]"
      />
      <div className="px-2 pb-2 pt-4">
        <p className={cn(monoLabel, "text-[#55534e]")}>{previewLabel}</p>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em] text-black">
              {ThemeList[template as keyof typeof ThemeList]}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#55534e]">{description}</p>
          </div>
          <ArrowRight className="mt-1 h-5 w-5 flex-none text-black" />
        </div>
      </div>
    </Link>
  );
}
