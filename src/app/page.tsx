import { Metadata } from "next";
import { baseUrl, getBlogPosts } from "@/app/blog/utils";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "Markdown Resume AI | AI Resume Builder with Templates and PDF Export",
  description:
    "Write or generate your resume in Markdown, preview it live, switch templates, and export polished PDFs from one focused workspace.",
  keywords: [
    "AI Resume Builder",
    "Markdown Resume AI",
    "Markdown Resume",
    "Resume Templates",
    "PDF Resume Export",
    "ATS Friendly Resume",
  ].join(", "),
  openGraph: {
    title: "Markdown Resume AI | AI Resume Builder with Templates and PDF Export",
    description:
      "A focused resume workspace for drafting with AI, switching templates, and exporting clean PDF resumes.",
    type: "website",
    url: `${baseUrl}`,
    images: `${baseUrl}/screenshots/editor-workspace.png`,
    locale: "en_US",
  },
};

export default function Home() {
  const latestPosts = getBlogPosts()
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime()
    )
    .slice(0, 3);

  return <HomePageClient latestPosts={latestPosts} />;
}
