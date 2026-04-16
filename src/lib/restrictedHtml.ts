import type { Schema } from "hast-util-sanitize";
import { defaultSchema } from "rehype-sanitize";

const resumeClassNames = [
  "resume-header",
  "resume-header-main",
  "resume-header-side",
  "resume-inline",
  "resume-stack",
  "resume-meta",
  "resume-tag-list",
  "resume-tag",
];

function createResumeClassAttribute() {
  return [
    "className",
    ...resumeClassNames,
    /^resume-[a-z0-9-]+$/,
  ] as [string, ...(string | RegExp)[]];
}

export const restrictedResumeHtmlSchema: Schema = {
  ...defaultSchema,
  tagNames: Array.from(
    new Set([
      ...(defaultSchema.tagNames ?? []),
      "div",
      "span",
      "section",
      "header",
      "br",
    ])
  ),
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      "href",
      "title",
      createResumeClassAttribute(),
    ],
    div: [createResumeClassAttribute()],
    span: [createResumeClassAttribute()],
    p: [
      ...(defaultSchema.attributes?.p ?? []),
      createResumeClassAttribute(),
    ],
    section: [createResumeClassAttribute()],
    header: [createResumeClassAttribute()],
    h1: [
      ...(defaultSchema.attributes?.h1 ?? []),
      createResumeClassAttribute(),
    ],
    h2: [
      ...(defaultSchema.attributes?.h2 ?? []),
      createResumeClassAttribute(),
    ],
    h3: [
      ...(defaultSchema.attributes?.h3 ?? []),
      createResumeClassAttribute(),
    ],
    ul: [
      ...(defaultSchema.attributes?.ul ?? []),
      createResumeClassAttribute(),
    ],
    ol: [
      ...(defaultSchema.attributes?.ol ?? []),
      createResumeClassAttribute(),
    ],
    li: [
      ...(defaultSchema.attributes?.li ?? []),
      createResumeClassAttribute(),
    ],
    strong: [
      ...(defaultSchema.attributes?.strong ?? []),
      createResumeClassAttribute(),
    ],
    em: [
      ...(defaultSchema.attributes?.em ?? []),
      createResumeClassAttribute(),
    ],
  },
};
