# A4 Preview Pagination Guides Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让编辑器预览区像 Word 一样能“看见”A4 分页边界（不改变实际内容排版/导出结果），便于确认是否产生分页。

**Architecture:** 保持现有单张长画布渲染 Markdown（避免 DOM 真实分页的复杂度与 React 失配），在预览纸张内部叠加“分页参考线/页码标识”，并将纸张舞台高度对齐到整页高度（`ceil(scrollHeight / A4_HEIGHT) * A4_HEIGHT`），从视觉上显示分页。

**Tech Stack:** Next.js (App Router) + React + Tailwind + Playwright。

---

### Task 1: Add failing e2e test for pagination guides

**Files:**
- Modify: `e2e/resume-export.spec.ts`

**Step 1: Write the failing test**

Add a Playwright test that:
- opens `http://localhost:3001/editor?template=mashhad`
- waits for the preview paper
- expects at least 1 pagination guide element (page break marker) to exist

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/resume-export.spec.ts -g \"pagination\"`

Expected: FAIL because no pagination guide elements exist yet.

---

### Task 2: Render pagination guides in preview paper

**Files:**
- Modify: `src/components/preview/Preview.tsx`
- (Optional) Modify: `src/styles/print.css` (hide guides in print)

**Step 1: Implement page counting**

In the existing `ResizeObserver` callback:
- compute `pageCount = max(1, ceil(previewPaper.scrollHeight / A4_PAPER_HEIGHT))`
- set `paperHeight = pageCount * A4_PAPER_HEIGHT` (instead of using `scrollHeight` directly)
- keep existing width-fit scaling logic

**Step 2: Render guide markers**

Inside the preview paper element:
- render `pageCount - 1` absolutely-positioned dashed lines at `top: i * A4_PAPER_HEIGHT`
- attach `data-testid="preview-page-break"`
- keep `pointer-events: none`

**Step 3: Hide guides in print**

In print CSS, hide `[data-testid=\"preview-page-break\"]` so PDF/export不会出现分页线。

---

### Task 3: Verify GREEN (tests pass)

**Files:**
- Test: `e2e/resume-export.spec.ts`

**Step 1: Run the targeted e2e test**

Run: `npx playwright test e2e/resume-export.spec.ts -g \"pagination\"`

Expected: PASS.

**Step 2: Run full e2e suite (optional but recommended)**

Run: `npx playwright test`

Expected: PASS.

---

### Task 4: Small UX polish (optional)

**Files:**
- Modify: `src/components/preview/Preview.tsx`

**Step 1: Make guides subtle**

Use a light, dashed border and a small page label (e.g. “Page 2”) that won’t obscure content.

