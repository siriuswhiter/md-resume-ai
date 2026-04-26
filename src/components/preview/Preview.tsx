'use client';

import { Children, CSSProperties, MutableRefObject, ReactNode, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";
import { A4_PAPER_HEIGHT_PX, A4_PAPER_WIDTH_PX, getFontFamilyStack } from "@/lib/constants";
import { buildManagedPreviewCss } from "@/lib/previewStyleGuards";
import { restrictedResumeHtmlSchema } from "@/lib/restrictedHtml";
import { siteMono, siteSans } from "@/lib/siteFonts";

const A4_PAPER_WIDTH = A4_PAPER_WIDTH_PX;
const A4_PAPER_HEIGHT = A4_PAPER_HEIGHT_PX;
const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

type ListTag = "ul" | "ol";

interface MeasuredBlock {
    html: string;
    top: number;
    bottom: number;
    tagName: string;
    listTag?: ListTag;
}

interface PreviewProps {
    content?: string;
    theme: string;
    font: string;
    fontScale: number;
    headingScale: number;
    lineHeightScale: number;
    xPaddingScale: number;
    yPaddingScale: number;
    headerColor: string;
    textColor: string;
    linkColor: string;
    customCss?: string;
    previewContainerRef?: MutableRefObject<HTMLDivElement | null>;
    className?: string;
    testId?: string;
    paperTestId?: string;
}

interface ProjectMetaParts {
    title: string;
    role: string;
    date: string;
}

const PROJECT_META_SEPARATOR = /\s*[·•|｜]\s*/;

const flattenNodeText = (node: ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") {
        return String(node);
    }

    if (Array.isArray(node)) {
        return node.map(flattenNodeText).join("");
    }

    if (isValidElement<{ children?: ReactNode }>(node)) {
        return flattenNodeText(node.props.children);
    }

    return "";
};

const extractProjectMetaParts = (children: ReactNode): ProjectMetaParts | null => {
    const text = Children.toArray(children)
        .map(flattenNodeText)
        .join("")
        .replace(/\s+/g, " ")
        .trim();

    if (!text) {
        return null;
    }

    const parts = text
        .split(PROJECT_META_SEPARATOR)
        .map((part) => part.trim())
        .filter(Boolean);

    if (parts.length !== 3) {
        return null;
    }

    const [title, role, date] = parts;
    const looksLikeDate = /(?:\d{4}|\d{1,2}[./-]\d{1,2}|至今|present|current)/i.test(date);

    if (!title || !role || !looksLikeDate) {
        return null;
    }

    return { title, role, date };
};

const markdownComponents: Components = {
    p({ children, className, ...props }) {
        const metaParts = extractProjectMetaParts(children);

        if (!metaParts) {
            return <p className={className} {...props}>{children}</p>;
        }

        return (
            <p className={cn(className, "resume-meta-row")} {...props}>
                <span className="resume-meta-title">{metaParts.title}</span>
                <span className="resume-meta-center">{metaParts.role}</span>
                <span className="resume-meta-date">{metaParts.date}</span>
            </p>
        );
    },
    h3({ children, className, ...props }) {
        const metaParts = extractProjectMetaParts(children);

        if (!metaParts) {
            return <h3 className={className} {...props}>{children}</h3>;
        }

        return (
            <h3 className={cn(className, "resume-meta-row")} {...props}>
                <span className="resume-meta-title">{metaParts.title}</span>
                <span className="resume-meta-center">{metaParts.role}</span>
                <span className="resume-meta-date">{metaParts.date}</span>
            </h3>
        );
    },
    h4({ children, className, ...props }) {
        const metaParts = extractProjectMetaParts(children);

        if (!metaParts) {
            return <h4 className={className} {...props}>{children}</h4>;
        }

        return (
            <h4 className={cn(className, "resume-meta-row")} {...props}>
                <span className="resume-meta-title">{metaParts.title}</span>
                <span className="resume-meta-center">{metaParts.role}</span>
                <span className="resume-meta-date">{metaParts.date}</span>
            </h4>
        );
    },
    li({ children, className, ...props }) {
        const metaParts = extractProjectMetaParts(children);

        if (!metaParts) {
            return <li className={className} {...props}>{children}</li>;
        }

        return (
            <li className={cn(className, "resume-meta-row")} {...props}>
                <span className="resume-meta-title">{metaParts.title}</span>
                <span className="resume-meta-center">{metaParts.role}</span>
                <span className="resume-meta-date">{metaParts.date}</span>
            </li>
        );
    },
};

