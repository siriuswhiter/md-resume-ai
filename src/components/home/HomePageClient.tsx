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

type Language = "en" | "zh";

interface HomePageClientProps {
  latestPosts: BlogPost[];
}

const STORAGE_KEY = "homepage-language";
const primaryTemplates = Object.keys(ThemeList).slice(0, 4);

const copy = {
  en: {
    brandName: "Markdown Resume AI",
    languageLabel: "Language",
    githubLabel: "GitHub",
    heroBadge: "AI drafting, template switching, and PDF export in one workspace",
    heroTitle: "Build a resume that looks deliberate before it ever becomes a PDF.",
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
    convertsLabel: "What converts",
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
    heroTitle: "在导出 PDF 之前，先把简历打磨到足够专业。",
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(245,158,11,0.16),_transparent_20%),linear-gradient(180deg,_#f7f8f2_0%,_#eef2f7_38%,_#ffffff_100%)] text-slate-900">
      <PageHeader
        brandName={t.brandName}
        githubLabel={t.githubLabel}
        languageLabel={t.languageLabel}
        languages={languageOptions}
        currentLanguage={language}
        onLanguageChange={(nextLanguage) => setLanguage(nextLanguage as Language)}
      />

      <main>
        <section className="container mx-auto px-6 pb-12 pt-6 md:px-10 md:pb-16 md:pt-8 xl:px-16">
          <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/85 px-4 py-2 text-sm font-medium text-sky-900 shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-sky-600" />
                {t.heroBadge}
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
                {t.heroTitle}
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
                {t.heroDescription}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/editor?template=mashhad"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {t.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#templates"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/85 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
                >
                  {t.secondaryCta}
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {t.trustPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-8 hidden rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.1)] backdrop-blur lg:block">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                  {t.editorViewLabel}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{t.editorViewValue}</p>
              </div>

              <div className="absolute -bottom-4 right-0 z-10 hidden max-w-[220px] rounded-[28px] border border-amber-200 bg-[#fff8eb] p-5 shadow-[0_20px_50px_rgba(217,119,6,0.12)] lg:block">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-700/70">
                  {t.convertsLabel}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{t.convertsDescription}</p>
              </div>

              <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/70 p-3 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur md:p-4">
                <Image
                  src="/screenshots/editor-workspace.png"
                  alt={t.editorImageAlt}
                  width={1600}
                  height={1200}
                  priority
                  className="h-auto w-full rounded-[24px] border border-slate-200 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-4 md:px-10 xl:px-16">
          <div className="grid gap-4 lg:grid-cols-3">
            {t.pillars.map((pillar, index) => {
              const Icon = pillarIcons[index];
              return (
                <article
                  key={pillar.title}
                  className="rounded-[28px] border border-slate-200 bg-white/85 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-slate-950">
                    {pillar.title}
                  </h2>
                  <p className="mt-3 text-base leading-7 text-slate-600">{pillar.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 md:px-10 xl:px-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
            <div className="max-w-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
                {t.journeyEyebrow}
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
                {t.journeyTitle}
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">{t.journeyDescription}</p>
              <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-slate-50 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-sky-300" />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">
                    {t.assistantLabel}
                  </p>
                </div>
                <p className="mt-4 text-xl font-semibold">{t.assistantTitle}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{t.assistantDescription}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {t.workflowSteps.map((item) => (
                <article
                  key={item.step}
                  className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {item.step}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200/80 bg-white/70">
          <div className="container mx-auto px-6 py-16 md:px-10 xl:px-16" id="templates">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
                  {t.templatesEyebrow}
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
                  {t.templatesTitle}
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">{t.templatesDescription}</p>
              </div>

              <Link
                href="/editor?template=tehran"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-sky-700"
              >
                {t.openEditor}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {primaryTemplates.map((template) => (
                <TemplateCard
                  key={template}
                  template={template}
                  description={t.templateCardDescription}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 md:px-10 xl:px-16">
          <div className="rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,_#0f172a_0%,_#172554_55%,_#082f49_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] md:p-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
                  {t.finalEyebrow}
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">{t.finalTitle}</h2>
                <p className="mt-4 max-w-xl text-lg leading-8 text-slate-200">{t.finalDescription}</p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                <Link
                  href="/editor?template=mashhad"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  {t.finalPrimaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#blog-posts"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {t.finalSecondaryCta}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/75">
          <div className="container mx-auto px-6 py-16 md:px-10 xl:px-16" id="blog-posts">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
                {t.resourcesEyebrow}
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
                {t.resourcesTitle}
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">{t.resourcesDescription}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {latestPosts.map((post) => (
                <BlogCard key={post.slug} post={post} readArticleLabel={t.readArticle} />
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
}: {
  template: string;
  description: string;
}) {
  return (
    <Link
      href={`/editor?template=${template}`}
      className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
    >
      <Image
        src={`/screenshots/${template}-resume.png`}
        alt={`${template} resume template preview`}
        width={720}
        height={960}
        className="h-auto w-full rounded-[20px] border border-slate-200"
      />
      <div className="flex items-center justify-between px-2 pb-2 pt-4">
        <div>
          <p className="text-lg font-semibold text-slate-950">
            {ThemeList[template as keyof typeof ThemeList]}
          </p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:text-sky-700" />
      </div>
    </Link>
  );
}

function BlogCard({
  post,
  readArticleLabel,
}: {
  post: BlogPost;
  readArticleLabel: string;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
    >
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
        <h3 className="text-xl font-semibold text-slate-950 transition group-hover:text-sky-700">
          {post.metadata.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
          {post.metadata.summary}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          {readArticleLabel}
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
