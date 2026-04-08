# Markdown Resume

![Landing_Image](/public/screenshots/landing-image.png)

## Introduction
Markdown Resume is an open-source project that helps users create professional resumes. You write your resume in **markdown format**, and the editor lets you preview, apply different **themes**, customize, and export it as a **PDF**.

## Features
- **Write in Markdown**: Use simple markdown to write your resume content.
- **Live Preview**: See your resume as you type, so you know how it looks.
- **Different Themes**: Choose from multiple styles to make your resume unique.
- **Custom Fonts, Layout and Colors**: Adjust fonts, sizes, line heights, colors, and more to fit your personal style.
- **Export as PDF**: Export your resume as a PDF document that’s ready to share.
- **AI resume generation** (added): In the **right sidebar**, section **「AI 生成 Markdown」**—paste raw notes, then **生成并写入编辑器**. Prompts match **`scripts/cv`** (`generateMarkdownResumeBody`).
  - **服务端 Key（推荐）**：部署时设置环境变量 `OPENAI_API_KEY`，可选 `OPENAI_API_BASE`；前端勾选「使用服务端 Key」或设置 `NEXT_PUBLIC_USE_SERVER_LLM=true`，请求走 **`/api/llm/chat`**，**Key 不进入浏览器**。详见项目根目录 **`.env.example`**。
  - **自带 Key（BYOK）**：关闭「使用服务端 Key」，在 **「配置 LLM」** 填写 Key（仅存 `localStorage`）。开发直连可用 **`/openai-proxy`**（`next.config.ts`）避免 CORS。

Editor 已重构为 **顶部命令栏 + 中央编辑/预览双栏 + 右侧工具抽屉**。右侧抽屉拆分为 **样式** 和 **AI 助手** 两个 tab，移动端降级为只读预览。

## Technologies Used
- [React](https://react.dev/)
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React DOM](https://reactjs.org/docs/react-dom.html)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [MDXEditor](https://github.com/mdxeditor/editor)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## Screenshots
Here are some examples of resumes created with this tool:

| ![Resume Example](/public/screenshots/mashhad-resume.png) | ![Resume Example](/public/screenshots/isfahan-resume.png) |
|-----------------------------------------------------------|-----------------------------------------------------------|
| ![Resume Example](/public/screenshots/tehran-resume.png)  | ![Resume Example](/public/screenshots/shiraz-resume.png)  |

## Quick Start
To run the project locally:

1.Install the dependencies:

```
npm install
```

2.Run the development server:

```
npm run dev
```

3. Open **http://localhost:3001/editor/** in your browser (see `package.json` dev port).

## Docker Deployment

This repo now includes a production Docker image and a single-service `docker-compose.yml` for the Next.js app.

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Build and start the container locally:

```bash
docker compose --env-file .env up --build -d
```

3. Open **http://localhost:3000/** by default, or change `APP_PORT` in `.env`.

The container uses:
- `OPENAI_API_KEY` and optional `OPENAI_API_BASE` for the server-side LLM route
- `NEXT_PUBLIC_USE_SERVER_LLM` for the client default
- system Chromium inside the image for the PDF export API

## GitHub Actions CI/CD

The repo now includes:
- `CI`: runs `npm ci`, `npm run lint`, `npm run type-check`, and `npm run build`
- `Deploy`: builds and pushes a GHCR image, then deploys it to your server over SSH with `docker compose`

### Required GitHub Secrets

- `SERVER_HOST`
- `SERVER_PORT`
- `SERVER_USER`
- `SERVER_APP_DIR`
- `SERVER_SSH_KEY`
- `GHCR_USERNAME`
- `GHCR_TOKEN`
- `OPENAI_API_KEY` (only if you want the server-side LLM route enabled)

### Optional GitHub Variables

- `APP_PORT`
- `NEXT_PUBLIC_USE_SERVER_LLM`
- `OPENAI_API_BASE`
- `LLM_DEBUG`

### Server Requirements

- Docker Engine with `docker compose`
- A writable deploy directory matching `SERVER_APP_DIR`
- Network access from the server to `ghcr.io`

On each push to `main`, GitHub Actions builds a new image, uploads `docker-compose.yml` to the server, writes a `.env.deploy`, then runs `docker compose pull` and `docker compose up -d`.

You can also trigger `Deploy` manually with `workflow_dispatch` to reuse an existing image tag.

## Editor UX TODO
- [x] 重做 Editor 页面骨架：改成顶部命令栏 + 中央编辑/预览双栏 + 右侧工具抽屉，解决当前页面层级不清和功能堆叠问题。
- [x] 统一主次操作：全页只保留一个强主按钮 `Export PDF`，将 `Support` 移出核心工作区，避免和导出并列抢主操作。
- [x] 拆分右侧工具区：将当前侧栏重构为 `样式` 和 `AI 助手` 两个 tab，不再把导出、样式、AI 混在一个连续面板里。
- [x] 给编辑器补齐专业工作区信息：增加编辑区标题、文档状态、字数/结构提示，让左侧不再只是一个裸输入框。
- [x] 重做样式配置交互：首屏只保留主题、字体风格、版式密度等高频设置；字号、行距、边距、颜色收进高级设置。
- [x] 为样式配置提供预设摘要：用户切换主题时应看到预设说明和效果预期，而不是直接面对一组零散参数。
- [x] 统一文案语言：Editor 核心界面统一中文，避免 `Theme`、`Typography`、`Export PDF`、`Support` 与中文文案混排。
- [x] 统一视觉系统：收敛按钮样式、圆角、边框、阴影和强调色，去掉现在各区块各自为政的视觉噪音。
- [x] 调整 AI 生成流程：明确为 `粘贴原始经历 -> 生成草稿 -> 写入编辑器` 的辅助路径，降低它对主编辑流的干扰。
- [x] 增加关键状态反馈：导出中、AI 生成中、失败提示、配置完成等状态要更明确，避免用户只能靠按钮文字猜当前状态。
- [x] 补桌面端布局验收：至少检查 1024px、1280px、1440px 三档，确保无拥挤、无遮挡、无层级冲突。
- [x] 评估移动端降级方案：即使暂不支持完整编辑，也至少提供更完整的说明或只读预览，而不是单纯屏蔽页面。

## Contributing
We welcome contributions! To contribute:
- Fork the repository
- Create your branch (git checkout -b feature/YourFeature)
- Commit changes (git commit -am 'Add feature')
- Push the branch (git push origin feature/YourFeature)
- Create a Pull Request

## License
Licensed under the MIT License.

## Contact
For questions or support, please contact [xuewenjie2017@gmail.com](mailto:xuewenjie2017@gmail.com).
