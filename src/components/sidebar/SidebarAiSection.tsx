"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Maximize2,
  TriangleAlert,
  WandSparkles,
  X,
} from "lucide-react";
import {
  adaptMarkdownResumeForJob,
  generateMarkdownResumeBody,
  generatePreviewCssTemplate,
} from "@/lib/llm";
import type { LlmSettings } from "@/lib/llmTypes";
import type {
  GeneratedStyleTemplate,
  SavedStyleTemplate,
} from "@/lib/styleAssistantTypes";
import { cn } from "@/lib/utils";
import { siteSans } from "@/lib/siteFonts";

const RESUME_PLACEHOLDER =
  "粘贴杂乱经历，例如：联系方式、教育背景、工作经历、项目要点、技能清单、求职方向。";
const JOB_PLACEHOLDER =
  "粘贴目标岗位、招聘 JD 或岗位关键词，例如：前端工程师 / React / B 端 SaaS / 性能优化。";
const STYLE_PLACEHOLDER =
  "例如：H2 下方加细横线，列表更紧凑，链接不要下划线。";

type Props = {
  rawInput: string;
  onRawInputChange: (v: string) => void;
  baseMarkdown: string;
  activeDocumentLabel: string;
  jobTarget: string;
  onJobTargetChange: (v: string) => void;
  llmSettings: LlmSettings;
  onMarkdownGenerated: (md: string) => void;
  onAdaptedMarkdownGenerated: (md: string, jobTarget: string) => void;
  theme: string;
  font: string;
  fontScale: number;
  headingScale: number;
  lineHeightScale: number;
  xPaddingScale: number;
  yPaddingScale: number;
  headerColor: string;
  textColor: string;
  linkColor: string;
  customCss: string;
  onCustomCssChange: (css: string) => void;
  stylePrompt: string;
  onStylePromptChange: (v: string) => void;
  savedStyleTemplates: SavedStyleTemplate[];
  onSaveStyleTemplate: (template: {
    name: string;
    css: string;
    summary?: string;
  }) => void;
  onApplyStyleTemplate: (css: string) => void;
  onDeleteStyleTemplate: (id: string) => void;
};