const getNodeMetrics = (node: HTMLElement, rootRect: DOMRect) => {
    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;

    return {
        top: Math.max(0, rect.top - rootRect.top - marginTop),
        bottom: Math.max(0, rect.bottom - rootRect.top + marginBottom),
    };
};

const collectMeasuredBlocks = (contentRoot: HTMLDivElement) => {
    const rootRect = contentRoot.getBoundingClientRect();
    const blocks: MeasuredBlock[] = [];

    Array.from(contentRoot.children).forEach((child) => {
        const element = child as HTMLElement;
        const tagName = element.tagName.toUpperCase();

        if ((tagName === "UL" || tagName === "OL") && element.children.length > 1) {
            Array.from(element.children).forEach((listItem) => {
                const item = listItem as HTMLElement;
                const metrics = getNodeMetrics(item, rootRect);

                blocks.push({
                    html: item.outerHTML,
                    top: metrics.top,
                    bottom: metrics.bottom,
                    tagName: item.tagName.toUpperCase(),
                    listTag: tagName.toLowerCase() as ListTag,
                });
            });
            return;
        }

        const metrics = getNodeMetrics(element, rootRect);

        blocks.push({
            html: element.outerHTML,
            top: metrics.top,
            bottom: metrics.bottom,
            tagName,
        });
    });

    return blocks.filter((block) => block.html.trim().length > 0);
};

const buildPageHtml = (blocks: MeasuredBlock[]) => {
    let html = "";
    let openListTag: ListTag | null = null;

    blocks.forEach((block, index) => {
        if (block.listTag) {
            if (openListTag !== block.listTag) {
                if (openListTag) {
                    html += `</${openListTag}>`;
                }
                html += `<${block.listTag}>`;
                openListTag = block.listTag;
            }

            html += block.html;

            if (blocks[index + 1]?.listTag !== openListTag) {
                html += `</${openListTag}>`;
                openListTag = null;
            }

            return;
        }

        if (openListTag) {
            html += `</${openListTag}>`;
            openListTag = null;
        }

        html += block.html;
    });

    if (openListTag) {
        html += `</${openListTag}>`;
    }

    return html;
};

const paginateBlocks = (blocks: MeasuredBlock[]) => {
    if (blocks.length === 0) {
        return [""];
    }

    const pages: string[] = [];
    let currentPage: MeasuredBlock[] = [];
    let currentPageStartTop = blocks[0].top;

    blocks.forEach((block, index) => {
        const nextBlock = blocks[index + 1];
        const keepWithNext = HEADING_TAGS.has(block.tagName) && nextBlock;
        const effectiveBottom = keepWithNext ? nextBlock.bottom : block.bottom;
        const exceedsPage = effectiveBottom - currentPageStartTop > A4_PAPER_HEIGHT;

        if (currentPage.length > 0 && exceedsPage) {
            pages.push(buildPageHtml(currentPage));
            currentPage = [];
            currentPageStartTop = block.top;
        }

        if (currentPage.length === 0) {
            currentPageStartTop = block.top;
        }

        currentPage.push(block);
    });

    if (currentPage.length > 0) {
        pages.push(buildPageHtml(currentPage));
    }

    return pages.length > 0 ? pages : [""];
};

