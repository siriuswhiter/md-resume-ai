import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 512 * 1024;

/**
 * 与 `OPENAI_API_BASE` 拼接为 `${base}/v1/chat/completions`。
 * OpenRouter 的 HTTP API 根为 `https://openrouter.ai/api`；若只配站点根 `https://openrouter.ai`，
 * 会变成 `.../v1/chat/completions` 命中官网 SPA，返回 HTML。
 */
function normalizeOpenAiCompatibleBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  try {
    const u = new URL(trimmed);
    const hostOk =
      u.hostname === "openrouter.ai" || u.hostname === "www.openrouter.ai";
    const path = u.pathname.replace(/\/+$/, "") || "/";
    if (hostOk && path === "/") {
      console.warn(
        "[api/llm/chat] OPENAI_API_BASE 使用了 openrouter.ai 站点根，已自动改为 https://openrouter.ai/api（否则会得到官网 HTML）"
      );
      return "https://openrouter.ai/api";
    }
  } catch {
    /* keep trimmed */
  }
  return trimmed;
}

function isValidMessages(
  messages: unknown
): messages is { role: string; content: string }[] {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  if (messages.length > 50) return false;
  for (const m of messages) {
    if (!m || typeof m !== "object") return false;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if (role !== "system" && role !== "user" && role !== "assistant") {
      return false;
    }
    if (typeof content !== "string" || content.length > 200_000) return false;
  }
  return true;
}

/**
 * 服务端代发 OpenAI 兼容 Chat Completions，Key 仅来自环境变量，不暴露给浏览器。
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: { message: "OPENAI_API_KEY is not set on the server" } },
      { status: 503 }
    );
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: { message: "Request body too large" } },
      { status: 413 }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: { message: "Invalid body" } },
      { status: 400 }
    );
  }

  const b = body as Record<string, unknown>;
  const model = b.model;
  const temperature = b.temperature;
  const messages = b.messages;

  if (typeof model !== "string" || !model.trim()) {
    return NextResponse.json(
      { error: { message: "model is required" } },
      { status: 400 }
    );
  }
  if (temperature !== undefined && typeof temperature !== "number") {
    return NextResponse.json(
      { error: { message: "temperature must be a number" } },
      { status: 400 }
    );
  }
  if (!isValidMessages(messages)) {
    return NextResponse.json(
      { error: { message: "messages must be a non-empty valid array" } },
      { status: 400 }
    );
  }

  const base = normalizeOpenAiCompatibleBase(
    process.env.OPENAI_API_BASE ?? "https://api.openai.com"
  );

  const upstreamUrl = `${base}/v1/chat/completions`;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.trim(),
        ...(typeof temperature === "number" ? { temperature } : {}),
        messages,
      }),
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    const nested =
      err.cause instanceof Error ? ` — ${err.cause.message}` : "";
    const detail = `${err.message}${nested}`;
    const hint =
      /ENOTFOUND|fetch failed/i.test(detail) && /openrouter/i.test(base)
        ? "OpenRouter 基址请使用 https://openrouter.ai/api（不要写 api.openrouter.ai）。"
        : /ENOTFOUND|fetch failed/i.test(detail)
          ? "无法解析上游域名，请检查 OPENAI_API_BASE 与网络/DNS。"
          : undefined;
    return NextResponse.json(
      {
        error: {
          message: `Upstream fetch failed: ${detail}`,
          ...(hint ? { hint } : {}),
        },
      },
      { status: 502 }
    );
  }

  const text = await upstream.text();
  const trimmed = text.trimStart();
  const contentType = upstream.headers.get("Content-Type") ?? "";

  /** 上游把 HTML（错误页/登录页/Cloudflare 等）当正文返回，避免原样转发给前端导致 JSON 解析失败 */
  if (trimmed.startsWith("<")) {
    const debugPayload = {
      upstreamUrl,
      status: upstream.status,
      contentType,
      bodyPreview: text.slice(0, 600),
      bodyLength: text.length,
    };
    console.error(
      "[api/llm/chat] upstream returned HTML instead of JSON",
      debugPayload
    );
    if (process.env.LLM_DEBUG === "true") {
      console.error("[api/llm/chat] LLM_DEBUG upstream raw (truncated)", text.slice(0, 4000));
    }
    return NextResponse.json(
      {
        error: {
          message:
            "上游返回了 HTML 而非 JSON（常见于路径/网关错误、404、鉴权页或代理错误页）。请检查 OPENAI_API_BASE、Key 与模型 id。",
          hint:
            "OpenRouter 基址应为 https://openrouter.ai/api；浏览器侧请请求 /api/llm/chat/（带尾部斜杠）。",
        },
      },
      { status: 502 }
    );
  }

  if (process.env.LLM_DEBUG === "true") {
    console.log("[api/llm/chat] LLM_DEBUG upstream ok", {
      upstreamUrl,
      status: upstream.status,
      contentType,
      bytes: text.length,
    });
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": contentType || "application/json",
    },
  });
}
