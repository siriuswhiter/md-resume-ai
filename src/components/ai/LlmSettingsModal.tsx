"use client";

import type { LlmSettings } from "@/lib/llmTypes";
import { cn } from "@/lib/utils";
import { siteMono, siteSans } from "@/lib/siteFonts";

type Props = {
  settings: LlmSettings;
  onChange: (s: LlmSettings) => void;
  open: boolean;
  onClose: () => void;
};

export function LlmSettingsModal({
  settings,
  onChange,
  open,
  onClose,
}: Props) {
  if (!open) return null;

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[2px]">
      <div
        className={cn(
          siteSans.className,
          "max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[32px] border border-[#dad4c8] bg-white p-6 shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)]"
        )}
        role="dialog"
        aria-labelledby="llm-settings-title"
      >
        <p className={cn(siteMono.className, "text-[11px] uppercase tracking-[0.24em] text-[#55534e]")}>
          AI settings
        </p>
        <h2
          id="llm-settings-title"
          className="mt-2 text-lg font-semibold text-black"
        >
          LLM 配置
        </h2>
        <p className="mt-1 text-sm text-[#55534e]">
          {settings.useServerRoute
            ? "当前使用服务端路由 /api/llm/chat，API Key 仅在部署环境变量（OPENAI_API_KEY），不会写入浏览器。"
            : "API Key 仅保存在本机浏览器（localStorage）。开发环境可通过 Next 代理请求 OpenAI，避免浏览器 CORS。"}
        </p>
        <div className="mt-3 rounded-2xl border border-[#dad4c8] bg-[#3bd3fd] px-4 py-3 text-xs leading-6 text-[#01418d]">
          配置项会即时保存。推荐优先使用服务端 Key，其次才是浏览器本地 Key。
        </div>
        {!settings.useServerRoute && (
          <div className="mt-3 rounded-2xl border border-[#dad4c8] bg-[#f8cc65] px-4 py-3 text-xs leading-6 text-[#9d6a09]">
            浏览器直连模式会直接向上游发送请求；如果未携带 `Authorization` 请求头，上游通常会返回
            `401 Missing Authentication header`。
          </div>
        )}
        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={settings.useServerRoute}
              onChange={(e) =>
                onChange({ ...settings, useServerRoute: e.target.checked })
              }
            />
            <span className="text-sm font-medium text-black">
              使用服务端 Key（/api/llm/chat）
            </span>
          </label>
          {!settings.useServerRoute && (
            <>
              <label className="block">
                <span className="text-sm font-medium text-[#333333]">
                  API Key
                </span>
                <input
                  type="password"
                  autoComplete="off"
                  className="mt-1 w-full rounded-2xl border border-[#dad4c8] bg-[#faf9f7] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#01418d]"
                  value={settings.apiKey}
                  onChange={(e) =>
                    onChange({ ...settings, apiKey: e.target.value })
                  }
                  placeholder="sk-..."
                />
              </label>
            </>
          )}
          <label className="block">
            <span className="text-sm font-medium text-[#333333]">模型</span>
            <input
              type="text"
              className="mt-1 w-full rounded-2xl border border-[#dad4c8] bg-[#faf9f7] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#01418d]"
              value={settings.model}
              onChange={(e) =>
                onChange({ ...settings, model: e.target.value.trim() })
              }
              placeholder="gpt-4o-mini"
            />
          </label>
          {!settings.useServerRoute && (
            <>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.useOpenAiProxy}
                  onChange={(e) =>
                    onChange({ ...settings, useOpenAiProxy: e.target.checked })
                  }
                  disabled={!isDev}
                />
                <span className="text-sm text-[#55534e]">
                  开发环境使用 /openai-proxy（仅 next dev 有效）
                </span>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#333333]">
                  自定义 API 根地址（关闭代理或生产环境）
                </span>
                <input
                  type="url"
                  className="mt-1 w-full rounded-2xl border border-[#dad4c8] bg-[#faf9f7] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#01418d]"
                  value={settings.baseUrl}
                  onChange={(e) =>
                    onChange({ ...settings, baseUrl: e.target.value.trim() })
                  }
                  placeholder="https://api.openai.com"
                />
              </label>
            </>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-full border border-black bg-white px-4 py-2 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-1 hover:-rotate-2 hover:bg-[#84e7a5] hover:shadow-[-7px_7px_0_#000000]"
            onClick={onClose}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
