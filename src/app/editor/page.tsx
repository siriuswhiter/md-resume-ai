"use client";

import {useRef, useEffect, Suspense, useState, useCallback} from "react";
import Editor from "@/components/editor/Editor";
import Sidebar from "@/components/sidebar/Sidebar";
import Preview from "@/components/preview/Preview";
import {fonts, themes} from "@/lib/constants";
import '../../styles/globals.css'
import {useSearchParams} from "next/navigation";
import {loadFont} from "@/lib/fontUtils";
import MobileScreenWarning from "@/components/MobileScreenWarning";
import useLocalStorage from "@/hooks/useLocalStorage";
import { defaultLlmSettings, loadLlmSettings, saveLlmSettings } from "@/lib/llmStorage";
import type { LlmSettings } from "@/lib/llmTypes";

export default function EditorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditorPageContent />
        </Suspense>
    );
}

function EditorPageContent() {
    const searchParams = useSearchParams();
    const template = searchParams.get("template");

    const [markdown, setMarkdown] = useLocalStorage<string>("MARKDOWN_CONTENT", "");
    const [theme, setTheme] = useLocalStorage<string>("SELECTED_THEME", "tehran");

    const currentTheme = themes[theme];

    const [font, setFont] = useLocalStorage<string>("FONT", currentTheme.fontName ?? 'Open Sans');
    const [headingScale, setHeadingScale] = useLocalStorage<number>("HEADING_SCALE", currentTheme.headingScale ?? 1);
    const [fontScale, setFontScale] = useLocalStorage<number>("FONT_SCALE", currentTheme.fontScale ?? 1);
    const [lineHeightScale, setLineHeightScale] = useLocalStorage<number>("LINE_HEIGHT_SCALE", currentTheme.lineHeightScale ?? 1.5);
    const [xPaddingScale, setXPaddingScale] = useLocalStorage<number>("X_PADDING_SCALE", currentTheme.xPaddingScale ?? 20);
    const [yPaddingScale, setYPaddingScale] = useLocalStorage<number>("Y_PADDING_SCALE", currentTheme.yPaddingScale ?? 20);
    const [headerColor, setHeaderColor] = useLocalStorage<string>("HEADER_COLOR", currentTheme.headerColor ?? '#000');
    const [textColor, setTextColor] = useLocalStorage<string>("TEXT_COLOR", currentTheme.textColor ?? '#000');
    const [linkColor, setLinkColor] = useLocalStorage<string>("LINK_COLOR", currentTheme.linkColor ?? '#1a73e8');

    const [rawInput, setRawInput] = useLocalStorage<string>("RESUME_AI_RAW_INPUT", "");
    const [llmSettings, setLlmSettings] = useState<LlmSettings>(() => defaultLlmSettings());

    useEffect(() => {
        setLlmSettings(loadLlmSettings());
    }, []);

    const handleLlmSettingsChange = useCallback((s: LlmSettings) => {
        setLlmSettings(s);
        saveLlmSettings(s);
    }, []);

    const previewContainerRef = useRef<HTMLDivElement | null>(null);

    // Fetch the template and set the markdown state
    useEffect(() => {
        const defaultTemplate = "mashhad";

        // Only fetch if localStorage is empty
        if (!markdown) {
            const selectedTemplate = template || defaultTemplate;

            fetch(`/templates/${selectedTemplate}.md`)
                .then((res) => {
                    if (!res.ok) {
                        setMarkdown("Unable to load the default resume template.");
                    } else {
                        res.text().then((content) => {
                            setMarkdown(content);
                            applyThemeSettings(defaultTemplate);
                        });
                    }
                })
                .catch(() => {
                    setMarkdown("Unable to load the default resume template.");
                });
        }
    }, [template, markdown]);

    useEffect(() => {
        loadFont(fonts[font]);
    }, [font]);

    // Utility function to apply theme settings
    const applyThemeSettings = (themeName: string) => {
        const selectedTheme = themes[themeName.toLowerCase()];

        setFont(selectedTheme.fontName);
        setFontScale(selectedTheme.fontScale);
        setHeadingScale(selectedTheme.headingScale);
        setLineHeightScale(selectedTheme.lineHeightScale);
        setXPaddingScale(selectedTheme.xPaddingScale);
        setYPaddingScale(selectedTheme.yPaddingScale);
        setHeaderColor(selectedTheme.headerColor);
        setTextColor(selectedTheme.textColor);
        setLinkColor(selectedTheme.linkColor);
    };

    // Update CSS variables in the previewContainer
    useEffect(() => {
        const previewContainer = previewContainerRef.current;
        if (previewContainer) {
            previewContainer.style.setProperty('--fontName', font);
            previewContainer.style.setProperty('--fontScale', fontScale.toString());
            previewContainer.style.setProperty("--headingScale", headingScale.toString());
            previewContainer.style.setProperty('--lineHeightScale', lineHeightScale.toString());
            previewContainer.style.setProperty('--xPaddingScale', `${xPaddingScale}px`);
            previewContainer.style.setProperty('--yPaddingScale', `${yPaddingScale}px`);
            previewContainer.style.setProperty("--headerColor", headerColor);
            previewContainer.style.setProperty("--textColor", textColor);
            previewContainer.style.setProperty("--linkColor", linkColor);
        }
    }, [font, fontScale, headingScale, lineHeightScale, xPaddingScale, yPaddingScale, headerColor, textColor, linkColor]);

    const handleThemeChange = (selectedTheme: string) => {
        setTheme(selectedTheme.toLowerCase());
        applyThemeSettings(selectedTheme);
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleExportPdf = async () => {
        if (isExporting) return;

        setIsExporting(true);
        try {
            const previewElement = previewContainerRef.current;
            if (!previewElement) {
                throw new Error('Preview container not found');
            }

            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    html: previewElement.innerHTML,
                    theme: theme,
                    styles: {
                        fontName: font,
                        fontScale: fontScale,
                        headingScale: headingScale,
                        lineHeightScale: lineHeightScale,
                        xPaddingScale: xPaddingScale,
                        yPaddingScale: yPaddingScale,
                        headerColor: headerColor,
                        textColor: textColor,
                        linkColor: linkColor,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Failed to export PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="w-full h-full min-h-screen bg-gray-100">
            <MobileScreenWarning/>

            <div className="main-content hidden md:block gap-3 pr-[310px] h-full">
                <div className="flex justify-center items-start w-full h-screen">
                    <Editor markdown={markdown} onChangeAction={setMarkdown}/>
                    <Preview content={markdown} theme={theme} font={font} previewContainerRef={previewContainerRef}/>
                </div>
            </div>
            <Sidebar
                font={font}
                setFont={setFont}
                handleExportPdf={handleExportPdf}
                isExporting={isExporting}
                onThemeChange={handleThemeChange}
                onFontChange={setFont}
                onFontSizeChange={setFontScale}
                onLineHeightChange={setLineHeightScale}
                onXPaddingChange={setXPaddingScale}
                onYPaddingChange={setYPaddingScale}
                fontScale={fontScale}
                lineHeightScale={lineHeightScale}
                headingScale={headingScale}
                onHeadingChange={setHeadingScale}
                xPaddingScale={xPaddingScale}
                yPaddingScale={yPaddingScale}
                selectedTheme={theme}
                headerColor={headerColor}
                setHeaderColor={setHeaderColor}
                textColor={textColor}
                setTextColor={setTextColor}
                linkColor={linkColor}
                setLinkColor={setLinkColor}
                aiRawInput={rawInput}
                onAiRawInputChange={setRawInput}
                llmSettings={llmSettings}
                onLlmSettingsChange={handleLlmSettingsChange}
                onMarkdownGenerated={setMarkdown}
            />
        </div>
    );
}