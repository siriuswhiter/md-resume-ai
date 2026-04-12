const CONTROLLED_PREVIEW_STYLE_GUARD_CSS = `
.previewContainer {
  font-family: var(--fontName, "Open Sans"), sans-serif !important;
  padding: var(--yPaddingScale) var(--xPaddingScale) !important;
}

.previewContainer :where(h1, h2, h3, h4, h5, h6, p, ul, ol, li, a, strong, em, span, blockquote, code, pre) {
  font-family: inherit !important;
}

.previewContainer :where(h1, h2, h3, h4, h5, h6) {
  line-height: inherit !important;
}

.previewContainer :where(p, ul, ol, li, a, strong, em, span, blockquote, code, pre) {
  font-size: inherit !important;
  line-height: inherit !important;
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
