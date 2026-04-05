"use client";

import type { LlmSettings } from "./llmTypes";

const KEY = "md-resume-ai-llm-settings";

const defaultUseServerRoute =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_SERVER_LLM === "true";

const defaultSettings: LlmSettings = {
  apiKey: "",
  model: "gpt-4o-mini",
  useOpenAiProxy: true,
  baseUrl: "https://api.openai.com",
  useServerRoute: defaultUseServerRoute,
};

export function defaultLlmSettings(): LlmSettings {
  return { ...defaultSettings };
}

export function loadLlmSettings(): LlmSettings {
  if (typeof window === "undefined") return defaultLlmSettings();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultLlmSettings();
    const parsed = JSON.parse(raw) as Partial<LlmSettings>;
    return {
      ...defaultSettings,
      ...parsed,
      useServerRoute:
        parsed.useServerRoute ?? defaultSettings.useServerRoute,
    };
  } catch {
    return defaultLlmSettings();
  }
}

export function saveLlmSettings(s: LlmSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
