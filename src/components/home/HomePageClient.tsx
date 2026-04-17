"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
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
const primaryTemplates = Object.keys(ThemeList).slice(0, 4);
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
    heroBadge: "AI drafting, template switching, and PDF export in one workspace",
    heroTitle: "Build a resume that feels crafted, not assembled from tools.",
    heroDescription:
      "Markdown Resume AI gives you a focused editor for turning rough career notes into clean, ATS-friendly resumes. Draft with AI, compare templates live, and export with confidence.",
    primaryCta: "Start Building",
    secondaryCta: "Explore Templates",
    trustPoints: [
      "Live editor and paper preview in one screen",
      "Markdown source that stays easy to version",
      "ATS-friendly single-column output by default",
      "Templates built for technical and modern resumes",
    ],
    editorViewLabel: "Editor View",
    editorViewValue: "Real workspace capture",
    convertsLabel: "Why it lands",
    convertsDescription:
      "Users can see the editor, the paper preview, and the export path before they click in.",
    editorImageAlt:
      "Markdown Resume AI editor workspace with editor, preview, and export controls",
    pillars: [
      {
        title: "AI draft generation",
        description:
          "Paste rough career notes, let AI turn them into structured Markdown, then edit the result instead of starting from a blank page.",
      },
      {
        title: "Template-ready layouts",
        description:
          "Switch between polished resume themes and density presets without rewriting content or fighting formatting.",
      },
      {
        title: "Reliable PDF export",
        description:
          "Preview the page at paper ratio first, then export a clean PDF that is ready to share with recruiters and hiring managers.",
      },
    ],
    journeyEyebrow: "Why teams and candidates care",
    journeyTitle: "Move from messy notes to a polished resume in one flow.",
    journeyDescription:
      "The homepage should reduce doubt fast: yes, it has AI help; yes, you can compare templates; yes, the export looks like the preview.",
    assistantLabel: "AI assistant",
    assistantTitle: "Paste raw accomplishments. Generate a strong first draft. Keep full control.",
    assistantDescription:
      "The AI path is positioned as an accelerator, not a black box. That is the right promise for professional users.",
    workflowSteps: [
      {
        step: "01",
        title: "Bring your raw experience",
        description:
          "Start from a template or paste notes from LinkedIn, past resumes, or project bullets.",
      },
      {
        step: "02",
        title: "Generate and refine with AI",
        description:
          "Turn messy input into Markdown, tighten the wording, and keep every section editable.",
      },
      {
        step: "03",
        title: "Choose the right presentation",
        description:
          "Test templates, typography, spacing, and colors in a live side-by-side workspace.",
      },
      {
        step: "04",
        title: "Export the final PDF",
        description:
          "Review the paper preview, export once, and send a version that looks deliberate and recruiter-friendly.",
      },
    ],
    templatesEyebrow: "Templates",
    templatesTitle: "Start from a layout that already looks hire-ready.",
    templatesDescription:
      "Template previews are part of the product story. They prove that content, layout, and export quality are all handled inside one tool.",
    openEditor: "Open the editor",
    templateCardDescription: "Open in the editor and tune fonts, spacing, and palette.",
    finalEyebrow: "Final push",
    finalTitle: "Stop stitching together notes, templates, and PDF tools.",
    finalDescription:
      "Use one workspace to draft with AI, tune the presentation, and export the version you are ready to send.",
    finalPrimaryCta: "Create My Resume",
    finalSecondaryCta: "Read Resume Guides",
    resourcesEyebrow: "Resources",
    resourcesTitle: "Learn how to write resumes that read clearly and export cleanly.",
    resourcesDescription:
      "Keep the homepage conversion-focused, but still give researching visitors a clear next step.",
    readArticle: "Read article",
    footerCopyright: `© ${new Date().getFullYear()} Markdown Resume AI. All rights reserved.`,
    footerCredit: "Built by Sirius Whiter",
  },
  zh: {
    brandName: "Markdown Resume AI",
    languageLabel: "语言",
    githubLabel: "GitHub",
    heroBadge: "AI 起草、模板切换与 PDF 导出，全部集中在一个工作区内",
    heroTitle: "把简历做成有设计感的成品，而不是工具拼起来的文件。",
    heroDescription:
      "Markdown Resume AI 提供一个聚焦的简历工作区，帮助你把零散经历整理成清晰、利于 ATS 识别的简历。你可以用 AI 起草、实时对比模板，并稳定导出 PDF。",
    primaryCta: "开始制作",
    secondaryCta: "查看模板",
    trustPoints: [
      "同屏完成编辑与纸张预览",
      "Markdown 源内容便于复用和版本管理",
      "默认输出 ATS 友好的单栏简历",
      "模板适合技术岗位与现代简历风格",
    ],
    editorViewLabel: "编辑器视图",
    editorViewValue: "真实工作区截图",
    convertsLabel: "核心价值",
    convertsDescription: "用户在点击进入前，就能看到编辑、预览和导出的完整路径。",
    editorImageAlt: "Markdown Resume AI 编辑器工作区，包含编辑、预览与导出控制区域",
    pillars: [
      {
        title: "AI 简历初稿生成",
        description:
          "粘贴原始经历或项目笔记，让 AI 整理成结构化 Markdown，再在此基础上继续编辑，而不是从空白页开始。",
      },
      {
        title: "可直接使用的模板",
        description:
          "在不改写内容的前提下切换不同简历主题和版式密度，快速找到合适的呈现方式。",
      },
      {
        title: "稳定的 PDF 导出",
        description:
          "先按纸张比例预览，再导出整洁、可直接投递的 PDF，减少排版偏差。",
      },
    ],
    journeyEyebrow: "为什么值得使用",
    journeyTitle: "把零散素材整理成专业简历，只需要一条工作流。",
    journeyDescription:
      "首页需要快速消除疑虑：有 AI 辅助，可以切换模板，导出效果与预览一致。这一部分把整条路径讲清楚。",
    assistantLabel: "AI 助手",
    assistantTitle: "粘贴原始经历，生成高质量初稿，并始终保留你的编辑控制权。",
    assistantDescription:
      "这里的 AI 不是黑盒，而是提效工具。对于认真打磨简历的用户，这才是正确的产品承诺。",
    workflowSteps: [
      {
        step: "01",
        title: "准备原始经历",
        description: "可以从模板开始，也可以直接粘贴 LinkedIn、旧简历或项目要点。",
      },
      {
        step: "02",
        title: "用 AI 生成并润色",
        description: "把杂乱输入整理成 Markdown 简历草稿，再逐段收紧措辞并持续编辑。",
      },
      {
        step: "03",
        title: "选择合适的呈现方式",
        description: "在同一工作区内对比模板、字体、间距和颜色，而不是来回切工具。",
      },
      {
        step: "04",
        title: "导出最终 PDF",
        description: "确认纸张预览无误后一次导出，得到可以直接发送的正式版本。",
      },
    ],
    templatesEyebrow: "模板",
    templatesTitle: "从已经足够专业的版式开始，而不是从空白排版开始。",
    templatesDescription:
      "模板预览本身就是产品能力的一部分，它证明内容、布局与导出质量都在同一个工具里完成。",
    openEditor: "打开编辑器",
    templateCardDescription: "在编辑器中打开，并继续调整字体、间距与配色。",
    finalEyebrow: "最后一步",
    finalTitle: "不要再在笔记、模板和 PDF 工具之间来回拼接。",
    finalDescription: "在一个工作区里完成 AI 起草、样式微调与最终导出。",
    finalPrimaryCta: "立即创建简历",
    finalSecondaryCta: "查看简历指南",
    resourcesEyebrow: "资源",
    resourcesTitle: "学习如何写出结构清晰、导出稳定的专业简历。",
    resourcesDescription: "首页保持转化导向，同时也为还在研究方法的用户提供下一步入口。",
    readArticle: "阅读文章",
    footerCopyright: `© ${new Date().getFullYear()} Markdown Resume AI. 保留所有权利。`,
    footerCredit: "由 Sirius Whiter 构建",
  },
} as const;

