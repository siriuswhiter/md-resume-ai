'use client';

import {useEffect, useRef} from 'react';
import {
    MDXEditor,
    headingsPlugin,
    linkPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    diffSourcePlugin,
    MDXEditorMethods
} from '@mdxeditor/editor';
import { cn } from '@/lib/utils';
import { siteSans } from '@/lib/siteFonts';

interface EditorInnerProps {
    markdown?: string;
    onChangeAction: (value: string) => void;
    className?: string;
}

export default function EditorInner({markdown, onChangeAction, className}: EditorInnerProps) {
    const editorRef = useRef<MDXEditorMethods | null>(null);

    useEffect(() => {
        if (editorRef.current && markdown !== undefined) {
            const currentMarkdown = editorRef.current.getMarkdown();
            if (currentMarkdown !== markdown) {
                editorRef.current.setMarkdown(markdown);
            }
        }
    }, [markdown]);

    const handleChange = (newMarkdown: string) => {
        if (markdown !== newMarkdown) {
            onChangeAction(newMarkdown || '');
        }
    };

    return (
        <div className={cn(siteSans.className, "editor relative h-full overflow-auto rounded-[28px] border border-[#dad4c8] bg-[#faf9f7] custom-scrollbar overscroll-contain shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)]", className)}>
            <MDXEditor
                ref={editorRef}
                markdown={markdown ?? ''}
                onChange={handleChange}
                plugins={[
                    headingsPlugin(),
                    linkPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    diffSourcePlugin({viewMode: 'source'})
                ]}
            />
        </div>
    );
}
