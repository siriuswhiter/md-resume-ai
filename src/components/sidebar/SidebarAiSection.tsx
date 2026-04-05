"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Sparkles, X } from "lucide-react";
import { SidebarSection } from "@/components/sidebar/SidebarSection";
import { generateMarkdownResumeBody } from "@/lib/llm";
import type { LlmSettings } from "@/lib/llmTypes";
import { LlmSettingsModal } from "@/components/ai/LlmSettingsModal";
import { Button } from "@/components/ui/button";

const PLACEHOLDER = "粘贴杂乱经历（联系方式、教育、工作、项目…）";

type Props = {
  rawInput: string;
  onRawInputChange: (v: string) => void;
  llmSettings: LlmSettings;
  onLlmSettingsChange: (s: LlmSettings) => void;
  onMarkdownGenerated: (md: string) => void;
};

/**
 * 侧栏 AI：与 scripts/cv 中 generateMarkdownResumeBody 流程一致，写入左侧 MD 编辑器。
 */
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
  const expandedTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const persistSettings = useCallback(
    (s: LlmSettings) => {
      onLlmSettingsChange(s);
    },
    [onLlmSettingsChange]
  );

  useEffect(() => {
    if (!expandedOpen) return;
    const t = window.setTimeout(() => {
      expandedTextareaRef.current?.focus();
      expandedTextareaRef.current?.setSelectionRange(
        expandedTextareaRef.current.value.length,
        expandedTextareaRef.current.value.length
      );
    }, 50);
    return () => window.clearTimeout(t);
  }, [expandedOpen]);

  useEffect(() => {
    if (!expandedOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedOpen]);

  const handleGenerate = async () => {
    setError(null);
    if (!llmSettings.useServerRoute && !llmSettings.apiKey.trim()) {
      setError("请先配置 API Key，或开启「使用服务端 Key」");
      setSettingsOpen(true);
      return;
    }
    if (!rawInput.trim()) {
      setError("请先粘贴原始材料");
      return;
    }
    setLoading(true);
    try {
      const md = await generateMarkdownResumeBody(llmSettings, rawInput);
      onMarkdownGenerated(md);
      setExpandedOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const inputPanel = (
    <>
      <textarea
        className="min-h-[168px] max-h-[280px] w-full resize-y rounded-lg border border-indigo-200/80 bg-white p-3 font-mono text-[13px] leading-relaxed text-gray-900 shadow-sm outline-none ring-0 transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
        value={rawInput}
        onChange={(e) => onRawInputChange(e.target.value)}
        placeholder={PLACEHOLDER}
        spellCheck={false}
        aria-label="AI 生成用原始材料"
      />
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-400">
        <span>{rawInput.length > 0 ? `${rawInput.length} 字` : " "}</span>
        <span className="text-indigo-500/80">可拖拽右下角调整高度</span>
      </div>
    </>
  );

  return (
    <>
      <SidebarSection title="AI 生成 Markdown" icon={<Sparkles className="h-4 w-4 text-indigo-600" />}>
        <div className="pb-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-xs leading-snug text-gray-600">
              粘贴原始材料后生成 Markdown，写入左侧编辑器。
            </p>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-indigo-200 bg-white px-2 py-1 text-[11px] font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-50"
              onClick={() => setExpandedOpen(true)}
              title="在大窗口中编辑"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              放大
            </button>
          </div>

          <div className="rounded-xl border border-indigo-100/90 bg-gradient-to-b from-indigo-50/50 to-white p-2.5">
            {inputPanel}
          </div>

          <div className="mt-3 flex flex-col gap-2 pb-1">
            <Button
              type="button"
              size="sm"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={handleGenerate}
            >
              {loading ? "生成中…" : "生成并写入编辑器"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setSettingsOpen(true)}
            >
              配置 LLM
            </Button>
          </div>
          {error && (
            <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs leading-relaxed text-red-800">
              {error}
            </p>
          )}
        </div>
      </SidebarSection>

      {expandedOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-expand-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExpandedOpen(false);
          }}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3
                  id="ai-expand-title"
                  className="text-base font-semibold text-gray-900"
                >
                  编辑原始材料
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  大窗口便于粘贴长经历；生成结果仍写入左侧 Markdown 编辑器。
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                onClick={() => setExpandedOpen(false)}
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              ref={expandedTextareaRef}
              className="mt-4 min-h-[min(55vh,520px)] w-full flex-1 resize-y rounded-xl border border-gray-200 bg-gray-50/80 p-4 font-mono text-sm leading-relaxed text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/25"
              value={rawInput}
              onChange={(e) => onRawInputChange(e.target.value)}
              placeholder={PLACEHOLDER}
              spellCheck={false}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
              <span>{rawInput.length} 字</span>
              <span className="hidden sm:inline">Esc 关闭 · 点背景可关闭</span>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setExpandedOpen(false)}
              >
                取消
              </Button>
              <Button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
                onClick={handleGenerate}
              >
                {loading ? "生成中…" : "生成并写入编辑器"}
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
