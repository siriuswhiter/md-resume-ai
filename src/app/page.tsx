import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowRight,
  Bot,
  Check,
  FileDown,
  LayoutTemplate,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { ThemeList } from "@/lib/constants";
import { baseUrl, BlogPost, getBlogPosts } from "@/app/blog/utils";
import PageFooter from "@/components/PageFooter";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Markdown Resume | AI Resume Builder with Templates and PDF Export",
  description:
    "Write or generate your resume in Markdown, preview it live, switch templates, and export polished PDFs from one focused workspace.",
  keywords: [
    "AI Resume Builder",
    "Markdown Resume",
    "Resume Templates",
    "PDF Resume Export",
    "ATS Friendly Resume",
  ].join(", "),
  openGraph: {
    title: "Markdown Resume | AI Resume Builder with Templates and PDF Export",
    description:
      "A focused resume workspace for drafting with AI, switching templates, and exporting clean PDF resumes.",
    type: "website",
    url: `${baseUrl}`,
    images: `${baseUrl}/screenshots/editor-workspace.png`,
    locale: "en_US",
  },
};

const corePillars = [
  {
    title: "AI draft generation",
    description:
      "Paste rough career notes, let AI turn them into structured Markdown, then edit the result instead of starting from a blank page.",
    icon: WandSparkles,
  },
  {
    title: "Template-ready layouts",
    description:
      "Switch between polished resume themes and density presets without rewriting content or fighting formatting.",
    icon: LayoutTemplate,
  },
  {
    title: "Reliable PDF export",
    description:
      "Preview the page at paper ratio first, then export a clean PDF that is ready to share with recruiters and hiring managers.",
    icon: FileDown,
  },
];

const workflowSteps = [
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
];

const trustPoints = [
  "Live editor + paper preview in one screen",
  "Markdown source that stays easy to version",
  "ATS-friendly single-column output by default",
  "Templates built for technical and modern resumes",
];

const primaryTemplates = Object.keys(ThemeList).slice(0, 4);

export default function Home() {
  const latestPosts = getBlogPosts()
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime()
    )
    .slice(0, 3);

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(245,158,11,0.16),_transparent_20%),linear-gradient(180deg,_#f7f8f2_0%,_#eef2f7_38%,_#ffffff_100%)] text-slate-900">
        <PageHeader />

        <main>
          <section className="container mx-auto px-6 pb-12 pt-6 md:px-10 md:pb-16 md:pt-8 xl:px-16">
            <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/85 px-4 py-2 text-sm font-medium text-sky-900 shadow-sm backdrop-blur">
                  <Sparkles className="h-4 w-4 text-sky-600" />
                  AI drafting, template switching, and PDF export in one workspace
                </div>

                <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
                  Build a resume that looks deliberate before it ever becomes a PDF.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
                  Markdown Resume gives you a focused editor for turning rough career notes
                  into clean, ATS-friendly resumes. Draft with AI, compare templates live,
                  and export with confidence.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/editor?template=mashhad"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Start Building
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#templates"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/85 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Explore Templates
                  </Link>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  {trustPoints.map((point) => (
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
                    Editor View
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Real workspace capture
                  </p>
                </div>

                <div className="absolute -bottom-4 right-0 z-10 hidden max-w-[220px] rounded-[28px] border border-amber-200 bg-[#fff8eb] p-5 shadow-[0_20px_50px_rgba(217,119,6,0.12)] lg:block">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-700/70">
                    What converts
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Users can see the editor, the paper preview, and the export path before
                    they click in.
                  </p>
                </div>

                <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/70 p-3 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur md:p-4">
                  <Image
                    src="/screenshots/editor-workspace.png"
                    alt="Markdown Resume editor workspace with editor, preview, and export controls"
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
              {corePillars.map((pillar) => {
                const Icon = pillar.icon;
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
                    <p className="mt-3 text-base leading-7 text-slate-600">
                      {pillar.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="container mx-auto px-6 py-16 md:px-10 xl:px-16">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
              <div className="max-w-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Why teams and candidates care
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
                  Move from messy notes to a polished resume in one flow.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  The homepage should reduce doubt fast: yes, it has AI help; yes, you can
                  compare templates; yes, the export looks like the preview. This section
                  makes that journey explicit.
                </p>
                <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-slate-50 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
                  <div className="flex items-center gap-3">
                    <Bot className="h-5 w-5 text-sky-300" />
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">
                      AI assistant
                    </p>
                  </div>
                  <p className="mt-4 text-xl font-semibold">
                    Paste raw accomplishments. Generate a strong first draft. Keep full control.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    The AI path is positioned as an accelerator, not a black box. That is the
                    right promise for professional users.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {workflowSteps.map((item) => (
                  <article
                    key={item.step}
                    className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {item.step}
                    </p>
                    <h3 className="mt-4 text-xl font-semibold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">
                      {item.description}
                    </p>
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
                    Templates
                  </p>
                  <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
                    Start from a layout that already looks hire-ready.
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-slate-600">
                    Template previews are part of the product story. They prove that content,
                    layout, and export quality are all handled inside one tool.
                  </p>
                </div>

                <Link
                  href="/editor?template=tehran"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-sky-700"
                >
                  Open the editor
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {primaryTemplates.map((template) => (
                  <TemplateCard key={template} template={template} />
                ))}
              </div>
            </div>
          </section>

          <section className="container mx-auto px-6 py-16 md:px-10 xl:px-16">
            <div className="rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,_#0f172a_0%,_#172554_55%,_#082f49_100%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] md:p-12">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
                    Final push
                  </p>
                  <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
                    Stop stitching together notes, templates, and PDF tools.
                  </h2>
                  <p className="mt-4 max-w-xl text-lg leading-8 text-slate-200">
                    Use one workspace to draft with AI, tune the presentation, and export the
                    version you are ready to send.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                  <Link
                    href="/editor?template=mashhad"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Create My Resume
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#blog-posts"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Read Resume Guides
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white/75">
            <div className="container mx-auto px-6 py-16 md:px-10 xl:px-16" id="blog-posts">
              <div className="mb-10 max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Resources
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
                  Learn how to write resumes that read clearly and export cleanly.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Keep the homepage conversion-focused, but still give researching visitors a
                  clear next step.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {latestPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          </section>
        </main>

        <PageFooter />
      </div>
    </>
  );
}

function TemplateCard({ template }: { template: string }) {
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
          <p className="mt-1 text-sm text-slate-500">
            Open in the editor and tune fonts, spacing, and palette.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:text-sky-700" />
      </div>
    </Link>
  );
}

interface BlogCardProps {
  post: BlogPost;
}

function BlogCard({ post }: BlogCardProps) {
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
          Read article
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
