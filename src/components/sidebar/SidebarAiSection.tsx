"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Maximize2,
  Paintbrush2,
  Sparkles,
  TriangleAlert,
  WandSparkles,
  X,
} from "lucide-react";
import {
  generateMarkdownResumeBody,
  generatePreviewCssTemplate,
} from "@/lib/llm";
import type { LlmSettings } from "@/lib/llmTypes";
import type {
  GeneratedStyleTemplate,
  SavedStyleTemplate,
} from "@/lib/styleAssistantTypes";
import { Button } from "@/components/ui/button";

const RESUME_PLACEHOLDER =
  "粘贴杂乱经历，例如：联系方式、教育背景、工作经历、项目要点、技能清单、求职方向。";
const STYLE_PLACEHOLDER =
  "例如：做一个技术风格的简历标题层级，H2 下方加细横线，列表更紧凑，链接不要下划线。";

type Props = {
  rawInput: string;
  onRawInputChange: (v: string) => void;
  llmSettings: LlmSettings;
  onMarkdownGenerated: (md: string) => void;
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
  llmSettings,
  onMarkdownGenerated,
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

  const requireConfiguredLlm = () => {
    if (llmSettings.useServerRoute || llmSettings.apiKey.trim()) {
      return true;
    }
    return false;
  };

  const handleGenerateResume = async () => {
    setResumeError(null);
    setResumeSuccess(null);

    if (!requireConfiguredLlm()) {
      setResumeError("请先在页面右上角完成 AI 配置。");
      return;
    }

    if (!rawInput.trim()) {
      setResumeError("请先粘贴原始经历，再生成 Markdown 草稿。");
      return;
    }

    setResumeLoading(true);
    try {
      const markdown = await generateMarkdownResumeBody(llmSettings, rawInput);
      onMarkdownGenerated(markdown);
      setExpandedOpen(false);
      setResumeSuccess("Markdown 草稿已写入编辑区，接下来可继续手动精修。");
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
      setStyleError("请先在页面右上角完成 AI 配置。");
      return;
    }

    if (!stylePrompt.trim()) {
      setStyleError("请先描述你想要的样式效果，再生成 CSS。");
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
          : `${template.name} 已应用到当前自定义 CSS。`
      );
    } catch (e) {
      setStyleError(e instanceof Error ? e.message : String(e));
    } finally {
      setStyleLoading(false);
    }
  };

  const handleSaveTemplate = () => {
    setStyleError(null);
    setStyleSuccess(null);

    if (!customCss.trim()) {
      setStyleError("当前没有可保存的 CSS。请先生成或手动填写自定义样式。");
      return;
    }

    const finalName = templateName.trim() || generatedTemplate?.name || "未命名样式模板";
    onSaveStyleTemplate({
      name: finalName,
      css: customCss,
      summary: generatedTemplate?.summary?.trim() || undefined,
    });
    setTemplateName(finalName);
    setStyleSuccess(`样式模板“${finalName}”已保存到本地浏览器。`);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                AI 助手
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">简历草稿</p>
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              onClick={() => setExpandedOpen(true)}
              title="在大窗口中编辑原始材料"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              放大
            </button>
          </div>

          <textarea
            className="min-h-[220px] w-full resize-y rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
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

          <div className="mt-3 flex flex-col gap-2">
            <Button
              type="button"
              disabled={resumeLoading}
              className="h-11 rounded-full bg-slate-900 text-white hover:bg-slate-800"
              onClick={handleGenerateResume}
            >
              {resumeLoading ? (
                <>
                  <WandSparkles className="h-4 w-4 animate-pulse" />
                  正在生成 Markdown 草稿...
                </>
              ) : (
                <>
                  <WandSparkles className="h-4 w-4" />
                  生成草稿并写入编辑器
                </>
              )}
            </Button>
          </div>

          {resumeLoading ? (
            <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              正在向模型发送请求并整理简历结构，请稍候。
            </div>
          ) : null}
          {resumeSuccess ? (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{resumeSuccess}</span>
            </div>
          ) : null}
          {resumeError ? (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{resumeError}</span>
            </div>
          ) : null}
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Paintbrush2 className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">样式助手</p>
            </div>
          </div>

          <textarea
            className="min-h-[120px] w-full resize-y rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            value={stylePrompt}
            onChange={(e) => {
              onStylePromptChange(e.target.value);
              if (styleSuccess) setStyleSuccess(null);
              if (styleError) setStyleError(null);
            }}
            placeholder={STYLE_PLACEHOLDER}
            spellCheck={false}
            aria-label="样式助手需求描述"
          />

          <div className="mt-3 flex flex-col gap-2">
            <Button
              type="button"
              disabled={styleLoading}
              className="h-11 rounded-full bg-slate-900 text-white hover:bg-slate-800"
              onClick={handleGenerateStyle}
            >
              {styleLoading ? (
                <>
                  <WandSparkles className="h-4 w-4 animate-pulse" />
                  正在生成样式...
                </>
              ) : (
                <>
                  <WandSparkles className="h-4 w-4" />
                  生成样式并应用
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
              保存当前样式
            </p>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="模板名称，例如：技术风格细横线"
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                onClick={handleSaveTemplate}
              >
                保存为本地模板
              </Button>
            </div>
          </div>

          {savedStyleTemplates.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                本地模板
              </p>
              <div className="mt-3 space-y-2">
                {savedStyleTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {template.name}
                        </p>
                        {template.summary ? (
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {template.summary}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        onClick={() => onDeleteStyleTemplate(template.id)}
                        aria-label={`删除模板 ${template.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          onApplyStyleTemplate(template.css);
                          setTemplateName(template.name);
                          setGeneratedTemplate({
                            name: template.name,
                            css: template.css,
                            summary: template.summary,
                          });
                          setStyleSuccess(`已应用本地模板“${template.name}”。`);
                          setStyleError(null);
                        }}
                      >
                        应用
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {styleLoading ? (
            <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              正在根据你的描述生成 CSS，并同步到预览与导出样式。
            </div>
          ) : null}
          {styleSuccess ? (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{styleSuccess}</span>
            </div>
          ) : null}
          {styleError ? (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{styleError}</span>
            </div>
          ) : null}
        </div>
      </div>

      {expandedOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-expand-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExpandedOpen(false);
          }}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-[28px] bg-white p-5 shadow-2xl ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3
                  id="ai-expand-title"
                  className="text-base font-semibold text-slate-900"
                >
                  编辑原始经历
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  适合粘贴长文本。生成成功后会直接写入左侧 Markdown 编辑区。
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                onClick={() => setExpandedOpen(false)}
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              ref={expandedTextareaRef}
              className="mt-4 min-h-[min(55vh,520px)] w-full flex-1 resize-y rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              value={rawInput}
              onChange={(e) => onRawInputChange(e.target.value)}
              placeholder={RESUME_PLACEHOLDER}
              spellCheck={false}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{rawInput.length} 字</span>
              <span className="hidden sm:inline">Esc 关闭 · 点击背景可关闭</span>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setExpandedOpen(false)}
              >
                取消
              </Button>
              <Button
                type="button"
                className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
                disabled={resumeLoading}
                onClick={handleGenerateResume}
              >
                {resumeLoading ? "生成中..." : "生成草稿并写入编辑器"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
