'use client';

import { CSSProperties, MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";
import { getFontFamilyStack } from "@/lib/constants";
import { buildManagedPreviewCss } from "@/lib/previewStyleGuards";

const A4_PAPER_WIDTH = 794;
const A4_PAPER_HEIGHT = 1123;
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
                "relative flex h-full min-h-0 flex-col overflow-auto rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] overscroll-contain sm:p-3",
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
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
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
                                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-dashed border-slate-200/90 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
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
