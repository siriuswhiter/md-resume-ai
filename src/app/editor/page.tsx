"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  Plus,
  ScanSearch,
  Settings,
  Trash2,
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

type ResumeStyleSettings = {
  theme: string;
  font: string;
  headingScale: number;
  fontScale: number;
  lineHeightScale: number;
  xPaddingScale: number;
  yPaddingScale: number;
  headerColor: string;
  textColor: string;
  linkColor: string;
  customCss: string;
  stylePrompt: string;
};

type JobResumeVersion = {
  id: string;
  name: string;
  jobTarget: string;
  markdown: string;
  styles?: ResumeStyleSettings;
  createdAt: string;
  updatedAt: string;
};

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

  const [masterMarkdown, setMasterMarkdownStorage, markdownHydrated] = useLocalStorage<string>(
    "MARKDOWN_CONTENT",
    ""
  );
  const [jobVersions, setJobVersions, jobVersionsHydrated] = useLocalStorage<JobResumeVersion[]>(
    "JOB_RESUME_VERSIONS",
    []
  );
  const [activeDocumentId, setActiveDocumentId] = useLocalStorage<string>(
    "ACTIVE_RESUME_DOCUMENT_ID",
    "master"
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
  const [jobTarget, setJobTarget] = useLocalStorage<string>("RESUME_AI_JOB_TARGET", "");

  const [llmSettings, setLlmSettings] = useState<LlmSettings>(() => defaultLlmSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  const activeVersion =
    activeDocumentId === "master"
      ? null
      : jobVersions.find((item) => item.id === activeDocumentId) ?? null;
  const activeMarkdown = activeVersion?.markdown ?? masterMarkdown;
  const activeJobTarget = activeVersion?.jobTarget ?? jobTarget;
  const isMasterActive = activeDocumentId === "master" || !activeVersion;
  const masterStyles: ResumeStyleSettings = {
    theme,
    font,
    headingScale,
    fontScale,
    lineHeightScale,
    xPaddingScale,
    yPaddingScale,
    headerColor,
    textColor,
    linkColor,
    customCss,
    stylePrompt,
  };
  const activeStyles = activeVersion?.styles ?? masterStyles;

  useEffect(() => {
    setLlmSettings(loadLlmSettings());
  }, []);

  const updateMarkdown = useCallback(
    (value: string) => {
      if (activeVersion) {
        setJobVersions(
          jobVersions.map((item) =>
            item.id === activeVersion.id
              ? { ...item, markdown: value, updatedAt: new Date().toISOString() }
              : item
          )
        );
        return;
      }
      setMasterMarkdownStorage(value);
    },
    [activeVersion, jobVersions, setJobVersions, setMasterMarkdownStorage]
  );

  const updateActiveStyles = useCallback(
    (patch: Partial<ResumeStyleSettings>) => {
      if (activeVersion) {
        setJobVersions(
          jobVersions.map((item) =>
            item.id === activeVersion.id
              ? {
                  ...item,
                  styles: {
                    ...masterStyles,
                    ...item.styles,
                    ...patch,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
        );
        return;
      }

      if (patch.theme !== undefined) setTheme(patch.theme);
      if (patch.font !== undefined) setFont(patch.font);
      if (patch.headingScale !== undefined) setHeadingScale(patch.headingScale);
      if (patch.fontScale !== undefined) setFontScale(patch.fontScale);
      if (patch.lineHeightScale !== undefined) setLineHeightScale(patch.lineHeightScale);
      if (patch.xPaddingScale !== undefined) setXPaddingScale(patch.xPaddingScale);
      if (patch.yPaddingScale !== undefined) setYPaddingScale(patch.yPaddingScale);
      if (patch.headerColor !== undefined) setHeaderColor(patch.headerColor);
      if (patch.textColor !== undefined) setTextColor(patch.textColor);
      if (patch.linkColor !== undefined) setLinkColor(patch.linkColor);
      if (patch.customCss !== undefined) setCustomCss(patch.customCss);
      if (patch.stylePrompt !== undefined) setStylePrompt(patch.stylePrompt);
    },
    [
      activeVersion,
      jobVersions,
      masterStyles,
      setCustomCss,
      setFont,
      setFontScale,
      setHeaderColor,
      setHeadingScale,
      setJobVersions,
      setLineHeightScale,
      setLinkColor,
      setStylePrompt,
      setTextColor,
      setTheme,
      setXPaddingScale,
      setYPaddingScale,
    ]
  );

  const handleMasterGenerated = useCallback(
    (md: string) => {
      setMasterMarkdownStorage(md);
      setActiveDocumentId("master");
      setFeedback({
        tone: "success",
        message: "底稿已写入编辑区。",
      });
    },
    [setActiveDocumentId, setMasterMarkdownStorage]
  );

  const handleJobTargetChange = useCallback(
    (value: string) => {
      if (activeVersion) {
        setJobVersions(
          jobVersions.map((item) =>
            item.id === activeVersion.id
              ? { ...item, jobTarget: value, name: value.trim().split(/\s+/)[0] || item.name, updatedAt: new Date().toISOString() }
              : item
          )
        );
        return;
      }
      setJobTarget(value);
    },
    [activeVersion, jobVersions, setJobTarget, setJobVersions]
  );

  const createJobVersion = useCallback(
    (initial?: { name?: string; jobTarget?: string; markdown?: string; styles?: ResumeStyleSettings }) => {
      const now = new Date().toISOString();
      const target = initial?.jobTarget?.trim() || jobTarget.trim();
      const next: JobResumeVersion = {
        id: `job_${Date.now()}`,
        name: initial?.name?.trim() || target.split(/\s+/)[0] || `岗位 ${jobVersions.length + 1}`,
        jobTarget: target,
        markdown: initial?.markdown ?? masterMarkdown,
        styles: initial?.styles ?? masterStyles,
        createdAt: now,
        updatedAt: now,
      };
      setJobVersions([next, ...jobVersions]);
      setActiveDocumentId(next.id);
      return next;
    },
    [jobTarget, jobVersions, masterMarkdown, masterStyles, setActiveDocumentId, setJobVersions]
  );

  const handleAdaptedMarkdownGenerated = useCallback(
    (md: string, target: string) => {
      const now = new Date().toISOString();
      const trimmedTarget = target.trim();
      if (activeVersion) {
        setJobVersions(
          jobVersions.map((item) =>
            item.id === activeVersion.id
              ? {
                  ...item,
                  name: trimmedTarget.split(/\s+/)[0] || item.name,
                  jobTarget: trimmedTarget,
                  markdown: md,
                  updatedAt: now,
                }
              : item
          )
        );
        setFeedback({
          tone: "success",
          message: `"${activeVersion.name}"适配简历已更新。`,
        });
        return;
      }

      const next: JobResumeVersion = {
        id: `job_${Date.now()}`,
        name: trimmedTarget.split(/\s+/)[0] || `岗位 ${jobVersions.length + 1}`,
        jobTarget: trimmedTarget,
        markdown: md,
        styles: masterStyles,
        createdAt: now,
        updatedAt: now,
      };
      setJobVersions([next, ...jobVersions]);
      setActiveDocumentId(next.id);
      setFeedback({
        tone: "success",
        message: `"${next.name}"适配简历已创建。`,
      });
    },
    [activeVersion, jobVersions, masterStyles, setActiveDocumentId, setJobVersions]
  );

  const handleDeleteJobVersion = useCallback(
    (id: string) => {
      const target = jobVersions.find((item) => item.id === id);
      setJobVersions(jobVersions.filter((item) => item.id !== id));
      if (activeDocumentId === id) {
        setActiveDocumentId("master");
      }
      if (target) {
        setFeedback({
          tone: "success",
          message: `"${target.name}"版本已删除。`,
        });
      }
    },
    [activeDocumentId, jobVersions, setActiveDocumentId, setJobVersions]
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
    updateActiveStyles({ customCss: css });
  }, [updateActiveStyles]);

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
    if (masterMarkdown) return;

    const selectedTemplate = (template || "mashhad").toLowerCase();

    fetch(`/templates/${selectedTemplate}.md`)
      .then((res) => {
        if (!res.ok) {
          setMasterMarkdownStorage("无法加载默认简历模板。");
          return;
        }

        res.text().then((content) => {
          setMasterMarkdownStorage(content);
          applyThemeSettings(selectedTemplate);
        });
      })
      .catch(() => {
        setMasterMarkdownStorage("无法加载默认简历模板。");
      });
  }, [applyThemeSettings, masterMarkdown, markdownHydrated, setMasterMarkdownStorage, template]);

  useEffect(() => {
    if (!jobVersionsHydrated) return;
    if (activeDocumentId === "master") return;
    if (jobVersions.some((item) => item.id === activeDocumentId)) return;
    setActiveDocumentId("master");
  }, [activeDocumentId, jobVersions, jobVersionsHydrated, setActiveDocumentId]);

  useEffect(() => {
    if (!(activeStyles.font in fonts)) return;
    loadFont(fonts[activeStyles.font as FontKey]);
  }, [activeStyles.font]);

  const handleThemeChange = useCallback(
    (selectedTheme: string) => {
      const normalizedTheme = selectedTheme.toLowerCase() as ThemeKey;
      const selectedThemeSettings = themes[normalizedTheme];
      if (!selectedThemeSettings) return;
      updateActiveStyles({
        theme: normalizedTheme,
        font: selectedThemeSettings.fontName,
        fontScale: selectedThemeSettings.fontScale,
        headingScale: selectedThemeSettings.headingScale,
        lineHeightScale: selectedThemeSettings.lineHeightScale,
        xPaddingScale: selectedThemeSettings.xPaddingScale,
        yPaddingScale: selectedThemeSettings.yPaddingScale,
        headerColor: selectedThemeSettings.headerColor,
        textColor: selectedThemeSettings.textColor,
        linkColor: selectedThemeSettings.linkColor,
      });
      const themeKey = selectedTheme.toLowerCase() as ThemeKey;
      const preset = themePresetMeta[themeKey];
      if (!preset) return;
      setFeedback({
        tone: "info",
        message: `已切换到 ${preset.label}：${preset.expectation}`,
      });
    },
    [updateActiveStyles]
  );

  const handleDensityPresetChange = useCallback((presetId: DensityPresetId) => {
    const preset = densityPresets.find((item) => item.id === presetId);
    if (!preset) return;

    updateActiveStyles({
      lineHeightScale: preset.lineHeightScale,
      xPaddingScale: preset.xPaddingScale,
      yPaddingScale: preset.yPaddingScale,
    });
    setFeedback({
      tone: "success",
      message: `版式密度已调整为"${preset.label}"。`,
    });
  }, [updateActiveStyles]);

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

      const response = await fetch("/api/generate-pdf/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: exportRoot ? exportRoot.innerHTML : previewElement.innerHTML,
          theme: activeStyles.theme,
          styles: {
            fontName: getFontFamilyStack(activeStyles.font),
            fontScale: activeStyles.fontScale,
            headingScale: activeStyles.headingScale,
            lineHeightScale: activeStyles.lineHeightScale,
            xPaddingScale: activeStyles.xPaddingScale,
            yPaddingScale: activeStyles.yPaddingScale,
            headerColor: activeStyles.headerColor,
            textColor: activeStyles.textColor,
            linkColor: activeStyles.linkColor,
            customCss: activeStyles.customCss,
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
    activeMarkdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || (isMasterActive ? "底稿" : activeVersion?.name) || "未命名简历";

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
            content={activeMarkdown}
            theme={activeStyles.theme}
            font={activeStyles.font}
            fontScale={activeStyles.fontScale}
            headingScale={activeStyles.headingScale}
            lineHeightScale={activeStyles.lineHeightScale}
            xPaddingScale={activeStyles.xPaddingScale}
            yPaddingScale={activeStyles.yPaddingScale}
            headerColor={activeStyles.headerColor}
            textColor={activeStyles.textColor}
            linkColor={activeStyles.linkColor}
            customCss={activeStyles.customCss}
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

          <div className="flex shrink-0 items-center gap-2 overflow-x-auto rounded-[var(--ui-radius)] border border-[--ui-border] bg-white px-3 py-2">
            <button
              type="button"
              className={cn(
                "shrink-0 rounded-[4px] border px-3 py-1.5 text-xs font-medium transition-colors",
                isMasterActive
                  ? "border-[--ui-text] bg-[--ui-text] text-white"
                  : "border-[--ui-border] text-[--ui-text] hover:border-[--ui-text]"
              )}
              onClick={() => setActiveDocumentId("master")}
            >
              固定底稿
            </button>

            {jobVersions.map((item) => {
              const active = activeVersion?.id === item.id;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex shrink-0 items-center overflow-hidden rounded-[4px] border transition-colors",
                    active
                      ? "border-[--ui-text] bg-[--ui-text] text-white"
                      : "border-[--ui-border] bg-white text-[--ui-text] hover:border-[--ui-text]"
                  )}
                >
                  <button
                    type="button"
                    className="max-w-[180px] truncate px-3 py-1.5 text-xs font-medium"
                    onClick={() => setActiveDocumentId(item.id)}
                    title={item.jobTarget || item.name}
                  >
                    {item.name}
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "border-l px-2 py-1.5 transition-colors",
                      active ? "border-white/25 hover:bg-white/10" : "border-[--ui-border] hover:text-red-600"
                    )}
                    onClick={() => handleDeleteJobVersion(item.id)}
                    aria-label={`删除 ${item.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[4px] border border-[--ui-border] px-3 py-1.5 text-xs font-medium text-[--ui-text] transition-colors hover:border-[--ui-text]"
              onClick={() => createJobVersion()}
            >
              <Plus className="h-3.5 w-3.5" />
              新岗位
            </button>
          </div>

          <div className="grid min-h-0 flex-1 gap-3 min-[1280px]:grid-cols-[minmax(0,1fr)_260px] lg:overflow-hidden">
            <div className="min-w-0 min-h-0 overflow-hidden">
              <div className="grid h-full min-h-0 gap-3 min-[1180px]:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
                <section className="flex min-h-0 flex-col overflow-hidden rounded-[var(--ui-radius)] border border-[--ui-border] bg-white">
                  <div className="flex shrink-0 items-center justify-between border-b border-[--ui-border] px-3 py-2">
                    <p className="truncate text-xs font-medium text-[--ui-text-muted]">
                      {isMasterActive ? "底稿编辑区" : `${activeVersion?.name ?? "岗位"}编辑区`}
                    </p>
                    <span className="text-xs text-[--ui-text-muted]">{activeMarkdown.length} 字</span>
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <Editor
                      key={activeVersion?.id ?? "master"}
                      markdown={activeMarkdown}
                      onChangeAction={updateMarkdown}
                      className="h-full min-h-0"
                    />
                  </div>
                </section>

                <section className="flex min-h-0 flex-col overflow-hidden rounded-[var(--ui-radius)] border border-[--ui-border] bg-[--ui-bg-subtle]">
                  <div className="flex shrink-0 items-center justify-between border-b border-[--ui-border] bg-white px-3 py-2">
                    <p className="truncate text-xs font-medium text-[--ui-text-muted]">
                      {isMasterActive ? "底稿预览区" : `${activeVersion?.name ?? "岗位"}预览区`}
                    </p>
                    <span className="text-xs text-[--ui-text-muted]">
                      {themePresetMeta[(activeStyles.theme in themePresetMeta ? activeStyles.theme : "tehran") as ThemeKey]?.label ?? "主题"}
                    </span>
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <Preview
                      content={activeMarkdown}
                      theme={activeStyles.theme}
                      font={activeStyles.font}
                      fontScale={activeStyles.fontScale}
                      headingScale={activeStyles.headingScale}
                      lineHeightScale={activeStyles.lineHeightScale}
                      xPaddingScale={activeStyles.xPaddingScale}
                      yPaddingScale={activeStyles.yPaddingScale}
                      headerColor={activeStyles.headerColor}
                      textColor={activeStyles.textColor}
                      linkColor={activeStyles.linkColor}
                      customCss={activeStyles.customCss}
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
                onFontChange={(nextFont) => updateActiveStyles({ font: nextFont })}
                onFontSizeChange={(size) => updateActiveStyles({ fontScale: size })}
                onLineHeightChange={(height) => updateActiveStyles({ lineHeightScale: height })}
                onXPaddingChange={(padding) => updateActiveStyles({ xPaddingScale: padding })}
                onYPaddingChange={(padding) => updateActiveStyles({ yPaddingScale: padding })}
                fontScale={activeStyles.fontScale}
                lineHeightScale={activeStyles.lineHeightScale}
                headingScale={activeStyles.headingScale}
                onHeadingChange={(nextHeading) => updateActiveStyles({ headingScale: nextHeading })}
                xPaddingScale={activeStyles.xPaddingScale}
                yPaddingScale={activeStyles.yPaddingScale}
                selectedTheme={activeStyles.theme}
                headerColor={activeStyles.headerColor}
                setHeaderColor={(color) => updateActiveStyles({ headerColor: color })}
                textColor={activeStyles.textColor}
                setTextColor={(color) => updateActiveStyles({ textColor: color })}
                linkColor={activeStyles.linkColor}
                setLinkColor={(color) => updateActiveStyles({ linkColor: color })}
                customCss={activeStyles.customCss}
                onCustomCssChange={(css) => updateActiveStyles({ customCss: css })}
                font={activeStyles.font}
                aiRawInput={rawInput}
                onAiRawInputChange={setRawInput}
                baseMarkdown={masterMarkdown}
                activeDocumentLabel={isMasterActive ? "固定底稿" : activeVersion?.name ?? "岗位版本"}
                jobTarget={activeJobTarget}
                onJobTargetChange={handleJobTargetChange}
                llmSettings={llmSettings}
                onMarkdownGenerated={handleMasterGenerated}
                onAdaptedMarkdownGenerated={handleAdaptedMarkdownGenerated}
                theme={activeStyles.theme}
                stylePrompt={activeStyles.stylePrompt}
                onStylePromptChange={(prompt) => updateActiveStyles({ stylePrompt: prompt })}
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
