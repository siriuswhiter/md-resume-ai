'use client';

import dynamic from 'next/dynamic';
import '@mdxeditor/editor/style.css';
import './editor.css';
import { cn } from '@/lib/utils';

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
            <div className={cn("editor relative h-full custom-scrollbar overflow-auto rounded-[28px] border border-slate-200 bg-white flex items-center justify-center")}>
                <span className="text-sm text-slate-400">正在加载编辑器...</span>
            </div>
        )
    }
);

export default function Editor({markdown, onChangeAction, className}: EditorProps) {
    return <EditorComponent markdown={markdown} onChangeAction={onChangeAction} className={className} />;
}