export function SidebarAiSection({
  rawInput,
  onRawInputChange,
  baseMarkdown,
  activeDocumentLabel,
  jobTarget,
  onJobTargetChange,
  llmSettings,
  onMarkdownGenerated,
  onAdaptedMarkdownGenerated,
  theme,
  font,
  fontScale,
  headingScale,
  lineHeightScale,
  xPaddingScale,
  yPaddingScale,
  headerColor,
  textColor,
  linkColor,
  customCss,
  onCustomCssChange,
  stylePrompt,
  onStylePromptChange,
  savedStyleTemplates,
  onSaveStyleTemplate,
  onApplyStyleTemplate,
  onDeleteStyleTemplate,
}: Props) {
  const [expandedOpen, setExpandedOpen] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeSuccess, setResumeSuccess] = useState<string | null>(null);
  const [adaptLoading, setAdaptLoading] = useState(false);
  const [adaptError, setAdaptError] = useState<string | null>(null);
  const [adaptSuccess, setAdaptSuccess] = useState<string | null>(null);
  const [styleLoading, setStyleLoading] = useState(false);
  const [styleError, setStyleError] = useState<string | null>(null);
  const [styleSuccess, setStyleSuccess] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [generatedTemplate, setGeneratedTemplate] =
    useState<GeneratedStyleTemplate | null>(null);
  const expandedTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!expandedOpen) return;
    const timer = window.setTimeout(() => {
      expandedTextareaRef.current?.focus();
      expandedTextareaRef.current?.setSelectionRange(
        expandedTextareaRef.current.value.length,
        expandedTextareaRef.current.value.length
      );
    }, 50);
    return () => window.clearTimeout(timer);
  }, [expandedOpen]);

  useEffect(() => {
    if (!expandedOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedOpen]);

  const requireConfiguredLlm = () =>
    llmSettings.useServerRoute || !!llmSettings.apiKey.trim();

  const handleGenerateResume = async () => {
    setResumeError(null);
    setResumeSuccess(null);
    if (!requireConfiguredLlm()) {
      setResumeError("请先在右上角「设置」中完成 AI 配置。");
      return;
    }
    if (!rawInput.trim()) {
      setResumeError("请先粘贴原始经历，再生成草稿。");
      return;
    }
    setResumeLoading(true);
    try {
      const markdown = await generateMarkdownResumeBody(llmSettings, rawInput);
      onMarkdownGenerated(markdown);
      setExpandedOpen(false);
      setResumeSuccess("底稿已写入编辑区。");
    } catch (e) {
      setResumeError(e instanceof Error ? e.message : String(e));
    } finally {
      setResumeLoading(false);
    }
  };

  const handleGenerateStyle = async () => {
    setStyleError(null);
    setStyleSuccess(null);
    if (!requireConfiguredLlm()) {
      setStyleError("请先在右上角「设置」中完成 AI 配置。");
      return;
    }
    if (!stylePrompt.trim()) {
      setStyleError("请先描述样式效果。");
      return;
    }
    setStyleLoading(true);
    try {
      const template = await generatePreviewCssTemplate(llmSettings, {
        request: stylePrompt,
        theme,
        currentCss: customCss,
        font,
        fontScale,
        headingScale,
        lineHeightScale,
        xPaddingScale,
        yPaddingScale,
        headerColor,
        textColor,
        linkColor,
      });
      onCustomCssChange(template.css);
      setGeneratedTemplate(template);
      setTemplateName(template.name);
      setStyleSuccess(
        template.summary?.trim()
          ? `${template.name} 已应用。${template.summary}`
          : `${template.name} 已应用。`
      );
    } catch (e) {
      setStyleError(e instanceof Error ? e.message : String(e));
    } finally {
      setStyleLoading(false);
    }
  };

  const handleAdaptResume = async () => {
    setAdaptError(null);
    setAdaptSuccess(null);
    if (!requireConfiguredLlm()) {
      setAdaptError("请先在右上角「设置」中完成 AI 配置。");
      return;
    }
    if (!baseMarkdown.trim()) {
      setAdaptError("请先生成或编辑固定底稿。");
      return;
    }
    if (!jobTarget.trim()) {
      setAdaptError("请先填写目标岗位或岗位 JD。");
      return;
    }
    setAdaptLoading(true);
    try {
      const markdown = await adaptMarkdownResumeForJob(llmSettings, {
        baseMarkdown,
        jobTarget,
        rawText: rawInput,
      });
      onAdaptedMarkdownGenerated(markdown, jobTarget);
      setAdaptSuccess("适配简历已写入岗位版本。");
    } catch (e) {
      setAdaptError(e instanceof Error ? e.message : String(e));
    } finally {
      setAdaptLoading(false);
    }
  };

  const handleSaveTemplate = () => {
    setStyleError(null);
    setStyleSuccess(null);
    if (!customCss.trim()) {
      setStyleError("当前没有可保存的 CSS。");
      return;
    }
    const finalName = templateName.trim() || generatedTemplate?.name || "未命名样式";
    onSaveStyleTemplate({
      name: finalName,
      css: customCss,
      summary: generatedTemplate?.summary?.trim() || undefined,
    });
    setTemplateName(finalName);
    setStyleSuccess(`"${finalName}"已保存。`);
  };

  const btnBase =
    "inline-flex items-center justify-center gap-1.5 rounded-[var(--ui-radius)] border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const btnPrimary = `${btnBase} border-[--ui-text] bg-[--ui-text] text-white hover:opacity-80`;
  const btnSecondary = `${btnBase} border-[--ui-border] bg-white text-[--ui-text] hover:border-[--ui-text]`;

  return (
    <div className={cn(siteSans.className, "space-y-3")}>
      {/* Resume draft */}
      <div className="rounded-[var(--ui-radius)] border border-[--ui-border] p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-[--ui-text-muted]">简历草稿</p>
          <button
            type="button"
            className={btnSecondary}
            onClick={() => setExpandedOpen(true)}
            title="在大窗口中编辑"
          >
            <Maximize2 className="h-3 w-3" />
            放大
          </button>
        </div>

        <textarea
          className="min-h-[100px] w-full resize-y rounded-[4px] border border-[--ui-border] bg-[--ui-bg-subtle] px-3 py-2 text-xs leading-5 text-[--ui-text] outline-none placeholder:text-[--ui-text-muted] focus:border-[--ui-text]"
          value={rawInput}
          onChange={(e) => {
            onRawInputChange(e.target.value);
            if (resumeSuccess) setResumeSuccess(null);
            if (resumeError) setResumeError(null);
          }}
          placeholder={RESUME_PLACEHOLDER}
          spellCheck={false}
          aria-label="AI 生成用原始材料"
        />

        <button
          type="button"
          className={cn(btnPrimary, "mt-2 w-full")}
          disabled={resumeLoading}
          onClick={handleGenerateResume}
        >
          <WandSparkles className={cn("h-3.5 w-3.5", resumeLoading && "animate-pulse")} />
          {resumeLoading ? "生成中..." : "生成草稿"}
        </button>

        {resumeSuccess ? <StatusBar type="success" message={resumeSuccess} /> : null}
        {resumeError ? <StatusBar type="error" message={resumeError} /> : null}
      </div>

      {/* Job adaptation */}
      <div className="rounded-[var(--ui-radius)] border border-[--ui-border] p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-[--ui-text-muted]">岗位适配</p>
          <span className="truncate text-[11px] text-[--ui-text-muted]" title={activeDocumentLabel}>
            {activeDocumentLabel}
          </span>
        </div>

        <textarea
          className="min-h-[90px] w-full resize-y rounded-[4px] border border-[--ui-border] bg-[--ui-bg-subtle] px-3 py-2 text-xs leading-5 text-[--ui-text] outline-none placeholder:text-[--ui-text-muted] focus:border-[--ui-text]"
          value={jobTarget}
          onChange={(e) => {
            onJobTargetChange(e.target.value);
            if (adaptSuccess) setAdaptSuccess(null);
            if (adaptError) setAdaptError(null);
          }}
          placeholder={JOB_PLACEHOLDER}
          spellCheck={false}
          aria-label="目标岗位或岗位 JD"
        />

        <button
          type="button"
          className={cn(btnPrimary, "mt-2 w-full")}
          disabled={adaptLoading}
          onClick={handleAdaptResume}
        >
          <WandSparkles className={cn("h-3.5 w-3.5", adaptLoading && "animate-pulse")} />
          {adaptLoading ? "适配中..." : "生成适配简历"}
        </button>

        {adaptSuccess ? <StatusBar type="success" message={adaptSuccess} /> : null}
        {adaptError ? <StatusBar type="error" message={adaptError} /> : null}
      </div>

      {/* Style assistant */}
      <div className="rounded-[var(--ui-radius)] border border-[--ui-border] p-3">
        <p className="mb-2 text-xs font-medium text-[--ui-text-muted]">样式助手</p>

        <textarea
          className="min-h-[80px] w-full resize-y rounded-[4px] border border-[--ui-border] bg-[--ui-bg-subtle] px-3 py-2 text-xs leading-5 text-[--ui-text] outline-none placeholder:text-[--ui-text-muted] focus:border-[--ui-text]"
          value={stylePrompt}
          onChange={(e) => {
            onStylePromptChange(e.target.value);
            if (styleSuccess) setStyleSuccess(null);
            if (styleError) setStyleError(null);
          }}
          placeholder={STYLE_PLACEHOLDER}
          spellCheck={false}
          aria-label="样式描述"
        />

        <button
          type="button"
          className={cn(btnPrimary, "mt-2 w-full")}
          disabled={styleLoading}
          onClick={handleGenerateStyle}
        >
          <WandSparkles className={cn("h-3.5 w-3.5", styleLoading && "animate-pulse")} />
          {styleLoading ? "生成中..." : "生成样式"}
        </button>

        {styleSuccess ? <StatusBar type="success" message={styleSuccess} /> : null}
        {styleError ? <StatusBar type="error" message={styleError} /> : null}

        {/* Save template */}
        <div className="mt-3 border-t border-[--ui-border] pt-3">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="模板名称"
            className="w-full rounded-[4px] border border-[--ui-border] bg-white px-3 py-1.5 text-xs text-[--ui-text] outline-none focus:border-[--ui-text]"
          />
          <button
            type="button"
            className={cn(btnSecondary, "mt-2 w-full")}
            onClick={handleSaveTemplate}
          >
            保存为本地模板
          </button>
        </div>

        {/* Saved templates */}
        {savedStyleTemplates.length > 0 ? (
          <div className="mt-3 space-y-2 border-t border-[--ui-border] pt-3">
            <p className="text-xs font-medium text-[--ui-text-muted]">本地模板</p>
            {savedStyleTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="flex items-center justify-between gap-2 rounded-[4px] border border-[--ui-border] px-3 py-2"
              >
                <span className="min-w-0 truncate text-xs text-[--ui-text]">{tpl.name}</span>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className={cn(btnSecondary, "px-2 py-1")}
                    onClick={() => {
                      onApplyStyleTemplate(tpl.css);
                      setTemplateName(tpl.name);
                      setGeneratedTemplate({ name: tpl.name, css: tpl.css, summary: tpl.summary });
                      setStyleSuccess(`已应用"${tpl.name}"。`);
                      setStyleError(null);
                    }}
                  >
                    应用
                  </button>
                  <button
                    type="button"
                    className={cn(btnSecondary, "px-2 py-1 hover:border-red-300 hover:text-red-600")}
                    onClick={() => onDeleteStyleTemplate(tpl.id)}
                    aria-label={`删除 ${tpl.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Expanded modal */}
      {expandedOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setExpandedOpen(false); }}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-[var(--ui-radius)] border border-[--ui-border] bg-white p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[--ui-text]">编辑原始经历</p>
              <button
                type="button"
                className={cn(btnSecondary, "p-1.5")}
                onClick={() => setExpandedOpen(false)}
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              ref={expandedTextareaRef}
              className="min-h-[min(55vh,480px)] w-full flex-1 resize-y rounded-[4px] border border-[--ui-border] bg-[--ui-bg-subtle] p-3 text-sm leading-6 text-[--ui-text] outline-none focus:border-[--ui-text]"
              value={rawInput}
              onChange={(e) => onRawInputChange(e.target.value)}
              placeholder={RESUME_PLACEHOLDER}
              spellCheck={false}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-[--ui-text-muted]">{rawInput.length} 字 · Esc 关闭</span>
              <div className="flex gap-2">
                <button type="button" className={btnSecondary} onClick={() => setExpandedOpen(false)}>
                  取消
                </button>
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={resumeLoading}
                  onClick={handleGenerateResume}
                >
                  {resumeLoading ? "生成中..." : "生成草稿"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusBar({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={cn(
        "mt-2 flex items-start gap-1.5 rounded-[4px] border px-3 py-2 text-xs",
        type === "success"
          ? "border-[--ui-border] bg-[--ui-bg-subtle] text-[--ui-text]"
          : "border-red-200 bg-red-50 text-red-700"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : (
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}
