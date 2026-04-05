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

侧栏在 Export 下方增加 **AI** 区块，其余区块顺序与 [markdownresume.app/editor](https://markdownresume.app/editor/) 一致（Theme → Font → Layout → Color）。

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
For questions or support, please contact [rozita.hasani.work@gmail.com](mailto:rozita.hasani.work@gmail.com).