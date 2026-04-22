# Markdown Resume AI

<p align="center">
  <a href="https://github.com/siriuswhiter/md-resume-ai/actions/workflows/ci.yml">
    <img src="https://github.com/siriuswhiter/md-resume-ai/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://github.com/siriuswhiter/md-resume-ai/actions/workflows/deploy.yml">
    <img src="https://github.com/siriuswhiter/md-resume-ai/actions/workflows/deploy.yml/badge.svg" alt="Deploy">
  </a>
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

<p align="center">
  基于 Markdown 的 AI 简历编辑与导出工具 —— 从零散经历到可投递 PDF，一站完成。
</p>

<p align="center">
  <img src="/public/screenshots/editor-workspace.png" alt="编辑器工作区" width="800">
</p>

---

## 功能亮点

| 功能 | 说明 |
|---|---|
| **Markdown 驱动编辑** | 结构清晰，易于维护、复用与版本管理 |
| **AI 辅助起草** | 将零散经历、项目笔记或 LinkedIn 信息整理为可编辑的 Markdown 草稿 |
| **实时双栏预览** | 编辑区与纸张预览同步展示，降低排版试错成本 |
| **多模板与样式定制** | 支持主题、字体、字号、行距、边距、颜色等配置 |
| **稳定 PDF 导出** | 服务端 Puppeteer 渲染，确保跨平台输出一致性 |
| **灵活 LLM 接入** | 支持服务端 Key 与 BYOK 两种模式，密钥不落浏览器 |

## 适用场景

- 从零快速生成一份可投递的简历
- 将已有经历整理为规范的 Markdown 结构
- 针对不同岗位切换模板与排版风格
- 在本地或自托管环境中部署简历编辑工具

## 技术栈

`Next.js 15` · `React 18` · `TypeScript` · `Tailwind CSS` · `MDXEditor` · `Playwright` · `Puppeteer` · `Docker` · `GitHub Actions`

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

### 3. 启动开发服务

```bash
npm run dev
# 访问 http://localhost:3001/editor
```

---

## 环境变量

完整示例见 [`.env.example`](.env.example)。

| 变量名 | 默认值 | 说明 |
|---|---|---|
| `APP_PORT` | `3000` | Docker 对外暴露端口 |
| `LLM_DEBUG` | `false` | 开启 LLM 调试日志 |
| `NEXT_PUBLIC_USE_SERVER_LLM` | `false` | 前端默认是否走服务端 LLM 路由 |
| `OPENAI_API_BASE` | `https://api.openai.com` | OpenAI API Base URL |
| `OPENAI_API_KEY` | — | 服务端调用 LLM 所需密钥 |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` | PDF 导出使用的 Chromium 路径 |

---

## AI 生成功能

编辑器右侧提供 AI 助手，支持两种接入方式：

**服务端 Key 模式**（推荐用于生产）

- 设置 `OPENAI_API_KEY`（可选 `OPENAI_API_BASE`）
- 前端请求通过 `/api/llm/chat` 转发，密钥不会进入浏览器

**BYOK 模式**（适合本地试用）

- 用户在页面填写自己的 API Key
- 配置仅存储于浏览器本地，不上传至服务端

---

## Docker 部署

```bash
cp .env.example .env
docker compose --env-file .env up --build -d
# 访问 http://localhost:3000
```

**容器说明**

- 已内置 Chromium，用于 PDF 导出
- `NEXT_PUBLIC_USE_SERVER_LLM` 在构建阶段与运行阶段同时注入
- 健康检查端点：`http://127.0.0.1:3000/`

---

## 常用脚本

```bash
npm run dev         # 启动本地开发服务（端口 3001）
npm run build       # 构建生产版本
npm run start       # 启动生产服务
npm run lint        # ESLint 检查
npm run type-check  # TypeScript 类型检查
npm run test        # 运行 Playwright E2E 测试
```

---

## CI/CD

基于 GitHub Actions 实现自动化流程：

- **CI**：在 `main` / `master` 的 push 和 PR 上执行 `lint`、`type-check`、`build`
- **Deploy**：构建并推送 GHCR 镜像，通过 SSH 在目标服务器执行 `docker compose` 部署

### 必需 Secrets

| Secret | 用途 |
|---|---|
| `SERVER_HOST` / `SERVER_PORT` / `SERVER_USER` | SSH 目标服务器信息 |
| `SERVER_APP_DIR` | 服务器部署目录 |
| `SERVER_SSH_KEY` | SSH 私钥 |
| `GHCR_USERNAME` / `GHCR_TOKEN` | GitHub Container Registry 凭据 |
| `OPENAI_API_KEY` | 启用服务端 LLM 时必需 |

### 可选 Variables

`APP_PORT` · `NEXT_PUBLIC_USE_SERVER_LLM` · `OPENAI_API_BASE` · `LLM_DEBUG`

### 目标服务器要求

- 已安装 Docker Engine 与 `docker compose`
- 具备访问 `ghcr.io` 的网络条件
- 部署目录可写，对应 `SERVER_APP_DIR`

---

## 目录结构

```
.
├── .github/workflows/      # CI/CD 配置
├── docs/                   # 项目文档
├── e2e/                    # Playwright E2E 测试
├── public/                 # 静态资源、模板、截图
├── src/app/                # Next.js App Router 页面与 API
├── src/components/         # 页面与编辑器组件
├── src/hooks/              # 自定义 Hooks
├── src/lib/                # 主题、字体、LLM 与工具函数
└── src/styles/             # 全局样式与打印样式
```

---

## 产品截图

| 编辑器工作区 | 模板示例 |
|---|---|
| ![Workspace](/public/screenshots/editor-workspace.png) | ![Template](/public/screenshots/mashhad-resume.png) |

<details>
<summary>更多模板示例</summary>

| Isfahan | Tehran | Shiraz |
|---|---|---|
| ![Isfahan](/public/screenshots/isfahan-resume.png) | ![Tehran](/public/screenshots/tehran-resume.png) | ![Shiraz](/public/screenshots/shiraz-resume.png) |

</details>

---

## 贡献指南

欢迎提交 Issue 与 Pull Request。推荐流程：

1. Fork 仓库并创建功能分支
2. 完成功能开发与必要测试
3. 运行 `npm run lint` 和 `npm run type-check` 确保无报错
4. 提交 PR，说明变更背景与验证方式

---

## License

本项目基于 [MIT License](LICENSE) 开源。

## 联系方式

问题反馈或合作交流：[xuewenjie2017@gmail.com](mailto:xuewenjie2017@gmail.com)
