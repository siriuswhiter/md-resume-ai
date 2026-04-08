"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Download,
  FilePenLine,
  Layers3,
  Loader2,
  PanelRight,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Editor from "@/components/editor/Editor";
import Sidebar from "@/components/sidebar/Sidebar";
import Preview from "@/components/preview/Preview";
import MobileScreenWarning from "@/components/MobileScreenWarning";
import {
  densityPresets,
  fonts,
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
  const [rawInput, setRawInput] = useLocalStorage<string>("RESUME_AI_RAW_INPUT", "");

  const [llmSettings, setLlmSettings] = useState<LlmSettings>(() => defaultLlmSettings());
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    setFeedback({
      tone: "success",
      message: "AI 配置已更新。",
    });
  }, []);

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

  useEffect(() => {
    const previewContainer = previewContainerRef.current;
    if (!previewContainer) return;

    previewContainer.style.setProperty("--fontName", font);
    previewContainer.style.setProperty("--fontScale", fontScale.toString());
    previewContainer.style.setProperty("--headingScale", headingScale.toString());
    previewContainer.style.setProperty(
      "--lineHeightScale",
      lineHeightScale.toString()
    );
    previewContainer.style.setProperty("--xPaddingScale", `${xPaddingScale}px`);
    previewContainer.style.setProperty("--yPaddingScale", `${yPaddingScale}px`);
    previewContainer.style.setProperty("--headerColor", headerColor);
    previewContainer.style.setProperty("--textColor", textColor);
    previewContainer.style.setProperty("--linkColor", linkColor);
  }, [
    font,
    fontScale,
    headerColor,
    headingScale,
    lineHeightScale,
    linkColor,
    textColor,
    xPaddingScale,
    yPaddingScale,
  ]);

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
      message: `版式密度已调整为“${preset.label}”。`,
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

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: previewElement.innerHTML,
          theme,
          styles: {
            fontName: font,
            fontScale,
            headingScale,
            lineHeightScale,
            xPaddingScale,
            yPaddingScale,
            headerColor,
            textColor,
            linkColor,
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

  const visibleCharacterCount = markdown.replace(/\s+/g, "").length;
  const sectionCount = (markdown.match(/^##\s+/gm) ?? []).length;
  const bulletCount = (markdown.match(/^\s*[-*]\s+/gm) ?? []).length;
  const activeThemeKey = (theme in themePresetMeta ? theme : "tehran") as ThemeKey;
  const resumeTitle =
    markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || "未命名简历";
  const structureHint =
    sectionCount >= 3
      ? "章节结构已经成型，可继续压缩措辞和补充量化结果。"
      : "建议至少补齐教育、工作经历、项目或技能等核心章节。";
  const documentStatus = isExporting
    ? "导出中"
    : lastSavedAt
      ? `已自动保存 · ${lastSavedAt}`
      : markdownHydrated
        ? "已从本机恢复"
        : "正在加载";
  const aiStatus = llmSettings.useServerRoute
    ? "服务端 AI 已就绪"
    : llmSettings.apiKey.trim()
      ? "本机 Key 已配置"
      : "AI 待配置";

  const feedbackStyles: Record<
    FeedbackTone,
    { icon: typeof CheckCircle2; className: string }
  > = {
    info: {
      icon: ScanSearch,
      className: "border-sky-200 bg-sky-50 text-sky-800",
    },
    success: {
      icon: CheckCircle2,
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    error: {
      icon: AlertCircle,
      className: "border-red-200 bg-red-50 text-red-800",
    },
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.10),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-4 lg:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <FilePenLine className="h-4 w-4 text-sky-600" />
            Markdown Resume
          </Link>

          <div className="hidden min-[880px]:block">
            <p className="text-sm font-semibold text-slate-900">{resumeTitle}</p>
            <p className="text-xs text-slate-500">
              {documentStatus} · {aiStatus}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:inline-flex min-[1400px]:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              <PanelRight className="h-4 w-4" />
              打开工具抽屉
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              onClick={handleExportPdf}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  导出 PDF
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-5 lg:px-6">
        <div className="lg:hidden">
          <MobileScreenWarning content={markdown} theme={theme} font={font} />
        </div>

        <div className="hidden space-y-4 lg:block">
          {feedback ? (
            <div
              className={`flex items-start gap-3 rounded-[24px] border px-4 py-3 text-sm shadow-sm ${
                feedbackStyles[feedback.tone].className
              }`}
            >
              {(() => {
                const Icon = feedbackStyles[feedback.tone].icon;
                return <Icon className="mt-0.5 h-4 w-4 shrink-0" />;
              })()}
              <span>{feedback.message}</span>
            </div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                文档状态
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {documentStatus}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                内容变更会自动保存到当前浏览器，本页主操作只有导出 PDF。
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Layers3 className="h-4 w-4 text-sky-600" />
                内容结构
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {visibleCharacterCount}
                  </p>
                  <p className="text-xs text-slate-500">字数</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {sectionCount}
                  </p>
                  <p className="text-xs text-slate-500">章节</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {bulletCount}
                  </p>
                  <p className="text-xs text-slate-500">要点</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {structureHint}
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Bot className="h-4 w-4 text-amber-600" />
                AI 辅助状态
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {aiStatus}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                路径固定为“粘贴原始经历 → 生成草稿 → 写入编辑器”，尽量不打断主编辑流。
              </p>
            </div>
          </div>

          <div className="flex gap-4 min-[1400px]:items-start">
            <div className="min-w-0 flex-1">
              <div className="grid gap-4 min-[1180px]:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
                <section className="rounded-[32px] border border-slate-200 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Markdown 编辑区
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        主工作区，用于手动精修简历内容与结构。
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                        自动保存
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                        中文界面
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                        Markdown 输入
                      </span>
                    </div>
                  </div>
                  <Editor
                    markdown={markdown}
                    onChangeAction={updateMarkdown}
                    className="h-[calc(100vh-22rem)] min-h-[560px]"
                  />
                </section>

                <section className="rounded-[32px] border border-slate-200 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        实时预览
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        预览最终导出效果，检查层级、行距和主题适配是否合理。
                      </p>
                    </div>
                    <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                      当前主题：{themePresetMeta[activeThemeKey].label}
                    </div>
                  </div>
                  <Preview
                    content={markdown}
                    theme={theme}
                    font={font}
                    previewContainerRef={previewContainerRef}
                    testId="editor-preview-desktop"
                    className="h-[calc(100vh-22rem)] min-h-[560px]"
                  />
                </section>
              </div>
            </div>

            <aside className="hidden w-[360px] shrink-0 min-[1400px]:block">
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
                font={font}
                aiRawInput={rawInput}
                onAiRawInputChange={setRawInput}
                llmSettings={llmSettings}
                onLlmSettingsChange={handleLlmSettingsChange}
                onMarkdownGenerated={updateMarkdown}
              />
            </aside>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-500">
            <p>
              已按桌面工作区重构为命令栏 + 编辑/预览双栏 + 右侧工具抽屉；移动端则降级为只读预览。
            </p>
            <Link
              href="https://www.buymeacoffee.com/rozitahasani"
              target="_blank"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              支持项目
            </Link>
          </div>
        </div>
      </div>

      <Sidebar
        variant="drawer"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
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
        font={font}
        aiRawInput={rawInput}
        onAiRawInputChange={setRawInput}
        llmSettings={llmSettings}
        onLlmSettingsChange={handleLlmSettingsChange}
        onMarkdownGenerated={updateMarkdown}
      />
    </div>
  );
}
