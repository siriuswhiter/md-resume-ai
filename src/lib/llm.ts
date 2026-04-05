import type { LlmSettings } from "./llmTypes";

function resolveChatUrl(settings: LlmSettings): string {
  if (settings.useServerRoute) {
    /** 与 `next.config` 中 `trailingSlash: true` 一致，避免重定向导致 POST 异常或非 JSON */
    return "/api/llm/chat/";
  }
  const isDev = process.env.NODE_ENV === "development";
  if (isDev && settings.useOpenAiProxy) {
    return "/openai-proxy/v1/chat/completions";
  }
  const base = settings.baseUrl.replace(/\/$/, "");
  return `${base}/v1/chat/completions`;
}

function extractJsonObject(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

const MARKDOWN_RESUME_SYSTEM = `你是资深猎头与简历顾问。用户会粘贴**任意格式**的原始文本（中文为主）。

你的任务：**解析并整理成一份可直接用于求职的 Markdown 简历**（结构清晰、措辞专业、要点化）。

【版式要求】
- 语言与用户主要输入语言一致。
- 信息缺失可写「待补充」，不要编造具体数字/公司名。
- 使用标准 GitHub Flavored Markdown：标题用 # / ## / ###，列表用 - 或 1.，强调用 **bold** 与 *italic*。
- 不要输出 HTML；不要输出 \`\`\` 代码围栏包裹全文；不要输出 json。

【输出格式】
只输出一个 JSON 对象，且**仅**包含字段 body_markdown（字符串）。
body_markdown 为完整 Markdown 正文，建议结构：
1) # 姓名
2) 一行联系方式（手机 · 邮箱 · 城市）
3) 可选：求职意向行
4) ## 教育经历
5) ## 工作经历（每段含小标题行 + 要点列表）
6) 按需：## 项目经历 / ## 技能 / ## 自我评价 等

【重要】body_markdown 中若含双引号，需保证 JSON 合法。`;

const MD_USER_INSTRUCTION = `请解析用户粘贴的内容，输出 JSON（仅字段 body_markdown）：`;

/**
 * 从用户原始文本生成 Markdown 简历正文，供 MD 编辑器使用。
 */
export async function generateMarkdownResumeBody(
  settings: LlmSettings,
  rawText: string
): Promise<string> {
  const url = resolveChatUrl(settings);
  const body = {
    model: settings.model,
    temperature: 0.35,
    messages: [
      { role: "system" as const, content: MARKDOWN_RESUME_SYSTEM },
      {
        role: "user" as const,
        content: `${MD_USER_INSTRUCTION}\n\n-----\n${rawText}\n-----`,
      },
    ],
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (!settings.useServerRoute && settings.apiKey.trim()) {
    headers.Authorization = `Bearer ${settings.apiKey}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const responseText = await res.text();
  const trimmed = responseText.trimStart();

  if (!res.ok) {
    if (trimmed.startsWith("<")) {
      throw new Error(
        `API ${res.status}：返回了 HTML 页面而非 JSON。请确认请求路径为 /api/llm/chat/（带尾部斜杠，与 Next trailingSlash 一致），并检查服务端路由是否正常。`
      );
    }
    throw new Error(`API ${res.status}: ${responseText.slice(0, 500)}`);
  }

  if (trimmed.startsWith("<")) {
    throw new Error(
      "接口返回了 HTML 而非 JSON（常见于路径缺少尾部斜杠、404 或代理错误页）。请使用路径 /api/llm/chat/ 后重试。"
    );
  }

  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = JSON.parse(responseText) as {
      choices?: { message?: { content?: string } }[];
    };
  } catch {
    throw new Error(
      `无法解析接口 JSON：${responseText.slice(0, 280)}`
    );
  }
  const content = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) throw new Error("模型返回为空");

  let parsed: { body_markdown?: string };
  try {
    parsed = JSON.parse(extractJsonObject(content)) as {
      body_markdown?: string;
    };
  } catch {
    throw new Error("无法解析模型返回的 JSON，请重试或缩短输入");
  }

  const md =
    typeof parsed.body_markdown === "string"
      ? parsed.body_markdown.trim()
      : "";
  if (!md) throw new Error("模型未返回有效的 body_markdown");

  return md;
}
