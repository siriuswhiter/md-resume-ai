# Markdown Resume AI

![Editor Workspace](/public/screenshots/editor-workspace.png)

Markdown Resume AI 是一个基于 Markdown 的在线简历编辑与导出工具，面向希望快速产出专业简历的求职者、开发者和独立创作者。

项目提供从内容起草到版式导出的完整工作流：用户可以编写或粘贴原始经历，借助 AI 生成结构化 Markdown，在实时预览中调整模板与样式，并最终导出可直接投递的 PDF 简历。

## 核心能力

- Markdown 驱动的简历编辑：内容结构清晰，易于维护、复用与版本管理。
- AI 辅助生成：将零散经历、项目笔记或 LinkedIn 信息整理为可编辑的 Markdown 简历草稿。
- 实时双栏预览：编辑区与纸张预览同时展示，降低排版试错成本。
- 多模板与样式定制：支持主题、字体、字号、行距、边距、颜色等配置。
- PDF 导出：通过服务端渲染导出稳定的 PDF 文件，便于投递与归档。
- 服务端 LLM 接入：支持通过服务端环境变量配置 OpenAI Key，避免在浏览器暴露凭据。

## 适用场景

- 从零开始快速生成一份可投递的简历
- 将已有中文或英文经历整理为更规范的 Markdown 结构
- 为不同岗位切换不同模板与排版风格
- 在本地或自托管环境中部署简历编辑工具

## 技术栈

- `Next.js 15`
- `React 18`
- `TypeScript`
- `Tailwind CSS`
- `MDXEditor`
- `Playwright`
- `Puppeteer`
- `Docker / Docker Compose`
- `GitHub Actions`

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

### 3. 启动开发环境

```bash
npm run dev
```

默认开发地址：`http://localhost:3001/editor`

## 环境变量

项目根目录提供了 [`.env.example`](/root/md-resume-ai/.env.example) 作为示例配置。

| 变量名 | 默认值 | 说明 |
| --- | --- | --- |
| `APP_PORT` | `3000` | Docker 运行时对外暴露端口 |
| `LLM_DEBUG` | `false` | 是否开启 LLM 调试日志 |
| `NEXT_PUBLIC_USE_SERVER_LLM` | `false` | 前端默认是否走服务端 LLM 路由 |
| `OPENAI_API_BASE` | `https://api.openai.com` | OpenAI API Base URL |
| `OPENAI_API_KEY` | 空 | 服务端调用 LLM 所需密钥 |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` | PDF 导出所使用的 Chromium 路径 |

## AI 生成功能说明

编辑器右侧提供 AI 助手，可将原始经历整理成 Markdown 简历草稿。支持两种接入方式：

1. 服务端 Key 模式，推荐用于生产环境。
   - 在服务端设置 `OPENAI_API_KEY`
   - 可选设置 `OPENAI_API_BASE`
   - 前端请求通过 `/api/llm/chat` 转发，密钥不会进入浏览器

2. BYOK 模式，适合本地试用。
   - 用户在页面中填写自己的 API Key
   - 配置仅保存在浏览器本地存储中

## Docker 部署

项目内置生产镜像构建能力和单服务 `docker-compose.yml`。

### 本地构建并启动

```bash
cp .env.example .env
docker compose --env-file .env up --build -d
```

默认访问地址：`http://localhost:3000`

### 容器说明

- 容器内已安装 Chromium，用于 PDF 导出。
- `NEXT_PUBLIC_USE_SERVER_LLM` 会在构建阶段和运行阶段同时注入。
- 服务健康检查通过 `http://127.0.0.1:3000/` 完成。

## 常用脚本

```bash
npm run dev         # 启动本地开发服务（3001）
npm run build       # 构建生产版本
npm run start       # 启动生产服务
npm run lint        # 运行 ESLint
npm run type-check  # TypeScript 类型检查
npm run test        # 运行 Playwright E2E 测试
```

## CI/CD

项目已配置 GitHub Actions：

- `CI`：在 `main` / `master` 的 push 和 pull request 上执行 `lint`、`type-check` 与 `build`
- `Deploy`：构建并推送 GHCR 镜像，然后通过 SSH 在目标服务器执行 `docker compose` 部署

### 部署所需 Secrets

- `SERVER_HOST`
- `SERVER_PORT`
- `SERVER_USER`
- `SERVER_APP_DIR`
- `SERVER_SSH_KEY`
- `GHCR_USERNAME`
- `GHCR_TOKEN`
- `OPENAI_API_KEY`（启用服务端 LLM 时必需）

### 可选 Variables

- `APP_PORT`
- `NEXT_PUBLIC_USE_SERVER_LLM`
- `OPENAI_API_BASE`
- `LLM_DEBUG`

### 目标服务器要求

- 已安装 Docker Engine 和 `docker compose`
- 具备访问 `ghcr.io` 的网络能力
- 具备可写的部署目录，对应 `SERVER_APP_DIR`

## 目录结构

```text
.
├── .github/workflows/      # CI/CD 配置
├── docs/                   # 项目文档
├── e2e/                    # Playwright 测试
├── public/                 # 静态资源、模板、截图
├── src/app/                # Next.js App Router 页面与 API
├── src/components/         # 页面与编辑器组件
├── src/hooks/              # 自定义 Hooks
├── src/lib/                # 主题、字体、LLM 与工具函数
└── src/styles/             # 全局样式与打印样式
```

## 产品截图

| 编辑器工作区 | 模板示例 |
| --- | --- |
| ![Workspace](/public/screenshots/editor-workspace.png) | ![Template](/public/screenshots/mashhad-resume.png) |

更多模板示例：

- ![Isfahan](/public/screenshots/isfahan-resume.png)
- ![Tehran](/public/screenshots/tehran-resume.png)
- ![Shiraz](/public/screenshots/shiraz-resume.png)

## 贡献指南

欢迎提交 Issue 与 Pull Request。建议的协作流程：

1. Fork 仓库并创建功能分支
2. 完成功能开发与必要测试
3. 运行 `npm run lint` 和 `npm run type-check`
4. 提交 Pull Request，并说明变更背景与验证方式

## License

本项目基于 MIT License 开源。

## Contact

如需反馈问题或合作交流，请联系：

- `xuewenjie2017@gmail.com`
