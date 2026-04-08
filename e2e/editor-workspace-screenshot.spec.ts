import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test("capture editor workspace screenshot for homepage hero", async ({ browser }) => {
  const outputPath = path.join(process.cwd(), "public", "screenshots", "editor-workspace.png");

  const context = await browser.newContext({
    viewport: { width: 1720, height: 1380 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();

  await page.goto("http://localhost:3001/editor?template=mashhad", {
    waitUntil: "networkidle",
  });

  const workspace = page.getByTestId("editor-workspace-desktop");
  const previewPaper = page.getByTestId("editor-preview-paper-desktop");

  await expect(workspace).toBeVisible();
  await expect(previewPaper).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await workspace.screenshot({
    path: outputPath,
  });

  await context.close();
});
