"use client";

import type { LlmSettings } from "@/lib/llmTypes";
import { cn } from "@/lib/utils";
import { siteSans } from "@/lib/siteFonts";

type Props = {
  settings: LlmSettings;
  onChange: (s: LlmSettings) => void;
  open: boolean;
  onClose: () => void;
};

export function LlmSettingsModal({ settings, onChange, open, onClose }: Props) {
  if (!open) return null;

  const isDev = process.env.NODE_ENV === "development";

  const inputCls =
    "mt-1 w-full rounded-[4px] border border-[--ui-border] bg-white px-3 py-2 text-xs text-[--ui-text] outline-none focus:border-[--ui-text] placeholder:text-[--ui-text-muted]";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={cn(
          siteSans.className,
          "max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--ui-radius)] border border-[--ui-border] bg-white p-5 shadow-lg"
        )}
        role="dialog"
        aria-labelledby="llm-settings-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="llm-settings-title" className="text-sm font-semibold text-[--ui-text]">
            AI 设置
          </h2>
          <button
            type="button"
            className="rounded-[4px] border border-[--ui-border] px-3 py-1.5 text-xs font-medium text-[--ui-text] transition-colors hover:border-[--ui-text]"
            onClick={onClose}
          >
            完成
          </button>
        </div>

        <p className="mb-3 text-xs leading-5 text-[--ui-text-muted]">
          {settings.useServerRoute
            ? "当前使用服务端路由 /api/llm/chat，API Key 仅在部署环境变量（OPENAI_API_KEY），不会写入浏览器。"
            : "API Key 仅保存在本机浏览器（localStorage）。开发环境可通过 Next 代理请求 OpenAI，避免浏览器 CORS。"}
        </p>

        <div className="mb-3 rounded-[4px] border border-[--ui-border] bg-[--ui-bg-subtle] px-3 py-2 text-xs leading-5 text-[--ui-text-muted]">
          配置项会即时保存。推荐优先使用服务端 Key，其次才是浏览器本地 Key。
        </div>

        {!settings.useServerRoute && (
          <div className="mb-3 rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
            浏览器直连模式会直接向上游发送请求；如果未携带 Authorization 请求头，上游通常会返回 401。
          </div>
        )}

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={settings.useServerRoute}
              onChange={(e) => onChange({ ...settings, useServerRoute: e.target.checked })}
            />
            <span className="text-xs font-medium text-[--ui-text]">
              使用服务端 Key（/api/llm/chat）
            </span>
          </label>

          {!settings.useServerRoute && (
            <label className="block">
              <span className="text-xs font-medium text-[--ui-text]">API Key</span>
              <input
                type="password"
                autoComplete="off"
                className={inputCls}
                value={settings.apiKey}
                onChange={(e) => onChange({ ...settings, apiKey: e.target.value })}
                placeholder="sk-..."
              />
            </label>
          )}

          <label className="block">
            <span className="text-xs font-medium text-[--ui-text]">模型</span>
            <input
              type="text"
              className={inputCls}
              value={settings.model}
              onChange={(e) => onChange({ ...settings, model: e.target.value.trim() })}
              placeholder="gpt-4o-mini"
            />
          </label>

          {!settings.useServerRoute && (
            <>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.useOpenAiProxy}
                  onChange={(e) => onChange({ ...settings, useOpenAiProxy: e.target.checked })}
                  disabled={!isDev}
                />
                <span className="text-xs text-[--ui-text-muted]">
                  开发环境使用 /openai-proxy（仅 next dev 有效）
                </span>
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[--ui-text]">
                  自定义 API 根地址（关闭代理或生产环境）
                </span>
                <input
                  type="url"
                  className={inputCls}
                  value={settings.baseUrl}
                  onChange={(e) => onChange({ ...settings, baseUrl: e.target.value.trim() })}
                  placeholder="https://api.openai.com"
                />
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