export default function Preview({
    content,
    theme,
    font,
    fontScale,
    headingScale,
    lineHeightScale,
    xPaddingScale,
    yPaddingScale,
    headerColor,
    textColor,
    linkColor,
    customCss,
    previewContainerRef,
    className,
    testId,
    paperTestId
}: PreviewProps) {
    const previewShellRef = useRef<HTMLDivElement | null>(null);
    const previewContentRef = useRef<HTMLDivElement | null>(null);
    const [paperScale, setPaperScale] = useState(1);
    const [pages, setPages] = useState<string[]>([""]);

    const previewStyles = useMemo(() => {
        const fontStack = getFontFamilyStack(font);

        return {
            fontFamily: fontStack,
            ["--fontName" as const]: fontStack,
            ["--fontScale" as const]: fontScale.toString(),
            ["--headingScale" as const]: headingScale.toString(),
            ["--lineHeightScale" as const]: lineHeightScale.toString(),
            ["--xPaddingScale" as const]: `${xPaddingScale}px`,
            ["--yPaddingScale" as const]: `${yPaddingScale}px`,
            ["--headerColor" as const]: headerColor,
            ["--textColor" as const]: textColor,
            ["--linkColor" as const]: linkColor,
        } as CSSProperties;
    }, [
        font,
        fontScale,
        headingScale,
        lineHeightScale,
        xPaddingScale,
        yPaddingScale,
        headerColor,
        textColor,
        linkColor,
    ]);

    const managedCustomCss = useMemo(
        () => buildManagedPreviewCss(customCss),
        [customCss]
    );

    useEffect(() => {
        const previewShell = previewShellRef.current;
        const previewContent = previewContentRef.current;
        if (!previewShell || !previewContent) return;

        const updatePaperLayout = () => {
            const nextScale = Math.min(1, (previewShell.clientWidth - 12) / A4_PAPER_WIDTH);
            const measuredBlocks = collectMeasuredBlocks(previewContent);
            const nextPages = paginateBlocks(measuredBlocks);

            setPaperScale(nextScale);
            setPages((currentPages) => {
                if (
                    currentPages.length === nextPages.length &&
                    currentPages.every((page, index) => page === nextPages[index])
                ) {
                    return currentPages;
                }

                return nextPages;
            });
        };

        const scheduleLayoutUpdate = () => {
            window.requestAnimationFrame(updatePaperLayout);
        };

        const shellObserver = new ResizeObserver(scheduleLayoutUpdate);
        const contentObserver = new ResizeObserver(updatePaperLayout);

        shellObserver.observe(previewShell);
        contentObserver.observe(previewContent);
        updatePaperLayout();
        if ("fonts" in document) {
            void document.fonts.ready.then(scheduleLayoutUpdate);
        }

        return () => {
            shellObserver.disconnect();
            contentObserver.disconnect();
        };
    }, [
        content,
        customCss,
        font,
        theme,
        fontScale,
        headingScale,
        lineHeightScale,
        xPaddingScale,
        yPaddingScale,
        headerColor,
        textColor,
        linkColor,
    ]);

    return (
        <div
            data-testid={testId}
            ref={previewShellRef}
            className={cn(
                siteSans.className,
                "relative flex h-full min-h-0 flex-col overflow-auto rounded-[28px] border border-[#dad4c8] bg-[#eee9df] p-2 shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)] overscroll-contain sm:p-3",
                className
            )}
        >
            <style data-preview-custom-style>{managedCustomCss}</style>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
            >
                <div
                    ref={(node) => {
                        if (previewContainerRef) {
                            previewContainerRef.current = node;
                        }
                    }}
                    className={`previewContainer theme prose max-w-none text-[#1c2024] ${theme?.toLowerCase()}`}
                    style={{
                        ...previewStyles,
                        width: `${A4_PAPER_WIDTH}px`,
                        minHeight: `${A4_PAPER_HEIGHT}px`,
                    }}
                >
                    <div ref={previewContentRef} data-preview-content-root>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[
                          rehypeRaw,
                          [rehypeSanitize, restrictedResumeHtmlSchema],
                        ]}
                        components={markdownComponents}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                </div>
            </div>

            <div className="mx-auto flex min-h-full w-full flex-1 justify-center">
                <div
                    className="flex w-full flex-col items-center gap-4"
                    style={{ maxWidth: `${A4_PAPER_WIDTH * paperScale}px` }}
                >
                    {pages.map((pageHtml, index) => {
                        const isFirstPage = index === 0;

                        return (
                            <div
                                key={`page-${index + 1}`}
                                data-testid={isFirstPage ? paperTestId : "preview-page-break"}
                                className="relative"
                                style={{
                                    width: `${A4_PAPER_WIDTH * paperScale}px`,
                                    height: `${A4_PAPER_HEIGHT * paperScale}px`,
                                }}
                            >
                                <div
                                    className={`previewContainer theme relative overflow-hidden rounded-[18px] border border-slate-200 bg-white prose max-w-none text-[#1c2024] shadow-[0_20px_48px_rgba(15,23,42,0.14)] ${theme?.toLowerCase()}`}
                                    style={{
                                        ...previewStyles,
                                        width: `${A4_PAPER_WIDTH}px`,
                                        height: `${A4_PAPER_HEIGHT}px`,
                                        minHeight: `${A4_PAPER_HEIGHT}px`,
                                        transform: `scale(${paperScale})`,
                                        transformOrigin: "top left",
                                    }}
                                >
                                    {!isFirstPage ? (
                                        <div className={cn(siteMono.className, "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-dashed border-[#dad4c8] px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-[#9f9b93]")}>
                                            <span data-testid="preview-page-break">A4</span>
                                            <span>Page {index + 1}</span>
                                        </div>
                                    ) : null}
                                    <div className="previewPageContent relative h-full overflow-hidden">
                                        <div dangerouslySetInnerHTML={{ __html: pageHtml }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