const pillarIcons = [WandSparkles, LayoutTemplate, FileDown] as const;
const trustCardAccents = [
  "border-dashed bg-[#ffffff] text-[#333333]",
  "bg-[#84e7a5] text-[#02492a]",
  "bg-[#f8cc65] text-[#333333]",
  "bg-[#c1b0ff] text-[#32037d]",
];
const pillarCardStyles = [
  "bg-white",
  "bg-[#84e7a5] text-[#02492a]",
  "bg-[#3bd3fd] text-[#01418d]",
];
const workflowCardStyles = [
  "bg-white",
  "bg-[#f8cc65] text-[#333333]",
  "bg-[#c1b0ff] text-[#32037d]",
  "bg-[#84e7a5] text-[#02492a]",
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

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {t.trustPoints.map((point, index) => (
                    <div
                      key={point}
                      className={cn(
                        clayShadow,
                        "rounded-[24px] border border-[#dad4c8] px-4 py-4",
                        trustCardAccents[index % trustCardAccents.length]
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-black bg-white">
                          <Check className="h-4 w-4" />
                        </span>
                        <p className="text-sm leading-6">{point}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div
                  className={cn(
                    clayShadow,
                    "absolute left-4 top-4 z-10 hidden rounded-[24px] border border-[#dad4c8] bg-white px-4 py-3 lg:block"
                  )}
                >
                  <p className={cn(monoLabel, "text-[#55534e]")}>{t.editorViewLabel}</p>
                  <p className="mt-2 text-sm font-medium">{t.editorViewValue}</p>
                </div>

                <div
                  className={cn(
                    clayShadow,
                    "absolute bottom-4 right-4 z-10 hidden max-w-[240px] rounded-[24px] border border-[#dad4c8] bg-[#84e7a5] px-4 py-4 lg:block"
                  )}
                >
                  <p className={cn(monoLabel, "text-[#02492a]")}>{t.convertsLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-[#02492a]">{t.convertsDescription}</p>
                </div>

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
          <div className="grid gap-4 lg:grid-cols-3">
            {t.pillars.map((pillar, index) => {
              const Icon = pillarIcons[index];

              return (
                <article
                  key={pillar.title}
                  className={cn(
                    clayShadow,
                    "rounded-[28px] border border-[#dad4c8] p-7",
                    pillarCardStyles[index % pillarCardStyles.length]
                  )}
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-black bg-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-[2rem] font-semibold leading-tight tracking-[-0.04em]">
                    {pillar.title}
                  </h2>
                  <p className="mt-3 text-base leading-7 opacity-90">{pillar.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-6 py-6 md:px-10 xl:px-16">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
            <div
              className={cn(
                clayShadow,
                "rounded-[40px] border border-[#dad4c8] bg-white p-7 md:p-8"
              )}
            >
              <p className={cn(monoLabel, "text-[#55534e]")}>{t.journeyEyebrow}</p>
              <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
                {t.journeyTitle}
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-[#333333]">
                {t.journeyDescription}
              </p>

              <div
                className={cn(
                  clayShadow,
                  "mt-8 rounded-[32px] border border-[#dad4c8] bg-[#32037d] p-6 text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10">
                    <Bot className="h-5 w-5" />
                  </span>
                  <p className={cn(monoLabel, "text-[#c1b0ff]")}>{t.assistantLabel}</p>
                </div>
                <p className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.03em]">
                  {t.assistantTitle}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/80">{t.assistantDescription}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {t.workflowSteps.map((item, index) => (
                <article
                  key={item.step}
                  className={cn(
                    clayShadow,
                    "rounded-[28px] border border-[#dad4c8] p-6",
                    workflowCardStyles[index % workflowCardStyles.length]
                  )}
                >
                  <p className={cn(monoLabel, "opacity-70")}>{item.step}</p>
                  <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 opacity-90">{item.description}</p>
                </article>
              ))}
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

              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {primaryTemplates.map((template, index) => (
                  <TemplateCard
                    key={template}
                    template={template}
                    description={t.templateCardDescription}
                    accent={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-6 md:px-10 xl:px-16">
          <div
            className={cn(
              clayShadow,
              "rounded-[40px] border border-[#525a69] bg-[#01418d] p-8 text-white md:p-10"
            )}
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
              <div>
                <p className={cn(monoLabel, "text-[#3bd3fd]")}>{t.finalEyebrow}</p>
                <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
                  {t.finalTitle}
                </h2>
                <p className="mt-4 max-w-xl text-lg leading-8 text-white/80">{t.finalDescription}</p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                <Link
                  href="/editor?template=mashhad"
                  className={cn(clayButton, "bg-white text-black hover:bg-[#f8cc65]")}
                >
                  {t.finalPrimaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#blog-posts"
                  className={cn(
                    clayButton,
                    "border-white bg-transparent text-white hover:bg-[#fc7981] hover:text-black"
                  )}
                >
                  {t.finalSecondaryCta}
                </Link>
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

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {latestPosts.map((post, index) => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  readArticleLabel={t.readArticle}
                  accent={index}
                />
              ))}
            </div>
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
  accent,
}: {
  template: string;
  description: string;
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
        <p className={cn(monoLabel, "text-[#55534e]")}>Template preview</p>
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

function BlogCard({
  post,
  readArticleLabel,
  accent,
}: {
  post: BlogPost;
  readArticleLabel: string;
  accent: number;
}) {
  const accentBars = ["bg-[#fc7981]", "bg-[#84e7a5]", "bg-[#3bd3fd]", "bg-[#c1b0ff]"];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        clayShadow,
        "group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#dad4c8] bg-[#faf9f7] transition-transform duration-200 hover:-translate-y-1 hover:-rotate-1 hover:shadow-[-7px_7px_0_#000000]"
      )}
    >
      <div className={cn("h-2 w-full", accentBars[accent % accentBars.length])} />
      {post.metadata.image ? (
        <Image
          src={post.metadata.image}
          alt={post.metadata.title}
          width={1200}
          height={720}
          className="h-auto w-full object-cover"
        />
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <p className={cn(monoLabel, "text-[#55534e]")}>Resume guide</p>
        <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em] text-black">
          {post.metadata.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#55534e]">
          {post.metadata.summary}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-black">
          {readArticleLabel}
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
