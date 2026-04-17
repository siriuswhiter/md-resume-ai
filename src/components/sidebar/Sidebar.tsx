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
import { cn } from "@/lib/utils";
import { siteMono, siteSans } from "@/lib/siteFonts";

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

const clayShadow =
  "shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)]";
const monoLabel = cn(
  siteMono.className,
  "text-[11px] font-normal uppercase tracking-[0.24em]"
);

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
    <div
      className={cn(
        siteSans.className,
        clayShadow,
        "sidebar flex h-full flex-col rounded-[34px] border border-[#dad4c8] bg-white"
      )}
    >
      <div className="flex items-center justify-between border-b border-[#eee9df] px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[18px] border border-black bg-[#f8cc65] text-black">
            <PanelRight className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className={cn(monoLabel, "text-[#55534e]")}>Control deck</p>
            <h2 className="mt-1 text-base font-semibold text-black">工具面板</h2>
          </div>
        </div>
        {variant === "drawer" && onClose ? (
          <button
            type="button"
            className="rounded-full border border-[#dad4c8] bg-white p-2 text-[#55534e] transition-transform duration-200 hover:-translate-y-1 hover:-rotate-2 hover:bg-[#fc7981] hover:text-black hover:shadow-[-6px_6px_0_#000000]"
            onClick={onClose}
            aria-label="关闭工具抽屉"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-[#eee9df] px-4 py-3">
        <button
          type="button"
          className={cn(
            clayShadow,
            "inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-transform duration-200",
            activeTab === "style"
              ? "border-black bg-[#84e7a5] text-[#02492a]"
              : "border-[#dad4c8] bg-white text-[#55534e] hover:-rotate-2 hover:-translate-y-0.5 hover:bg-[#f8cc65] hover:text-black"
          )}
          onClick={() => setActiveTab("style")}
        >
          <Palette className="h-4 w-4" />
          样式
        </button>
        <button
          type="button"
          className={cn(
            clayShadow,
            "inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-transform duration-200",
            activeTab === "ai"
              ? "border-black bg-[#c1b0ff] text-[#32037d]"
              : "border-[#dad4c8] bg-white text-[#55534e] hover:-rotate-2 hover:-translate-y-0.5 hover:bg-[#3bd3fd] hover:text-black"
          )}
          onClick={() => setActiveTab("ai")}
        >
          <Sparkles className="h-4 w-4" />
          AI 助手
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {activeTab === "style" ? (
          <div className="space-y-4">
            <div className={cn(clayShadow, "rounded-[26px] border border-[#dad4c8] bg-[#faf9f7] p-4")}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[#01418d]" />
                  <p className="text-sm font-semibold text-black">主题</p>
                </div>
                <span className={cn(monoLabel, "rounded-full border border-[#dad4c8] bg-white px-2.5 py-1 text-[#55534e]")}>
                  当前：{selectedThemeMeta.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(themePresetMeta).map((preset, index) => {
                  const active = preset.id === normalizedTheme;
                  const accents = ["bg-white", "bg-[#84e7a5]", "bg-[#f8cc65]", "bg-[#c1b0ff]"];
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => onThemeChange(preset.id)}
                      className={cn(
                        clayShadow,
                        "rounded-[20px] border px-3 py-3 text-left transition-transform duration-200 hover:-translate-y-1 hover:-rotate-1 hover:shadow-[-6px_6px_0_#000000]",
                        active
                          ? "border-black bg-[#3bd3fd]"
                          : `border-[#dad4c8] ${accents[index % accents.length]}`
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-black">{preset.label}</p>
                        {active ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black bg-white text-black">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={cn(clayShadow, "rounded-[26px] border border-[#dad4c8] bg-white p-4")}>
              <div className="mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4 text-[#01418d]" />
                <p className="text-sm font-semibold text-black">高频设置</p>
              </div>

              <div>
                <label className={cn(monoLabel, "mb-2 block text-[#55534e]")}>字体风格</label>
                <div className="relative">
                  <select
                    value={font}
                    onChange={(e) => onFontChange(e.target.value)}
                    className="w-full appearance-none rounded-full border border-[#dad4c8] bg-[#faf9f7] px-4 py-3 text-sm text-black outline-none transition hover:bg-white focus:border-[#01418d] focus:ring-2 focus:ring-[#3bd3fd]"
                    aria-label="选择字体"
                    style={{ fontFamily: font }}
                  >
                    {Object.keys(fonts).map((fontKey) => (
                      <option key={fontKey} value={fontKey}>
                        {fontKey}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#55534e]" />
                </div>
              </div>

              <div className="mt-4">
                <label className={cn(monoLabel, "mb-2 block text-[#55534e]")}>版式密度</label>
                <div className="grid grid-cols-3 gap-2">
                  {densityPresets.map((preset, index) => {
                    const active = matchedDensity === preset.id;
                    const accents = ["bg-white", "bg-[#84e7a5]", "bg-[#f8cc65]"];
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => onDensityPresetChange(preset.id)}
                        className={cn(
                          clayShadow,
                          "rounded-[18px] border px-3 py-3 text-left transition-transform duration-200 hover:-translate-y-1 hover:-rotate-1 hover:shadow-[-5px_5px_0_#000000]",
                          active
                            ? "border-black bg-[#c1b0ff] text-[#32037d]"
                            : `border-[#dad4c8] ${accents[index % accents.length]} text-black`
                        )}
                      >
                        <p className="text-sm font-medium">{preset.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={cn(clayShadow, "rounded-[26px] border border-[#dad4c8] bg-white p-4")}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 text-left"
                onClick={() => setAdvancedOpen((current) => !current)}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[#01418d]" />
                  <div>
                    <p className={cn(monoLabel, "text-[#55534e]")}>Deeper control</p>
                    <p className="mt-1 text-sm font-semibold text-black">高级设置</p>
                  </div>
                </div>
                <ChevronDown
                  className={cn("h-4 w-4 text-[#55534e] transition", advancedOpen ? "rotate-180" : "")}
                />
              </button>

              {advancedOpen ? (
                <div className="mt-4 space-y-4 border-t border-dashed border-[#dad4c8] pt-4">
                  <div className="rounded-[22px] border border-[#dad4c8] bg-[#faf9f7] p-4">
                    <p className={cn(monoLabel, "mb-3 text-[#55534e]")}>字体与层级</p>
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

                  <div className="rounded-[22px] border border-[#dad4c8] bg-[#faf9f7] p-4">
                    <p className={cn(monoLabel, "mb-3 text-[#55534e]")}>版式微调</p>
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

                  <div className="rounded-[22px] border border-[#dad4c8] bg-[#faf9f7] p-4">
                    <p className={cn(monoLabel, "mb-3 text-[#55534e]")}>颜色</p>
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

                  <div className="rounded-[22px] border border-[#dad4c8] bg-[#faf9f7] p-4">
                    <p className={cn(monoLabel, "mb-3 text-[#55534e]")}>自定义 CSS</p>
                    <textarea
                      value={customCss}
                      onChange={(e) => onCustomCssChange(e.target.value)}
                      spellCheck={false}
                      placeholder={`.previewContainer h2 {\n  border-bottom: 1px solid var(--headerColor);\n  padding-bottom: 0.35rem;\n}`}
                      className="min-h-[180px] w-full rounded-[22px] border border-[#dad4c8] bg-white px-4 py-3 font-mono text-xs leading-6 text-black outline-none transition focus:border-[#01418d] focus:ring-2 focus:ring-[#3bd3fd]"
                    />
                    <p className="mt-3 text-xs leading-5 text-[#55534e]">
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

      <div className="border-t border-[#eee9df] px-4 py-3">
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full border-black bg-white text-black hover:-translate-y-1 hover:-rotate-2 hover:bg-[#fc7981] hover:shadow-[-7px_7px_0_#000000]"
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
    <div className="fixed inset-0 z-40 hidden bg-black/20 backdrop-blur-[2px] lg:block min-[1400px]:hidden">
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
