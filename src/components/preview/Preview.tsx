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
    const previewPaperRef = useRef<HTMLDivElement | null>(null);
    const [paperScale, setPaperScale] = useState(1);
    const [paperStageHeight, setPaperStageHeight] = useState(A4_PAPER_HEIGHT);

    useEffect(() => {
        const previewShell = previewShellRef.current;
        const previewPaper = previewPaperRef.current;
        if (!previewShell || !previewPaper) return;

        const updatePaperLayout = () => {
            const nextScale = Math.min(1, (previewShell.clientWidth - 8) / A4_PAPER_WIDTH);
            const paperHeight = Math.max(A4_PAPER_HEIGHT, previewPaper.scrollHeight);

            setPaperScale(nextScale);
            setPaperStageHeight(paperHeight * nextScale);
        };

        const shellObserver = new ResizeObserver(updatePaperLayout);
        const paperObserver = new ResizeObserver(updatePaperLayout);

        shellObserver.observe(previewShell);
        paperObserver.observe(previewPaper);
        updatePaperLayout();

        return () => {
            shellObserver.disconnect();
            paperObserver.disconnect();
        };
    }, [content, font, theme]);

    return (
        <div
            data-testid={testId}
            ref={previewShellRef}
            className={cn(
                "relative h-full overflow-auto rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:p-4",
                className
            )}
        >
            <div
                className="mx-auto flex min-h-full w-full items-start justify-center"
                style={{height: `${paperStageHeight}px`}}
            >
                <div
                    ref={(node) => {
                        previewPaperRef.current = node;
                        if (previewContainerRef) {
                            previewContainerRef.current = node;
                        }
                    }}
                    data-testid={paperTestId}
                    className={`previewContainer theme relative rounded-[18px] border border-slate-200 bg-white prose max-w-none text-[#1c2024] shadow-[0_24px_60px_rgba(15,23,42,0.14)] ${theme?.toLowerCase()}`}
                    style={{
                        fontFamily: font,
                        width: `${A4_PAPER_WIDTH}px`,
                        minHeight: `${A4_PAPER_HEIGHT}px`,
                        transform: `scale(${paperScale})`,
                        transformOrigin: "top center",
                    }}
                >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};
