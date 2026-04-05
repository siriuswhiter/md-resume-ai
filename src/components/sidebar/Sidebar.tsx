"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { SidebarButtons } from "@/components/sidebar/SidebarButtons";
import { SidebarAiSection } from "@/components/sidebar/SidebarAiSection";
import { EditorSettingsModal } from "@/components/sidebar/EditorSettingsModal";
import type { LlmSettings } from "@/lib/llmTypes";

interface SidebarProps {
  handleExportPdf: () => void;
  isExporting: boolean;
  onThemeChange: (theme: string) => void;
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
  font: string;
  setFont: (font: string) => void;
  aiRawInput: string;
  onAiRawInputChange: (v: string) => void;
  llmSettings: LlmSettings;
  onLlmSettingsChange: (s: LlmSettings) => void;
  onMarkdownGenerated: (md: string) => void;
}

const Sidebar = ({
  font,
  setFont,
  handleExportPdf,
  isExporting,
  onThemeChange,
  onFontSizeChange,
  onYPaddingChange,
  onXPaddingChange,
  onLineHeightChange,
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
  aiRawInput,
  onAiRawInputChange,
  llmSettings,
  onLlmSettingsChange,
  onMarkdownGenerated,
}: SidebarProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="sidebar hidden md:block flex-col justify-between fixed right-0 top-0 bottom-0 max-w-[320px] w-full bg-white ml-10 border border-gray-200 overflow-auto">
        <div>
          <SidebarButtons
            handleExportPdf={handleExportPdf}
            isExporting={isExporting}
          />
          <div className="border-b border-gray-100 px-4 py-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/60"
              onClick={() => setSettingsOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
              简历样式配置
            </button>
            <p className="mt-2 text-center text-[11px] leading-snug text-gray-400">
              主题、字体、间距与颜色
            </p>
          </div>
          <SidebarAiSection
            rawInput={aiRawInput}
            onRawInputChange={onAiRawInputChange}
            llmSettings={llmSettings}
            onLlmSettingsChange={onLlmSettingsChange}
            onMarkdownGenerated={onMarkdownGenerated}
          />
        </div>
      </div>

      <EditorSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onThemeChange={onThemeChange}
        onFontSizeChange={onFontSizeChange}
        onLineHeightChange={onLineHeightChange}
        onXPaddingChange={onXPaddingChange}
        onYPaddingChange={onYPaddingChange}
        onFontChange={onFontChange}
        fontScale={fontScale}
        lineHeightScale={lineHeightScale}
        headingScale={headingScale}
        onHeadingChange={onHeadingChange}
        xPaddingScale={xPaddingScale}
        yPaddingScale={yPaddingScale}
        selectedTheme={selectedTheme}
        headerColor={headerColor}
        setHeaderColor={setHeaderColor}
        textColor={textColor}
        setTextColor={setTextColor}
        linkColor={linkColor}
        setLinkColor={setLinkColor}
        font={font}
        setFont={setFont}
      />
    </>
  );
};

export default Sidebar;
