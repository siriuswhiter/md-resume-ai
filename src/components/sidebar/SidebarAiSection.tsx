"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  Maximize2,
  Server,
  Sparkles,
  TriangleAlert,
  WandSparkles,
  X,
} from "lucide-react";
import { generateMarkdownResumeBody } from "@/lib/llm";
import type { LlmSettings } from "@/lib/llmTypes";
import { LlmSettingsModal } from "@/components/ai/LlmSettingsModal";
import { Button } from "@/components/ui/button";

const PLACEHOLDER = "粘贴杂乱经历，例如：联系方式、教育背景、工作经历、项目要点、技能清单、求职方向。";

type Props = {
  rawInput: string;
  onRawInputChange: (v: string) => void;
  llmSettings: LlmSettings;
  onLlmSettingsChange: (s: LlmSettings) => void;
  onMarkdownGenerated: (md: string) => void;
};

export function SidebarAiSection({
  rawInput,
  onRawInputChange,
  llmSettings,
  onLlmSettingsChange,
  onMarkdownGenerated,
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expandedOpen, setExpandedOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const expandedTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const persistSettings = useCallback(
    (settings: LlmSettings) => {
      onLlmSettingsChange(settings);
      setSuccess("AI 配置已保存，可以开始生成草稿。");
      setError(null);
    },
    [onLlmSettingsChange]
  );

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

  const handleRawInputChange = (value: string) => {
    onRawInputChange(value);
    if (success) setSuccess(null);
    if (error) setError(null);
  };

  const handleGenerate = async () => {
    setError(null);
    setSuccess(null);

    if (!llmSettings.useServerRoute && !llmSettings.apiKey.trim()) {
      setError("请先配置 API Key，或启用服务端 Key。");
      setSettingsOpen(true);
      return;
    }

    if (!rawInput.trim()) {
      setError("请先粘贴原始经历，再生成 Markdown 草稿。");
      return;
    }

    setLoading(true);
    try {
      const markdown = await generateMarkdownResumeBody(llmSettings, rawInput);
      onMarkdownGenerated(markdown);
      setExpandedOpen(false);
      setSuccess("Markdown 草稿已写入编辑区，接下来可继续手动精修。");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const configurationLabel = llmSettings.useServerRoute
    ? "服务端 Key 已启用"
    : llmSettings.apiKey.trim()
      ? "本机 Key 已配置"
      : "尚未配置 Key";

  const configurationHint = llmSettings.useServerRoute
    ? "浏览器不保存密钥，推荐部署时使用。"
    : llmSettings.apiKey.trim()
      ? "密钥仅保存在当前浏览器 localStorage。"
      : "先完成配置，生成按钮才会真正执行。";

  const stepCards = [
    {
      title: "1. 粘贴原始经历",
      description: "把零散信息贴进来，不需要提前整理格式。",
      active: rawInput.trim().length > 0,
    },
    {
      title: "2. 生成 Markdown 草稿",
      description: "AI 会整理为更适合投递的结构化简历正文。",
      active: loading,
    },
    {
      title: "3. 写入编辑器并精修",
      description: "结果会直接进入左侧编辑区，便于继续人工调整。",
      active: Boolean(success),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                AI 辅助路径
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">
                粘贴原始经历，生成 Markdown 草稿，再写回编辑器
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                这里不是主编辑流，而是把杂乱材料快速整理成可编辑初稿。生成后仍建议继续手动精修。
              </p>
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

          <div className="mt-4 grid gap-3">
            {stepCards.map((step) => (
              <div
                key={step.title}
                className={`rounded-2xl border px-3 py-3 transition ${
                  step.active
                    ? "border-sky-300 bg-sky-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <p className="text-sm font-medium text-slate-900">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">原始材料输入区</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                示例：个人信息、教育、工作、项目、技能、获奖、求职方向。
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
              {rawInput.trim() ? `${rawInput.length} 字` : "等待输入"}
            </div>
          </div>

          <textarea
            className="min-h-[220px] w-full resize-y rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            value={rawInput}
            onChange={(e) => handleRawInputChange(e.target.value)}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            aria-label="AI 生成用原始材料"
          />

          <div className="mt-3 flex flex-col gap-2">
            <Button
              type="button"
              disabled={loading}
              className="h-11 rounded-full bg-slate-900 text-white hover:bg-slate-800"
              onClick={handleGenerate}
            >
              {loading ? (
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
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              onClick={() => setSettingsOpen(true)}
            >
              <KeyRound className="h-4 w-4" />
              配置 AI
            </Button>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">配置状态</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {configurationHint}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
              {llmSettings.useServerRoute ? (
                <Server className="h-3.5 w-3.5" />
              ) : (
                <KeyRound className="h-3.5 w-3.5" />
              )}
              {configurationLabel}
            </div>
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-6 text-slate-600">
            模型：<span className="font-medium text-slate-900">{llmSettings.model}</span>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            正在向模型发送请求并整理简历结构，请稍候。
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {expandedOpen && (
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
              onChange={(e) => handleRawInputChange(e.target.value)}
              placeholder={PLACEHOLDER}
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
                disabled={loading}
                onClick={handleGenerate}
              >
                {loading ? "生成中..." : "生成草稿并写入编辑器"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <LlmSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={llmSettings}
        onChange={persistSettings}
      />
    </>
  );
}
