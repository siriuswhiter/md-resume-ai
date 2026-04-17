'use client';

import dynamic from 'next/dynamic';
import '@mdxeditor/editor/style.css';
import './editor.css';
import { cn } from '@/lib/utils';
import { siteSans } from '@/lib/siteFonts';

interface EditorProps {
    markdown?: string;
    onChangeAction: (value: string) => void;
    className?: string;
}

const EditorComponent = dynamic(
    () => import('./EditorInner'),
    {
        ssr: false,
        loading: () => (
            <div className={cn(siteSans.className, "editor relative flex h-full items-center justify-center overflow-auto rounded-[28px] border border-[#dad4c8] bg-[#faf9f7] custom-scrollbar overscroll-contain shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)]")}>
                <span className="text-sm text-[#55534e]">正在加载编辑器...</span>
            </div>
        )
    }
);

export default function Editor({markdown, onChangeAction, className}: EditorProps) {
    return <EditorComponent markdown={markdown} onChangeAction={onChangeAction} className={className} />;
}
