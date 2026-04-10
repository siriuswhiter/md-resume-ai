'use client';

import {MutableRefObject, useEffect, useRef, useState} from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

const A4_PAPER_WIDTH = 794;
const A4_PAPER_HEIGHT = 1123;

interface PreviewProps {
    content?: string;
    theme: string;
    font: string;
    previewContainerRef?: MutableRefObject<HTMLDivElement | null>;
    className?: string;
    testId?: string;
    paperTestId?: string;
}

export default function Preview({
    content,
    theme,
    font,
    previewContainerRef,
    className,
    testId,
    paperTestId
}: PreviewProps) {
    const previewShellRef = useRef<HTMLDivElement | null>(null);
    const previewMeasureRef = useRef<HTMLDivElement | null>(null);
    const previewContentRef = useRef<HTMLDivElement | null>(null);
    const [paperScale, setPaperScale] = useState(1);
    const [pageCount, setPageCount] = useState(1);

    useEffect(() => {
        const previewShell = previewShellRef.current;
        const previewMeasure = previewMeasureRef.current;
        const previewContent = previewContentRef.current;
        if (!previewShell || !previewMeasure || !previewContent) return;

        const updatePaperLayout = () => {
            const nextScale = Math.min(1, (previewShell.clientWidth - 12) / A4_PAPER_WIDTH);
            const contentHeight = Math.max(A4_PAPER_HEIGHT, previewContent.scrollHeight);
            const nextPageCount = Math.max(1, Math.ceil(contentHeight / A4_PAPER_HEIGHT));

            setPaperScale(nextScale);
            setPageCount(nextPageCount);
        };

        const shellObserver = new ResizeObserver(updatePaperLayout);
        const contentObserver = new ResizeObserver(updatePaperLayout);

        shellObserver.observe(previewShell);
        shellObserver.observe(previewMeasure);
        contentObserver.observe(previewContent);
        updatePaperLayout();

        return () => {
            shellObserver.disconnect();
            contentObserver.disconnect();
        };
    }, [content, font, theme]);

    return (
        <div
            data-testid={testId}
            ref={previewShellRef}
            className={cn(
                "relative h-full overflow-auto rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:p-3",
                className
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
            >
                <div
                    ref={(node) => {
                        previewMeasureRef.current = node;
                        if (previewContainerRef) {
                            previewContainerRef.current = node;
                        }
                    }}
                    className={`previewContainer theme prose max-w-none text-[#1c2024] ${theme?.toLowerCase()}`}
                    style={{
                        fontFamily: font,
                        width: `${A4_PAPER_WIDTH}px`,
                        minHeight: `${A4_PAPER_HEIGHT}px`,
                    }}
                >
                    {pageCount > 1 ? (
                      <div className="pointer-events-none absolute inset-0 z-10" />
                    ) : null}
                    <div ref={previewContentRef} data-preview-content-root>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </div>
                </div>
            </div>

            <div className="mx-auto flex min-h-full w-full justify-center">
                <div
                    className="flex w-full flex-col items-center gap-4"
                    style={{ maxWidth: `${A4_PAPER_WIDTH * paperScale}px` }}
                >
                    {Array.from({ length: pageCount }, (_, index) => {
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
                                        fontFamily: font,
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
                                    <div className="relative h-full overflow-hidden">
                                        <div
                                            className="absolute inset-x-0 top-0"
                                            style={{ transform: `translateY(-${index * A4_PAPER_HEIGHT}px)` }}
                                        >
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                                        </div>
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
