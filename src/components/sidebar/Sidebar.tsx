"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
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
import { cn } from "@/lib/utils";
import { siteSans } from "@/lib/siteFonts";

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
        "sidebar flex h-full flex-col rounded-[var(--ui-radius)] border border-[--ui-border] bg-white"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[--ui-border] px-4 py-3">
        <p className="text-xs font-semibold text-[--ui-text]">样式面板</p>
        {variant === "drawer" && onClose ? (
          <button
            type="button"
            className="rounded-[4px] border border-[--ui-border] p-1.5 text-[--ui-text-muted] transition-colors hover:text-[--ui-text]"
            onClick={onClose}
            aria-label="关闭工具抽屉"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[--ui-border]">
        <button
          type="button"
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition-colors",
            activeTab === "style"
              ? "border-b-2 border-[--ui-text] text-[--ui-text]"
              : "text-[--ui-text-muted] hover:text-[--ui-text]"
          )}
          onClick={() => setActiveTab("style")}
        >
          样式
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition-colors",
            activeTab === "ai"
              ? "border-b-2 border-[--ui-text] text-[--ui-text]"
              : "text-[--ui-text-muted] hover:text-[--ui-text]"
          )}
          onClick={() => setActiveTab("ai")}
        >
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI 助手
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {activeTab === "style" ? (
          <div className="space-y-3">
            {/* Theme */}
            <div className="rounded-[var(--ui-radius)] border border-[--ui-border] p-3">
              <p className="mb-2 text-xs font-medium text-[--ui-text-muted]">主题</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(themePresetMeta).map((preset) => {
                  const active = preset.id === normalizedTheme;
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => onThemeChange(preset.id)}
                      className={cn(
                        "rounded-[4px] border px-3 py-2 text-left text-xs font-medium transition-colors",
                        active
                          ? "border-[--ui-text] bg-[--ui-text] text-white"
                          : "border-[--ui-border] text-[--ui-text] hover:border-[--ui-text]"
                      )}
                    >
                      {preset.label}
                      {active ? <Check className="ml-1 inline h-3 w-3" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font + Density */}
            <div className="rounded-[var(--ui-radius)] border border-[--ui-border] p-3">
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-[--ui-text-muted]">字体</label>
                <div className="relative">
                  <select
                    value={font}
                    onChange={(e) => onFontChange(e.target.value)}
                    className="w-full appearance-none rounded-[4px] border border-[--ui-border] bg-white px-3 py-2 text-xs text-[--ui-text] outline-none focus:border-[--ui-text]"
                    aria-label="选择字体"
                    style={{ fontFamily: font }}
                  >
                    {Object.keys(fonts).map((fontKey) => (
                      <option key={fontKey} value={fontKey}>
                        {fontKey}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[--ui-text-muted]" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[--ui-text-muted]">版式密度</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {densityPresets.map((preset) => {
                    const active = matchedDensity === preset.id;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => onDensityPresetChange(preset.id)}
                        className={cn(
                          "rounded-[4px] border py-2 text-xs font-medium transition-colors",
                          active
                            ? "border-[--ui-text] bg-[--ui-text] text-white"
                            : "border-[--ui-border] text-[--ui-text] hover:border-[--ui-text]"
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="rounded-[var(--ui-radius)] border border-[--ui-border]">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                onClick={() => setAdvancedOpen((current) => !current)}
              >
                <span className="text-xs font-medium text-[--ui-text-muted]">高级设置</span>
                <ChevronDown
                  className={cn("h-3.5 w-3.5 text-[--ui-text-muted] transition", advancedOpen ? "rotate-180" : "")}
                />
              </button>

              {advancedOpen ? (
                <div className="space-y-3 border-t border-[--ui-border] px-3 pb-3 pt-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[--ui-text-muted]">字体与层级</p>
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

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[--ui-text-muted]">版式微调</p>
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

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[--ui-text-muted]">颜色</p>
                    <ColorPicker label="标题颜色" value={headerColor} onChange={setHeaderColor} />
                    <ColorPicker label="正文颜色" value={textColor} onChange={setTextColor} />
                    <ColorPicker label="链接颜色" value={linkColor} onChange={setLinkColor} />
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs font-medium text-[--ui-text-muted]">自定义 CSS</p>
                    <textarea
                      value={customCss}
                      onChange={(e) => onCustomCssChange(e.target.value)}
                      spellCheck={false}
                      placeholder={`.previewContainer h2 {\n  border-bottom: 1px solid var(--headerColor);\n}`}
                      className="min-h-[140px] w-full rounded-[4px] border border-[--ui-border] bg-white px-3 py-2 font-mono text-xs leading-6 text-[--ui-text] outline-none focus:border-[--ui-text]"
                    />
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
    </div>
  );

  if (variant === "inline") {
    return <div className="h-full">{panel}</div>;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 hidden bg-black/20 backdrop-blur-[2px] lg:block min-[1280px]:hidden">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="关闭工具抽屉遮罩"
      />
      <div className="absolute right-4 top-16 h-[calc(100vh-5rem)] w-[260px] max-w-[calc(100vw-2rem)]">
        {panel}
      </div>
    </div>
  );
}
