export type LlmSettings = {
  apiKey: string;
  model: string;
  /** 开发环境走 Next rewrites 代理，避免 CORS（仅客户端直连模式） */
  useOpenAiProxy: boolean;
  /** 直连时的 API 根，如 https://api.openai.com 或兼容接口 */
  baseUrl: string;
  /**
   * 走 `/api/llm/chat`，Key 仅在服务端 `OPENAI_API_KEY`，浏览器不持有 Key。
   * 可由 `NEXT_PUBLIC_USE_SERVER_LLM=true` 默认开启。
   */
  useServerRoute: boolean;
};
