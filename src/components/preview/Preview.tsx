'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {RefObject} from "react";
import { cn } from "@/lib/utils";

interface PreviewProps {
    content?: string;
    theme: string;
    font: string;
    previewContainerRef?: RefObject<HTMLDivElement>;
    className?: string;
    testId?: string;
}

export default function Preview({content, theme, font, previewContainerRef, className, testId}: PreviewProps) {
    return (
        <div
            ref={previewContainerRef}
            data-testid={testId}
            className={cn(
                `previewContainer relative overflow-auto custom-scrollbar h-full theme rounded-[28px] border border-slate-200 bg-white prose max-w-none text-[#1c2024] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ${theme?.toLowerCase()}`,
                className
            )}
            style={{fontFamily: font, }}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    );
};
