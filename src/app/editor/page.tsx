"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  ScanSearch,
  Settings,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Editor from "@/components/editor/Editor";
import Sidebar from "@/components/sidebar/Sidebar";
import Preview from "@/components/preview/Preview";
import MobileScreenWarning from "@/components/MobileScreenWarning";
import { LlmSettingsModal } from "@/components/ai/LlmSettingsModal";
import {
  densityPresets,
  fonts,
  getFontFamilyStack,
  themePresetMeta,
  themes,
  type FontKey,
  type DensityPresetId,
  type ThemeKey,
} from "@/lib/constants";
import "../../styles/globals.css";
import { loadFont } from "@/lib/fontUtils";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  defaultLlmSettings,
  loadLlmSettings,
  saveLlmSettings,
} from "@/lib/llmStorage";
import type { LlmSettings } from "@/lib/llmTypes";
import type { SavedStyleTemplate } from "@/lib/styleAssistantTypes";
import { cn } from "@/lib/utils";
import { siteSans } from "@/lib/siteFonts";

type FeedbackTone = "info" | "success" | "error";

interface FeedbackState {
  tone: FeedbackTone;
  message: string;
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">正在加载编辑器...</div>}>
      <EditorPageContent />
    </Suspense>
  );
}

function EditorPageContent() {
  const searchParams = useSearchParams();
  const template = searchParams.get("template");

  const [markdown, setMarkdownStorage, markdownHydrated] = useLocalStorage<string>(
    "MARKDOWN_CONTENT",
    ""
  );
  const [theme, setTheme] = useLocalStorage<string>("SELECTED_THEME", "tehran");
  const initialThemeKey = (theme in themes ? theme : "tehran") as ThemeKey;
  const currentTheme = themes[initialThemeKey];

  const [font, setFont] = useLocalStorage<string>(
    "FONT",
    currentTheme.fontName ?? "Open Sans"
  );
  const [headingScale, setHeadingScale] = useLocalStorage<number>(
    "HEADING_SCALE",
    currentTheme.headingScale ?? 1
  );
  const [fontScale, setFontScale] = useLocalStorage<number>(
    "FONT_SCALE",
    currentTheme.fontScale ?? 1
  );
  const [lineHeightScale, setLineHeightScale] = useLocalStorage<number>(
    "LINE_HEIGHT_SCALE",
    currentTheme.lineHeightScale ?? 1.5
  );
  const [xPaddingScale, setXPaddingScale] = useLocalStorage<number>(
    "X_PADDING_SCALE",
    currentTheme.xPaddingScale ?? 20
  );
  const [yPaddingScale, setYPaddingScale] = useLocalStorage<number>(
    "Y_PADDING_SCALE",
    currentTheme.yPaddingScale ?? 20
  );
  const [headerColor, setHeaderColor] = useLocalStorage<string>(
    "HEADER_COLOR",
    currentTheme.headerColor ?? "#000"
  );
  const [textColor, setTextColor] = useLocalStorage<string>(
    "TEXT_COLOR",
    currentTheme.textColor ?? "#000"
  );
  const [linkColor, setLinkColor] = useLocalStorage<string>(
    "LINK_COLOR",
    currentTheme.linkColor ?? "#1a73e8"
  );
  const [customCss, setCustomCss] = useLocalStorage<string>(
    "CUSTOM_PREVIEW_CSS",
    ""
  );
  const [stylePrompt, setStylePrompt] = useLocalStorage<string>(
    "STYLE_ASSISTANT_PROMPT",
    ""
  );
  const [savedStyleTemplates, setSavedStyleTemplates] = useLocalStorage<SavedStyleTemplate[]>(
    "STYLE_ASSISTANT_TEMPLATES",
    []
  );
  const [rawInput, setRawInput] = useLocalStorage<string>("RESUME_AI_RAW_INPUT", "");

  const [llmSettings, setLlmSettings] = useState<LlmSettings>(() => defaultLlmSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLlmSettings(loadLlmSettings());
  }, []);

  const stampSavedTime = useCallback(() => {
    setLastSavedAt(
      new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  const updateMarkdown = useCallback(
    (value: string) => {
      setMarkdownStorage(value);
      stampSavedTime();
    },
    [setMarkdownStorage, stampSavedTime]
  );

  const handleLlmSettingsChange = useCallback((settings: LlmSettings) => {
    setLlmSettings(settings);
    saveLlmSettings(settings);
  }, []);

  const handleSaveStyleTemplate = useCallback((template: {
    name: string;
    css: string;
    summary?: string;
  }) => {
    const nextTemplate: SavedStyleTemplate = {
      id: `style_${Date.now()}`,
      name: template.name,
      css: template.css,
      summary: template.summary,
      createdAt: new Date().toISOString(),
    };
    setSavedStyleTemplates([nextTemplate, ...savedStyleTemplates]);
    setFeedback({
      tone: "success",
      message: `样式模板"${template.name}"已保存到本地。`,
    });
  }, [savedStyleTemplates, setSavedStyleTemplates]);

  const handleApplyStyleTemplate = useCallback((css: string) => {
    setCustomCss(css);
  }, [setCustomCss]);

  const handleDeleteStyleTemplate = useCallback((id: string) => {
    const target = savedStyleTemplates.find((item) => item.id === id);
    setSavedStyleTemplates(savedStyleTemplates.filter((item) => item.id !== id));
    if (target) {
      setFeedback({
        tone: "success",
        message: `样式模板"${target.name}"已删除。`,
      });
    }
  }, [savedStyleTemplates, setSavedStyleTemplates]);

  const applyThemeSettings = useCallback(
    (themeName: string) => {
      const normalizedTheme = themeName.toLowerCase() as ThemeKey;
      const selectedTheme = themes[normalizedTheme];
      if (!selectedTheme) return;

      setTheme(normalizedTheme);
      setFont(selectedTheme.fontName);
      setFontScale(selectedTheme.fontScale);
      setHeadingScale(selectedTheme.headingScale);
      setLineHeightScale(selectedTheme.lineHeightScale);
      setXPaddingScale(selectedTheme.xPaddingScale);
      setYPaddingScale(selectedTheme.yPaddingScale);
      setHeaderColor(selectedTheme.headerColor);
      setTextColor(selectedTheme.textColor);
      setLinkColor(selectedTheme.linkColor);
    },
    [
      setFont,
      setFontScale,
      setHeaderColor,
      setHeadingScale,
      setLineHeightScale,
      setLinkColor,
      setTextColor,
      setTheme,
      setXPaddingScale,
      setYPaddingScale,
    ]
  );

  useEffect(() => {
    if (!markdownHydrated) return;
    if (markdown) return;

    const selectedTemplate = (template || "mashhad").toLowerCase();

    fetch(`/templates/${selectedTemplate}.md`)
      .then((res) => {
        if (!res.ok) {
          updateMarkdown("无法加载默认简历模板。");
          return;
        }

        res.text().then((content) => {
          updateMarkdown(content);
          applyThemeSettings(selectedTemplate);
        });
      })
      .catch(() => {
        updateMarkdown("无法加载默认简历模板。");
      });
  }, [applyThemeSettings, markdown, markdownHydrated, template, updateMarkdown]);

  useEffect(() => {
    if (!(font in fonts)) return;
    loadFont(fonts[font as FontKey]);
  }, [font]);

  const handleThemeChange = useCallback(
    (selectedTheme: string) => {
      applyThemeSettings(selectedTheme);
      const themeKey = selectedTheme.toLowerCase() as ThemeKey;
      const preset = themePresetMeta[themeKey];
      if (!preset) return;
      setFeedback({
        tone: "info",
        message: `已切换到 ${preset.label}：${preset.expectation}`,
      });
    },
    [applyThemeSettings]
  );

  const handleDensityPresetChange = useCallback((presetId: DensityPresetId) => {
    const preset = densityPresets.find((item) => item.id === presetId);
    if (!preset) return;

    setLineHeightScale(preset.lineHeightScale);
    setXPaddingScale(preset.xPaddingScale);
    setYPaddingScale(preset.yPaddingScale);
    setFeedback({
      tone: "success",
      message: `版式密度已调整为"${preset.label}"。`,
    });
  }, [setLineHeightScale, setXPaddingScale, setYPaddingScale]);

  const handleExportPdf = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setFeedback({
      tone: "info",
      message: "正在生成 PDF，请稍候。",
    });

    try {
      const previewElement = previewContainerRef.current;
      if (!previewElement) {
        throw new Error("未找到预览容器，暂时无法导出 PDF。");
      }

      const exportRoot = previewElement.querySelector<HTMLElement>(
        "[data-preview-content-root]"
      );

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: exportRoot ? exportRoot.innerHTML : previewElement.innerHTML,
          theme,
          styles: {
            fontName: getFontFamilyStack(font),
            fontScale,
            headingScale,
            lineHeightScale,
            xPaddingScale,
            yPaddingScale,
            headerColor,
            textColor,
            linkColor,
            customCss,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("PDF 生成失败，请稍后重试。");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setFeedback({
        tone: "success",
        message: "PDF 已开始下载。",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "导出失败，请重试。",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const resumeTitle =
    markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || "未命名简历";

  const feedbackStyles: Record<
    FeedbackTone,
    { icon: typeof CheckCircle2; className: string }
  > = {
    info: {
      icon: ScanSearch,
      className: "border-[--ui-border] bg-[--ui-bg-subtle] text-[--ui-text]",
    },
    success: {
      icon: CheckCircle2,
      className: "border-[--ui-border] bg-[--ui-bg-subtle] text-[--ui-text]",
    },
    error: {
      icon: AlertCircle,
      className: "border-red-200 bg-red-50 text-red-800",
    },
  };

  return (
    <div
      className={cn(
        siteSans.className,
        "min-h-screen bg-[--ui-bg-subtle] text-[--ui-text] lg:flex lg:h-screen lg:flex-col lg:overflow-hidden"
      )}
    >
      <header className="shrink-0 border-b border-[--ui-border] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1720px] items-center gap-4 px-4 py-2.5">
          <Link
            href="/"
            className="text-sm font-semibold text-[--ui-text] hover:opacity-70 transition-opacity"
          >
            Markdown Resume AI
          </Link>

          <span className="text-[--ui-border]">/</span>

          <p className="truncate text-sm text-[--ui-text-muted]">{resumeTitle}</p>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[var(--ui-radius)] border border-[--ui-border] px-3 py-1.5 text-xs font-medium text-[--ui-text-muted] transition-colors hover:border-[--ui-text] hover:text-[--ui-text]"
              onClick={() => setSettingsOpen(true)}
              aria-label="设置"
            >
              <Settings className="h-3.5 w-3.5" />
              设置
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[var(--ui-radius)] bg-[--ui-text] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleExportPdf}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  导出 PDF
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1720px] flex-1 flex-col px-3 py-3 lg:min-h-0 lg:w-full lg:overflow-hidden lg:px-4">
        <div className="shrink-0 lg:hidden">
          <MobileScreenWarning
            content={markdown}
            theme={theme}
            font={font}
            fontScale={fontScale}
            headingScale={headingScale}
            lineHeightScale={lineHeightScale}
            xPaddingScale={xPaddingScale}
            yPaddingScale={yPaddingScale}
            headerColor={headerColor}
            textColor={textColor}
            linkColor={linkColor}
            customCss={customCss}
          />
        </div>

        <div
          data-testid="editor-workspace-desktop"
          className="hidden min-h-0 flex-1 lg:flex lg:flex-col lg:gap-3 lg:overflow-hidden"
        >
          {feedback ? (
            <div
              className={cn("flex items-start gap-3 rounded-[var(--ui-radius)] border px-4 py-3 text-sm", feedbackStyles[feedback.tone].className)}
            >
              {(() => {
                const Icon = feedbackStyles[feedback.tone].icon;
                return <Icon className="mt-0.5 h-4 w-4 shrink-0" />;
              })()}
              <span>{feedback.message}</span>
            </div>
          ) : null}

          <div className="grid min-h-0 flex-1 gap-3 min-[1280px]:grid-cols-[minmax(0,1fr)_260px] lg:overflow-hidden">
            <div className="min-w-0 min-h-0 overflow-hidden">
              <div className="grid h-full min-h-0 gap-3 min-[1180px]:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
                <section className="flex min-h-0 flex-col overflow-hidden rounded-[var(--ui-radius)] border border-[--ui-border] bg-white">
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <Editor
                      markdown={markdown}
                      onChangeAction={updateMarkdown}
                      className="h-full min-h-0"
                    />
                  </div>
                </section>

                <section className="flex min-h-0 flex-col overflow-hidden rounded-[var(--ui-radius)] border border-[--ui-border] bg-[--ui-bg-subtle]">
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <Preview
                      content={markdown}
                      theme={theme}
                      font={font}
                      fontScale={fontScale}
                      headingScale={headingScale}
                      lineHeightScale={lineHeightScale}
                      xPaddingScale={xPaddingScale}
                      yPaddingScale={yPaddingScale}
                      headerColor={headerColor}
                      textColor={textColor}
                      linkColor={linkColor}
                      customCss={customCss}
                      previewContainerRef={previewContainerRef}
                      testId="editor-preview-desktop"
                      paperTestId="editor-preview-paper-desktop"
                      className="h-full min-h-0"
                    />
                  </div>
                </section>
              </div>
            </div>

            <aside className="hidden h-full min-h-0 w-[260px] overflow-hidden min-[1280px]:block">
              <Sidebar
                variant="inline"
                onThemeChange={handleThemeChange}
                onDensityPresetChange={handleDensityPresetChange}
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
                customCss={customCss}
                onCustomCssChange={setCustomCss}
                font={font}
                aiRawInput={rawInput}
                onAiRawInputChange={setRawInput}
                llmSettings={llmSettings}
                onMarkdownGenerated={updateMarkdown}
                theme={theme}
                stylePrompt={stylePrompt}
                onStylePromptChange={setStylePrompt}
                savedStyleTemplates={savedStyleTemplates}
                onSaveStyleTemplate={handleSaveStyleTemplate}
                onApplyStyleTemplate={handleApplyStyleTemplate}
                onDeleteStyleTemplate={handleDeleteStyleTemplate}
              />
            </aside>
          </div>
        </div>
      </div>

      <LlmSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={llmSettings}
        onChange={handleLlmSettingsChange}
      />
    </div>
  );
}
