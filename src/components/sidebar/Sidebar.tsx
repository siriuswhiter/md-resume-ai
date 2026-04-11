"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  PanelRight,
  Palette,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  densityPresets,
  fonts,
  type DensityPresetId,
  type ThemeKey,
  themePresetMeta,
} from "@/lib/constants";
import { SidebarAiSection } from "@/components/sidebar/SidebarAiSection";
import { SliderComponent } from "@/components/sidebar/SliderComponent";
import ColorPicker from "@/components/sidebar/ColorPicker";
import type { LlmSettings } from "@/lib/llmTypes";
import type { SavedStyleTemplate } from "@/lib/styleAssistantTypes";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  variant: "inline" | "drawer";
  open?: boolean;
  onClose?: () => void;
  onThemeChange: (theme: string) => void;
  onDensityPresetChange: (presetId: DensityPresetId) => void;
  onFontSizeChange: (size: number) => void;
  onLineHeightChange: (height: number) => void;
  onXPaddingChange: (padding: number) => void;
  onYPaddingChange: (padding: number) => void;
  onFontChange: (font: string) => void;
  fontScale: number;
  lineHeightScale: number;
  headingScale: number;
  onHeadingChange: (heading: number) => void;
  xPaddingScale: number;
  yPaddingScale: number;
  selectedTheme: string;
  headerColor: string;
  setHeaderColor: (color: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  linkColor: string;
  setLinkColor: (color: string) => void;
  customCss: string;
  onCustomCssChange: (css: string) => void;
  font: string;
  aiRawInput: string;
  onAiRawInputChange: (v: string) => void;
  llmSettings: LlmSettings;
  onMarkdownGenerated: (md: string) => void;
  theme: string;
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
}

