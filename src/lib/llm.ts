import type { LlmSettings } from "./llmTypes";
import type { GeneratedStyleTemplate } from "./styleAssistantTypes";

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

function extractErrorMessage(text: string): string {
  try {
    const parsed = JSON.parse(text) as {
      error?: { message?: string };
      message?: string;
    };
    return parsed.error?.message || parsed.message || text;
  } catch {
    return text;
  }
}

function buildAuthErrorMessage(settings: LlmSettings, detail: string): string {
  if (settings.useServerRoute) {
    return `API 401: ${detail}。当前为服务端 Key 模式，请检查服务端环境变量 OPENAI_API_KEY 是否存在且有效。`;
  }
  return `API 401: ${detail}。当前为浏览器直连模式，请在“配置 AI”中填写有效 API Key，或切换到服务端 Key（/api/llm/chat）。`;
}

const MARKDOWN_RESUME_SYSTEM = `你是资深猎头、招聘经理与简历顾问。用户会粘贴**任意格式**的原始文本（中文为主），其中可能包含口语化表述、流水账、顺序混乱、重复信息、无关细节。

你的任务：**不要机械照抄原文，也不要完全按照原始输入顺序组织内容。你需要先提炼重点，再重写成一份更专业、更适合投递的 Markdown 简历。**

【核心写作原则】
- 先判断候选人的求职方向、经验主线、能力重点，再组织简历结构。
- 优先保留能够体现岗位匹配度、业务价值、技术深度、协作影响力的内容。
- 删除或弱化无关、重复、琐碎、口语化的信息。
- 语言与用户主要输入语言一致，默认输出专业中文简历。
- 可适度润色，使表达更像成熟候选人，而不是信息搬运。
- 信息缺失可写「待补充」，但**不要编造**具体数字、公司名、项目结果或时间。

【项目/经历改写要求】
- 对“工作经历”和“项目经历”中的要点，优先按 **STAR** 思路重写：
  - S/T：交代场景、目标、约束或业务问题
  - A：说明你做了什么，突出关键动作、方案、技术和职责
  - R：尽量落到结果、影响、效率、质量、稳定性、成本、协作成果
- 输出时不要显式写“S/T/A/R”标签，而是写成自然、专业的简历 bullet。
- bullet 应以成果导向为主，避免“负责了”“参与了”这类空泛表述；尽量改为“主导 / 设计 / 搭建 / 优化 / 推动 / 交付 / 落地”等更有力度的表达。
- 若用户提供了结果数据就保留；若没有明确数据，可写定性结果，如“提升可维护性”“缩短交付周期”“改善用户体验”，但不要伪造精确数字。

【版式要求】
- 使用标准 GitHub Flavored Markdown：标题用 # / ## / ###，列表用 - 或 1.，强调用 **bold** 与 *italic*。
- 不要输出 HTML；不要输出 \`\`\` 代码围栏包裹全文；不要输出解释文字。
- 简历结构清晰，优先生成适合单页或双页简历的紧凑表达。

【输出格式】
只输出一个 JSON 对象，且**仅**包含字段 body_markdown（字符串）。
body_markdown 为完整 Markdown 正文，建议结构：
1) # 姓名
2) 一行联系方式（手机 · 邮箱 · 城市）
3) 可选：求职意向 / 个人摘要
4) ## 工作经历
5) ## 项目经历
6) ## 教育经历
7) ## 技能
8) 按需补充：## 证书 / ## 获奖 / ## 自我评价

【重要】
- 允许你重组章节顺序，以突出最有竞争力的信息。
- body_markdown 中若含双引号，需保证 JSON 合法。`;

const MD_USER_INSTRUCTION = `请从用户粘贴的原始材料中提炼重点，重组结构，并把项目/经历按更专业、结果导向、符合 STAR 思路的简历语言重写。输出 JSON（仅字段 body_markdown）：`;

