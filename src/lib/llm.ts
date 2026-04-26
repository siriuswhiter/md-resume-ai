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

type CssValidationIssue = {
  selector: string;
  property: string;
  message: string;
};

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function isRootPreviewSelector(selector: string): boolean {
  const normalized = selector.trim();
  return normalized === ".previewContainer" || /^\.previewContainer(?:\.|:|\[)/.test(normalized);
}

function validateGeneratedPreviewCss(css: string): CssValidationIssue | null {
  const sanitizedCss = stripCssComments(css);

  if (/@(?:import|font-face)\b/i.test(sanitizedCss)) {
    return {
      selector: "@rule",
      property: "@import",
      message: "不要引入外部字体或额外资源。",
    };
  }

  const blockRegex = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of sanitizedCss.matchAll(blockRegex)) {
    const selectorText = match[1]?.trim() ?? "";
    const declarationText = match[2] ?? "";
    if (!selectorText || selectorText.startsWith("@")) continue;

    const selectors = selectorText.split(",").map((selector) => selector.trim());
    if (selectors.some((selector) => !selector.includes(".previewContainer"))) {
      return {
        selector: selectorText,
        property: "selector",
        message: "所有选择器都必须限定在 .previewContainer 下。",
      };
    }

    const declarationRegex = /([a-z-]+)\s*:\s*([^;]+);?/gi;
    for (const declaration of declarationText.matchAll(declarationRegex)) {
      const property = declaration[1]?.trim().toLowerCase() ?? "";
      const value = declaration[2]?.trim() ?? "";
      if (!property) continue;

      if (property === "font-family") {
        return {
          selector: selectorText,
          property,
          message: "不要覆盖字体，字体由右侧样式控制统一管理。",
        };
      }

      if (
        property === "font-size" &&
        !value.includes("var(--fontScale)") &&
        !value.includes("var(--headingScale)")
      ) {
        return {
          selector: selectorText,
          property,
          message: "字号必须跟随 var(--fontScale) 或 var(--headingScale)。",
        };
      }

      if (property === "line-height" && !value.includes("var(--lineHeightScale)")) {
        return {
          selector: selectorText,
          property,
          message: "行高必须跟随 var(--lineHeightScale)。",
        };
      }

      if (
        selectors.some((selector) => isRootPreviewSelector(selector)) &&
        [
          "padding",
          "padding-left",
          "padding-right",
          "padding-top",
          "padding-bottom",
          "font-size",
          "line-height",
        ].includes(property)
      ) {
        return {
          selector: selectorText,
          property,
          message: "不要覆盖预览容器的页边距、字号或行高，这些由右侧样式控制统一管理。",
        };
      }
    }
  }

  return null;
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
- 默认**不要生成“个人摘要”“求职意向”“自我评价”**这类概述性段落；只有当用户原始材料中明确提供了相关内容，且保留它明显有助于表达时，才可酌情保留。
- 模块必须按用户输入内容**按需生成**，不要为了凑完整简历而强行补齐所有常见章节。
- 如果用户没有提供某类内容，就不要生成对应空章节或泛化章节标题。

【章节组织原则】
- 优先从用户原始材料中识别真实存在的内容类型，再决定生成哪些模块。
- 常见模块可包括：教育经历、工作经历、实习经历、科研经历、项目经历、技能、证书、获奖、校园经历等。
- 只生成与用户输入匹配的模块；不要求所有模块都出现。
- 可以为提升表达效果做适度重组，但不要脱离用户输入内容凭空新增模块。
- 若用户输入本身已经有较明确的模块边界，优先沿用这些边界，再做必要润色与压缩。

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
- 正文默认使用 Markdown，不要把整份简历写成 HTML。
- 仅当头部联系方式较多、且左右分布能明显提升可读性时，允许在文档最开头使用**受限 HTML**实现头部布局；除头部外，其余内容仍优先使用 Markdown。
- 受限 HTML 仅允许这些标签：div、section、header、span、p、br、a、strong、em、h1、h2、h3、ul、ol、li、hr。
- 受限 HTML 仅允许这些 class：resume-header、resume-header-main、resume-header-side、resume-inline、resume-stack、resume-meta、resume-tag-list、resume-tag。
- 不要输出任何内联 style、script、事件属性，或上述白名单之外的标签、属性、class。
- 若使用受限 HTML 头部，可参考这个最小示例：
  <div class="resume-header">
    <div class="resume-header-main"><h1>张三</h1><p>算法工程师</p></div>
    <div class="resume-header-side resume-stack"><p>138xxxxxx</p><p>zhangsan@email.com</p><p>北京</p></div>
  </div>
- 若用户材料不需要特殊头部布局，直接输出纯 Markdown 即可。
- 不要输出 \`\`\` 代码围栏包裹全文；不要输出解释文字。
- 简历结构清晰，优先生成适合单页或双页简历的紧凑表达。

【输出格式】
只输出一个 JSON 对象，且**仅**包含字段 body_markdown（字符串）。
body_markdown 为完整 Markdown 正文，可按用户输入按需组织，例如：
1) # 姓名
2) 一行联系方式（手机 · 邮箱 · 城市）
3) 按需补充：## 教育经历 / ## 工作经历 / ## 实习经历 / ## 科研经历 / ## 项目经历
4) 按需补充：## 技能 / ## 证书 / ## 获奖 / ## 校园经历 / ## 其他与输入内容直接相关的章节
若确实需要更清晰的头部对齐，也可在最开头改为受限 HTML 头部，后续章节继续用 Markdown。

【重要】
- 允许你重组章节顺序，以突出最有竞争力的信息。
- 不要默认生成“个人摘要”或类似概述段落。
- 不要生成与用户输入无关的章节，也不要输出空章节。
- 不要滥用 HTML；只有头部信息排布明显受益时才使用受限 HTML。
- body_markdown 中若含双引号，需保证 JSON 合法。`;

const MD_USER_INSTRUCTION = `请从用户粘贴的原始材料中提炼重点，按内容类型按需组织简历模块，并把项目/经历按更专业、结果导向、符合 STAR 思路的简历语言重写。不要默认生成个人摘要或为凑结构补齐无关章节。正文默认用 Markdown；只有头部确实需要左右布局时，才有限使用受限 HTML。输出 JSON（仅字段 body_markdown）：`;

const JOB_ADAPTATION_SYSTEM = `${MARKDOWN_RESUME_SYSTEM}

【岗位适配追加要求】
- 用户会提供一份现有简历底稿，以及一个目标岗位/岗位 JD。
- 你需要在不编造经历的前提下，重排、取舍、改写简历，使其更贴合目标岗位。
- 优先突出与目标岗位职责、技能栈、业务场景、成果指标相关的经历。
- 可调整标题、技能分组、项目顺序、bullet 表达和关键词密度。
- 如果底稿中已经使用受限 HTML 简历布局（例如 resume-header、resume-header-main、resume-header-side、resume-inline、resume-stack、resume-meta、resume-tag-list、resume-tag），必须尽量保留原有标签层级与 class，只改写其中的文本内容；不要把这些布局结构退化成普通 Markdown。
- 如果底稿中存在形如“项目名 · 角色 · 时间”的三段式行，适配后仍应保持三段结构与分隔符，方便预览和 PDF 渲染为左右对齐的元信息行。
- 只允许使用系统已声明的受限 HTML 标签和 class，不要新增 style、table、img、script 或未知 class。
- 如果底稿缺少岗位要求中的关键信息，只能用「待补充」提示，不要虚构。
- 保持适合投递的紧凑 Markdown 简历，不要输出分析过程、匹配说明或修改清单。`;

const JOB_ADAPTATION_USER_INSTRUCTION = `请基于现有简历底稿生成一版目标岗位适配简历。只输出 JSON（仅字段 body_markdown）。`;

const STYLE_ASSISTANT_SYSTEM = `你是资深前端样式工程师，负责为 Markdown 简历预览生成可直接使用的 CSS。

【上下文】
- 页面内容渲染在 .previewContainer 内。
- 常见元素包括：h1, h2, h3, p, ul, ol, li, a, strong, em, hr。
- 允许使用 CSS 变量：var(--headerColor), var(--textColor), var(--linkColor), var(--fontScale), var(--headingScale), var(--lineHeightScale), var(--xPaddingScale), var(--yPaddingScale)。
- 用户会在编辑器右侧继续调整字体、字号、行距、标题倍率与页边距，这些控件必须保持有效。

【输出要求】
- 只输出一个 JSON 对象，仅包含字段：name, css, summary。
- css 必须是可直接粘贴的纯 CSS，不要包含 \`\`\` 代码围栏，不要带解释。
- 所有选择器必须限定在 .previewContainer 下，避免污染页面其他区域。
- 不要使用 @import，不要依赖外部资源，不要编造不存在的类名。
- 不要输出任何 font-family 声明；字体始终由右侧样式控制决定。
- 不要覆盖 .previewContainer 的 padding、font-size、line-height，避免破坏用户的字体与页边距设置。
- 若需要调整字号、标题层级或行高，必须显式使用 var(--fontScale)、var(--headingScale)、var(--lineHeightScale) 参与计算，而不是写死固定值。
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

export async function adaptMarkdownResumeForJob(
  settings: LlmSettings,
  input: {
    baseMarkdown: string;
    jobTarget: string;
    rawText?: string;
  }
): Promise<string> {
  if (!settings.useServerRoute && !settings.apiKey.trim()) {
    throw new Error("当前为浏览器直连模式，但未配置 API Key。请在“配置 AI”中填写密钥，或启用服务端 Key。");
  }

  const baseMarkdown = input.baseMarkdown.trim();
  const jobTarget = input.jobTarget.trim();
  if (!baseMarkdown) throw new Error("请先在编辑区准备一份简历底稿。");
  if (!jobTarget) throw new Error("请先填写目标岗位或岗位 JD。");

  const url = resolveChatUrl(settings);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (!settings.useServerRoute && settings.apiKey.trim()) {
    headers.Authorization = `Bearer ${settings.apiKey}`;
  }

  const body = {
    model: settings.model,
    temperature: 0.28,
    messages: [
      { role: "system" as const, content: JOB_ADAPTATION_SYSTEM },
      {
        role: "user" as const,
        content: `${JOB_ADAPTATION_USER_INSTRUCTION}

目标岗位 / JD：
-----
${jobTarget}
-----

现有简历底稿：
-----
${baseMarkdown}
-----

${input.rawText?.trim() ? `原始材料补充（仅用于校验事实，不要编造）：\n-----\n${input.rawText.trim()}\n-----\n` : ""}
请输出一份完整、可直接替换编辑区内容的 Markdown 简历。`,
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

  let parsed: { body_markdown?: string };
  try {
    parsed = JSON.parse(extractJsonObject(content)) as {
      body_markdown?: string;
    };
  } catch {
    throw new Error("无法解析岗位适配返回的 JSON，请重试或缩短 JD");
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
    font: string;
    fontScale: number;
    headingScale: number;
    lineHeightScale: number;
    xPaddingScale: number;
    yPaddingScale: number;
    headerColor: string;
    textColor: string;
    linkColor: string;
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

当前编辑器控制项：
- 字体：${input.font}
- 正文字号倍率：${input.fontScale}
- 标题倍率：${input.headingScale}
- 行距倍率：${input.lineHeightScale}
- 左右边距：${input.xPaddingScale}px
- 上下边距：${input.yPaddingScale}px
- 标题颜色：${input.headerColor}
- 正文颜色：${input.textColor}
- 链接颜色：${input.linkColor}

当前已有 CSS：
-----
${input.currentCss?.trim() || "(空)"}
-----

用户需求：
-----
${input.request.trim()}
-----

请确保用户后续继续调整上述控制项时，生成的 CSS 仍会跟随变化。`,
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
  const validationIssue = validateGeneratedPreviewCss(css);
  if (validationIssue) {
    throw new Error(
      `样式助手返回的 CSS 已拒绝应用：${validationIssue.message}（${validationIssue.selector} -> ${validationIssue.property}）`
    );
  }

  return {
    name: name || "未命名模板",
    css,
    summary,
  };
}
