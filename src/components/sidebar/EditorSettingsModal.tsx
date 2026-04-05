"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { ThemeSection } from "@/components/sidebar/ThemeSection";
import { FontSection } from "@/components/sidebar/FontSection";
import { LayoutSection } from "@/components/sidebar/LayoutSection";
import ColorSection from "@/components/sidebar/ColorSection";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
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
};

export function EditorSettingsModal({
  open,
  onClose,
  onThemeChange,
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
  font,
  setFont,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-settings-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2
            id="editor-settings-title"
            className="text-lg font-semibold text-gray-900"
          >
            简历样式
          </h2>
          <button
            type="button"
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            onClick={onClose}
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <ThemeSection
            onThemeChange={onThemeChange}
            selectedTheme={selectedTheme}
          />
          <FontSection
            font={font}
            setFontAction={setFont}
            onFontChangeAction={onFontChange}
            onFontSizeChangeAction={onFontSizeChange}
            fontScale={fontScale}
            headingScale={headingScale}
            onHeadingChangeAction={onHeadingChange}
          />
          <LayoutSection
            onLineHeightChangeAction={onLineHeightChange}
            onXPaddingChangeAction={onXPaddingChange}
            onYPaddingChangeAction={onYPaddingChange}
            lineHeightScale={lineHeightScale}
            xPaddingScale={xPaddingScale}
            yPaddingScale={yPaddingScale}
          />
          <ColorSection
            headerColor={headerColor}
            setHeaderColorAction={setHeaderColor}
            linkColor={linkColor}
            setLinkColorAction={setLinkColor}
            textColor={textColor}
            setTextColorAction={setTextColor}
          />
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-4 py-3">
          <Button type="button" className="w-full" onClick={onClose}>
            完成
          </Button>
        </div>
      </div>
    </div>
  );
}