const STYLE_ASSISTANT_SYSTEM = `你是资深前端样式工程师，负责为 Markdown 简历预览生成可直接使用的 CSS。

【上下文】
- 页面内容渲染在 .previewContainer 内。
- 常见元素包括：h1, h2, h3, p, ul, ol, li, a, strong, em, hr。
- 允许使用 CSS 变量：var(--headerColor), var(--textColor), var(--linkColor), var(--fontScale), var(--headingScale), var(--lineHeightScale), var(--xPaddingScale), var(--yPaddingScale)。

【输出要求】
- 只输出一个 JSON 对象，仅包含字段：name, css, summary。
- css 必须是可直接粘贴的纯 CSS，不要包含 \`\`\` 代码围栏，不要带解释。
- 所有选择器必须限定在 .previewContainer 下，避免污染页面其他区域。
- 不要使用 @import，不要依赖外部资源，不要编造不存在的类名。
- 以可维护、克制、适合简历打印与 PDF 导出为优先。
- 若用户要求与当前 CSS 合并，请在此基础上增量修改，而不是完全推翻。
`;

const STYLE_USER_INSTRUCTION = `请根据用户要求输出一个样式模板 JSON（字段仅 name, css, summary）。`;

/**
 * 从用户原始文本生成 Markdown 简历正文，供 MD 编辑器使用。
 */
export async function generateMarkdownResumeBody(
  settings: LlmSettings,
  rawText: string
): Promise<string> {
  if (!settings.useServerRoute && !settings.apiKey.trim()) {
    throw new Error("当前为浏览器直连模式，但未配置 API Key。请在“配置 AI”中填写密钥，或启用服务端 Key。");
  }

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
    const detail = extractErrorMessage(responseText).slice(0, 500);
    if (
      res.status === 401 &&
      /missing authentication header|authorization/i.test(detail)
    ) {
      throw new Error(buildAuthErrorMessage(settings, detail));
    }
    throw new Error(`API ${res.status}: ${detail}`);
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

export async function generatePreviewCssTemplate(
  settings: LlmSettings,
  input: {
    request: string;
    theme: string;
    currentCss?: string;
  }
): Promise<GeneratedStyleTemplate> {
  if (!settings.useServerRoute && !settings.apiKey.trim()) {
    throw new Error("当前为浏览器直连模式，但未配置 API Key。请先在页面右上角完成 AI 配置。");
  }

  const url = resolveChatUrl(settings);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (!settings.useServerRoute && settings.apiKey.trim()) {
    headers.Authorization = `Bearer ${settings.apiKey}`;
  }

  const body = {
    model: settings.model,
    temperature: 0.3,
    messages: [
      { role: "system" as const, content: STYLE_ASSISTANT_SYSTEM },
      {
        role: "user" as const,
        content: `${STYLE_USER_INSTRUCTION}

当前主题：${input.theme}

当前已有 CSS：
-----
${input.currentCss?.trim() || "(空)"}
-----

用户需求：
-----
${input.request.trim()}
-----`,
      },
    ],
  };

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
        `API ${res.status}：返回了 HTML 页面而非 JSON。请确认请求路径为 /api/llm/chat/（带尾部斜杠），并检查服务端配置。`
      );
    }
    const detail = extractErrorMessage(responseText).slice(0, 500);
    if (
      res.status === 401 &&
      /missing authentication header|authorization/i.test(detail)
    ) {
      throw new Error(buildAuthErrorMessage(settings, detail));
    }
    throw new Error(`API ${res.status}: ${detail}`);
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
    throw new Error(`无法解析接口 JSON：${responseText.slice(0, 280)}`);
  }

  const content = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) throw new Error("模型返回为空");

  let parsed: Partial<GeneratedStyleTemplate>;
  try {
    parsed = JSON.parse(extractJsonObject(content)) as Partial<GeneratedStyleTemplate>;
  } catch {
    throw new Error("无法解析样式助手返回的 JSON，请重试或缩短要求");
  }

  const css = typeof parsed.css === "string" ? parsed.css.trim() : "";
  const name = typeof parsed.name === "string" ? parsed.name.trim() : "";
  const summary =
    typeof parsed.summary === "string" ? parsed.summary.trim() : "";

  if (!css) throw new Error("样式助手未返回有效 CSS");
  if (!css.includes(".previewContainer")) {
    throw new Error("样式助手返回的 CSS 未限定在 .previewContainer 下，已拒绝应用");
  }

  return {
    name: name || "未命名模板",
    css,
    summary,
  };
}
