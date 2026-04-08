# CI/CD And Docker Deploy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add GitHub Actions CI/CD, Docker image build, and Docker Compose deployment for this Next.js app using the reference project's GHCR + SSH deployment pattern.

**Architecture:** Keep the app as a single Next.js service. Build a production image with a multi-stage Dockerfile, publish it to GHCR from GitHub Actions, and deploy on the target server by SSH-ing into the host and running `docker compose pull` plus `docker compose up -d`.

**Tech Stack:** Next.js 15, TypeScript, npm, Puppeteer, GitHub Actions, Docker, Docker Compose, GHCR

### Task 1: Baseline Runtime And Verification Commands

**Files:**
- Modify: `package.json`
- Test: local `npm run lint`, `npm run type-check`, `npm run build`

**Step 1: Add missing verification command**

Add a `type-check` script so CI can run a stable TypeScript gate.

**Step 2: Run verification command to confirm it works**

Run: `npm run type-check`
Expected: command exits successfully without TypeScript errors

### Task 2: Container Runtime

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `docker-compose.yml`

**Step 1: Define production image**

Create a multi-stage Dockerfile that installs dependencies, builds Next.js, and runs the standalone server in production.

**Step 2: Define compose deployment entry**

Create a single-service compose file that can build locally and also run a pushed GHCR image via `DOCKER_IMAGE`.

**Step 3: Validate Docker configuration**

Run: `docker compose config`
Expected: compose renders a valid service definition

### Task 3: CI Workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Add Node-based CI**

Create a workflow that runs on push and pull request for `main` and `master`, then executes `npm ci`, lint, type-check, and build.

**Step 2: Validate workflow syntax indirectly**

Run local verification commands matching CI gates.

### Task 4: Deploy Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Add image build and push**

Create a workflow that builds and pushes the app image to GHCR on `main` pushes and optionally on manual dispatch.

**Step 2: Add SSH deploy**

Reuse the reference project's SSH deployment pattern to log into the server, update environment, pull the target image, and restart the compose service.

**Step 3: Keep deploy surface minimal**

Avoid extra infra services, migrations, or reverse-proxy logic that this repo does not currently need.

### Task 5: Deployment Documentation

**Files:**
- Modify: `README.md`

**Step 1: Document local Docker usage**

Add commands for local container build/run via Docker Compose.

**Step 2: Document GitHub deployment setup**

List required GitHub Secrets and Variables for GHCR and SSH deployment.

**Step 3: Document server bootstrap**

Explain what files must exist on the server and how the workflow uses them.
