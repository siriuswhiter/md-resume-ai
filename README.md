# Markdown Resume AI

<p align="center">
  <a href="README.zh-CN.md">简体中文</a>
</p>

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
  AI-assisted Markdown resume writing, live preview, template styling, and PDF export in one focused workspace.
</p>

<p align="center">
  <img src="public/screenshots/landing-image.png" alt="Markdown Resume AI homepage" width="900">
</p>

---

## Highlights

| Feature | What it does |
|---|---|
| **Markdown-first editing** | Keep resume content structured, portable, and easy to version |
| **AI drafting** | Turn raw experience notes into editable Markdown resume sections |
| **Live paper preview** | Edit on the left and review the final resume layout on the right |
| **Template and style controls** | Switch themes, fonts, density, colors, spacing, and page margins |
| **Reliable PDF export** | Server-side Puppeteer rendering keeps output consistent across machines |
| **Flexible LLM setup** | Use a server-side API key in production or BYOK for local experiments |

## Product Fit

- Generate a polished resume from scattered notes or project history.
- Maintain an existing resume in a clean Markdown format.
- Switch resume templates for different roles or presentation styles.
- Self-host a resume editor with optional AI generation.

## Tech Stack

`Next.js 15` · `React 18` · `TypeScript` · `Tailwind CSS` · `MDXEditor` · `Playwright` · `Puppeteer` · `Docker` · `GitHub Actions`

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

### 3. Start the dev server

```bash
npm run dev
# Open http://localhost:3001/editor
```

---

## Environment Variables

See [`.env.example`](.env.example) for the full example.

| Variable | Default | Description |
|---|---|---|
| `APP_PORT` | `3000` | Host port exposed by Docker |
| `LLM_DEBUG` | `false` | Enables verbose LLM proxy logs |
| `NEXT_PUBLIC_USE_SERVER_LLM` | `false` | Uses the server-side LLM route by default when enabled |
| `OPENAI_API_BASE` | `https://api.openai.com` | OpenAI-compatible API base URL |
| `OPENAI_API_KEY` | - | Server-side API key for LLM requests |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` | Chromium executable used for PDF export |

---

## AI Generation

The editor includes an AI assistant with two setup modes:

**Server key mode** for production deployments:

- Set `OPENAI_API_KEY`, and optionally `OPENAI_API_BASE`.
- Browser requests are proxied through `/api/llm/chat`, so the API key stays on the server.

**BYOK mode** for local use:

- Users enter their own API key in the editor.
- The configuration is stored locally in the browser and is not uploaded to the server.

---

## Docker Deployment

```bash
cp .env.example .env
docker compose --env-file .env up --build -d
# Open http://localhost:3000
```

Container notes:

- Chromium is included for PDF export.
- `NEXT_PUBLIC_USE_SERVER_LLM` is injected at build time and runtime.
- Health check endpoint: `http://127.0.0.1:3000/`

---

## Scripts

```bash
npm run dev                  # Start local development server on port 3001
npm run build                # Build production assets
npm run start                # Start production server
npm run lint                 # Run ESLint
npm run type-check           # Run TypeScript checks
npm run test                 # Run Playwright E2E tests
npm run capture:editor-shot  # Refresh the editor workspace screenshot
```

---

## Screenshots

### Editor workspace

<p align="center">
  <img src="public/screenshots/editor-workspace.png" alt="Editor workspace with Markdown editor, preview, and style panel" width="900">
</p>

### Resume templates

| Tehran | Isfahan | Shiraz |
|---|---|---|
| ![Tehran template](public/screenshots/tehran-resume.png) | ![Isfahan template](public/screenshots/isfahan-resume.png) | ![Shiraz template](public/screenshots/shiraz-resume.png) |

<details>
<summary>More template screenshots</summary>

| Mashhad |
|---|
| ![Mashhad template](public/screenshots/mashhad-resume.png) |

</details>

---

## CI/CD

GitHub Actions automates the project workflow:

- **CI** runs `lint`, `type-check`, and `build` on pushes and pull requests to `main` / `master`.
- **Deploy** builds and pushes a GHCR image, then deploys it on the target server through SSH and `docker compose`.

### Required Secrets

| Secret | Purpose |
|---|---|
| `SERVER_HOST` / `SERVER_PORT` / `SERVER_USER` | SSH target server |
| `SERVER_APP_DIR` | Deployment directory on the server |
| `SERVER_SSH_KEY` | SSH private key |
| `GHCR_USERNAME` / `GHCR_TOKEN` | GitHub Container Registry credentials |
| `OPENAI_API_KEY` | Required when server-side LLM mode is enabled |

### Optional Variables

`APP_PORT` · `NEXT_PUBLIC_USE_SERVER_LLM` · `OPENAI_API_BASE` · `LLM_DEBUG`

### Target Server Requirements

- Docker Engine and `docker compose` are installed.
- The server can access `ghcr.io`.
- The deployment directory configured by `SERVER_APP_DIR` is writable.

---

## Project Structure

```text
.
├── .github/workflows/      # CI/CD workflows
├── docs/                   # Project documentation
├── e2e/                    # Playwright E2E tests
├── public/                 # Static assets, templates, and screenshots
├── src/app/                # Next.js App Router pages and API routes
├── src/components/         # Page and editor components
├── src/hooks/              # Custom React hooks
├── src/lib/                # Themes, fonts, LLM helpers, and utilities
└── src/styles/             # Global, theme, blog, and print styles
```

---

## Contributing

Issues and pull requests are welcome. Recommended workflow:

1. Fork the repository and create a feature branch.
2. Implement the change and add focused tests when needed.
3. Run `npm run lint` and `npm run type-check`.
4. Open a pull request with the change summary and verification notes.

---

## License

MIT

## Contact

Questions or collaboration: [xuewenjie2017@gmail.com](mailto:xuewenjie2017@gmail.com)