export default function Sidebar({
  variant,
  open = true,
  onClose,
  onThemeChange,
  onDensityPresetChange,
  onFontSizeChange,
  onLineHeightChange,
  onXPaddingChange,
  onYPaddingChange,
  onFontChange,
  fontScale,
  lineHeightScale,
  headingScale,
  onHeadingChange,
  xPaddingScale,
  yPaddingScale,
  selectedTheme,
  headerColor,
  setHeaderColor,
  textColor,
  setTextColor,
  linkColor,
  setLinkColor,
  customCss,
  onCustomCssChange,
  font,
  aiRawInput,
  onAiRawInputChange,
  llmSettings,
  onMarkdownGenerated,
  theme,
  stylePrompt,
  onStylePromptChange,
  savedStyleTemplates,
  onSaveStyleTemplate,
  onApplyStyleTemplate,
  onDeleteStyleTemplate,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"style" | "ai">("style");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const normalizedTheme = (selectedTheme?.toLowerCase() || "tehran") as ThemeKey;
  const selectedThemeMeta = themePresetMeta[normalizedTheme] ?? themePresetMeta.tehran;

  const matchedDensity =
    densityPresets.find(
      (preset) =>
        preset.lineHeightScale === lineHeightScale &&
        preset.xPaddingScale === xPaddingScale &&
        preset.yPaddingScale === yPaddingScale
    )?.id ?? null;

  const panel = (
    <div className="sidebar flex h-full flex-col rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <PanelRight className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">工具面板</h2>
            <p className="mt-1 text-xs text-slate-500">主题、排版、AI</p>
          </div>
        </div>
        {variant === "drawer" && onClose ? (
          <button
            type="button"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            onClick={onClose}
            aria-label="关闭工具抽屉"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-slate-100 px-4 py-3">
        <button
          type="button"
          className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
            activeTab === "style"
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
          onClick={() => setActiveTab("style")}
        >
          <Palette className="h-4 w-4" />
          样式
        </button>
        <button
          type="button"
          className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
            activeTab === "ai"
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
          onClick={() => setActiveTab("ai")}
        >
          <Sparkles className="h-4 w-4" />
          AI 助手
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {activeTab === "style" ? (
          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-sky-600" />
                  <p className="text-sm font-semibold text-slate-900">主题</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  当前：{selectedThemeMeta.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(themePresetMeta).map((preset) => {
                  const active = preset.id === normalizedTheme;
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => onThemeChange(preset.id)}
                      className={`rounded-[18px] border px-3 py-3 text-left transition ${
                        active
                          ? "border-sky-300 bg-sky-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {preset.label}
                        </p>
                        {active ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4 text-sky-600" />
                <p className="text-sm font-semibold text-slate-900">高频设置</p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                  字体风格
                </label>
                <div className="relative">
                  <select
                    value={font}
                    onChange={(e) => onFontChange(e.target.value)}
                    className="w-full appearance-none rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    aria-label="选择字体"
                    style={{ fontFamily: font }}
                  >
                    {Object.keys(fonts).map((fontKey) => (
                      <option key={fontKey} value={fontKey}>
                        {fontKey}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                  版式密度
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {densityPresets.map((preset) => {
                    const active = matchedDensity === preset.id;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => onDensityPresetChange(preset.id)}
                        className={`rounded-[18px] border px-3 py-3 text-left transition ${
                          active
                            ? "border-sky-300 bg-sky-50"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        <p className="text-sm font-medium text-slate-900">
                          {preset.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 text-left"
                onClick={() => setAdvancedOpen((current) => !current)}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-sky-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      高级设置
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition ${
                    advancedOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {advancedOpen ? (
                <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                      字体与层级
                    </p>
                    <SliderComponent
                      label="正文大小"
                      value={fontScale}
                      min={0.8}
                      max={1.6}
                      step={0.05}
                      onChange={onFontSizeChange}
                      currentValue={`${(fontScale * 16).toFixed(1)}px`}
                    />
                    <SliderComponent
                      label="标题比例"
                      value={headingScale}
                      min={0.8}
                      max={1.8}
                      step={0.05}
                      onChange={onHeadingChange}
                      currentValue={headingScale.toFixed(2)}
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                      版式微调
                    </p>
                    <SliderComponent
                      label="行距"
                      value={lineHeightScale}
                      min={1.2}
                      max={2}
                      step={0.05}
                      onChange={onLineHeightChange}
                      currentValue={lineHeightScale.toFixed(2)}
                    />
                    <SliderComponent
                      label="左右边距"
                      value={xPaddingScale}
                      min={8}
                      max={40}
                      step={2}
                      onChange={onXPaddingChange}
                      currentValue={`${xPaddingScale}px`}
                    />
                    <SliderComponent
                      label="上下边距"
                      value={yPaddingScale}
                      min={0}
                      max={32}
                      step={2}
                      onChange={onYPaddingChange}
                      currentValue={`${yPaddingScale}px`}
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                      颜色
                    </p>
                    <ColorPicker
                      label="标题颜色"
                      value={headerColor}
                      onChange={setHeaderColor}
                    />
                    <ColorPicker
                      label="正文颜色"
                      value={textColor}
                      onChange={setTextColor}
                    />
                    <ColorPicker
                      label="链接颜色"
                      value={linkColor}
                      onChange={setLinkColor}
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                      自定义 CSS
                    </p>
                    <textarea
                      value={customCss}
                      onChange={(e) => onCustomCssChange(e.target.value)}
                      spellCheck={false}
                      placeholder={`.previewContainer h2 {\n  border-bottom: 1px solid var(--headerColor);\n  padding-bottom: 0.35rem;\n}`}
                      className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs leading-6 text-slate-800 outline-none transition hover:border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      直接写作用于 `.previewContainer` 的 CSS。预览与 PDF 导出会共用这份样式。
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <SidebarAiSection
            rawInput={aiRawInput}
            onRawInputChange={onAiRawInputChange}
            llmSettings={llmSettings}
            onMarkdownGenerated={onMarkdownGenerated}
            theme={theme}
            customCss={customCss}
            onCustomCssChange={onCustomCssChange}
            stylePrompt={stylePrompt}
            onStylePromptChange={onStylePromptChange}
            savedStyleTemplates={savedStyleTemplates}
            onSaveStyleTemplate={onSaveStyleTemplate}
            onApplyStyleTemplate={onApplyStyleTemplate}
            onDeleteStyleTemplate={onDeleteStyleTemplate}
          />
        )}
      </div>

      <div className="border-t border-slate-100 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          onClick={onClose}
          disabled={variant !== "drawer"}
        >
          收起工具抽屉
        </Button>
      </div>
    </div>
  );

  if (variant === "inline") {
    return <div className="sticky top-24 h-[calc(100vh-7rem)]">{panel}</div>;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 hidden bg-slate-950/35 backdrop-blur-[2px] lg:block min-[1400px]:hidden">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="关闭工具抽屉遮罩"
      />
      <div className="absolute right-4 top-20 h-[calc(100vh-6rem)] w-[360px] max-w-[calc(100vw-2rem)]">
        {panel}
      </div>
    </div>
  );
}
