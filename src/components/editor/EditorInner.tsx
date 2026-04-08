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
        <div className={cn("editor relative h-full custom-scrollbar overflow-auto rounded-[28px] border border-slate-200 bg-white", className)}>
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
