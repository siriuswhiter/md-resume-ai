const CONTROLLED_PREVIEW_STYLE_GUARD_CSS = `
.previewContainer {
  font-family: var(--fontName, "Open Sans"), sans-serif !important;
  padding: var(--yPaddingScale) var(--xPaddingScale) !important;
}

.previewContainer :where(div, section, header, h1, h2, h3, h4, h5, h6, p, ul, ol, li, a, strong, em, span, blockquote, code, pre) {
  font-family: inherit !important;
}

.previewContainer :where(div, section, header, h1, h2, h3, h4, h5, h6) {
  line-height: inherit !important;
}

.previewContainer :where(div, section, header, p, ul, ol, li, a, strong, em, span, blockquote, code, pre) {
  font-size: inherit !important;
  line-height: inherit !important;
}

.previewContainer .resume-header {
  align-items: flex-start;
  display: flex;
  gap: 1.25rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.previewContainer .resume-header > :first-child {
  margin-top: 0 !important;
}

.previewContainer .resume-header-main {
  flex: 1 1 auto;
  min-width: 0;
}

.previewContainer .resume-header-side {
  flex: 0 0 auto;
  margin-left: auto;
  max-width: 52%;
  text-align: right;
}

.previewContainer .resume-stack > * + * {
  margin-top: 0.25rem;
}

.previewContainer .resume-inline {
  align-items: baseline;
  column-gap: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  row-gap: 0.25rem;
}

.previewContainer .resume-meta {
  color: inherit;
  margin-top: 0.25rem;
}

.previewContainer ul li.resume-meta-row::before,
.previewContainer ol li.resume-meta-row::before {
  content: none !important;
  display: none !important;
}

.previewContainer .resume-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
}

.previewContainer .resume-tag {
  border: 1px solid color-mix(in srgb, var(--linkColor, #1a73e8) 24%, transparent);
  border-radius: 999px;
  color: var(--headerColor, currentColor);
  display: inline-flex;
  font-size: 0.92em !important;
  line-height: 1.3 !important;
  padding: 0.12rem 0.55rem;
}

@media (max-width: 680px) {
  .previewContainer .resume-header {
    flex-direction: column;
  }

  .previewContainer .resume-header-side {
    margin-left: 0;
    max-width: none;
    text-align: left;
  }
}

.previewContainer.theme.tehran,
.previewContainer.theme.shiraz,
.previewContainer.theme.mashhad {
  font-size: calc(16px * var(--fontScale)) !important;
  line-height: var(--lineHeightScale) !important;
}

.previewContainer.theme.isfahan {
  font-size: calc(18px * var(--fontScale)) !important;
  line-height: var(--lineHeightScale) !important;
}

.previewContainer.theme.tehran h1,
.previewContainer.theme.isfahan h1,
.previewContainer.theme.shiraz h1 {
  font-size: calc(2.25rem * var(--fontScale) * var(--headingScale, 1)) !important;
}

.previewContainer.theme.tehran h2,
.previewContainer.theme.isfahan h2,
.previewContainer.theme.shiraz h2,
.previewContainer.theme.mashhad h2 {
  font-size: calc(1.5rem * var(--fontScale) * var(--headingScale, 1)) !important;
}

.previewContainer.theme.tehran h3,
.previewContainer.theme.isfahan h3,
.previewContainer.theme.shiraz h3,
.previewContainer.theme.mashhad h3 {
  font-size: calc(1.25rem * var(--fontScale) * var(--headingScale, 1)) !important;
}

.previewContainer.theme.mashhad h1 {
  font-size: calc(2.5rem * var(--fontScale) * var(--headingScale, 1)) !important;
}
`;

export function buildManagedPreviewCss(customCss?: string) {
  const normalizedCustomCss = customCss?.trim() ?? "";

  if (!normalizedCustomCss) {
    return CONTROLLED_PREVIEW_STYLE_GUARD_CSS.trim();
  }

  return `${normalizedCustomCss}\n\n${CONTROLLED_PREVIEW_STYLE_GUARD_CSS.trim()}`;
}
