import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Resume Export Flow', () => {
    test('homepage loads and navigates to editor', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
        });
        const page = await context.newPage();

        // 1. Load homepage
        await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
        await expect(page).toHaveTitle(/Markdown Resume AI/);

        // 2. Click the primary homepage CTA
        const createButton = page.getByRole('link', { name: /Start Building|Create My Resume|开始制作|立即创建简历/i }).first();
        await expect(createButton).toBeVisible();
        await createButton.click();

        // 3. Verify navigation to editor
        await page.waitForURL('**/editor/**');

        // 4. Verify key elements exist on the page
        await expect(page.getByTestId('editor-preview-desktop')).toBeVisible();
        await expect(page.locator('.sidebar')).toBeAttached();

        // 5. Verify export button exists
        const exportButton = page.getByRole('button', { name: /导出 PDF/i });
        await expect(exportButton).toBeAttached();

        await context.close();
    });

    test('editor uses compact summary and A4-style preview canvas', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 1600, height: 1200 },
        });
        const page = await context.newPage();

        await page.goto('http://localhost:3001/editor', { waitUntil: 'networkidle' });

        const summaryStrip = page.getByTestId('editor-summary-strip');
        const previewShell = page.getByTestId('editor-preview-desktop');
        const previewPaper = page.getByTestId('editor-preview-paper-desktop');

        await expect(summaryStrip).toBeVisible();
        await expect(previewShell).toBeVisible();
        await expect(previewPaper).toBeVisible();

        const paperMetrics = await previewPaper.evaluate((element) => {
            const htmlElement = element as HTMLElement;
            const style = window.getComputedStyle(htmlElement);

            return {
                width: htmlElement.style.width,
                minHeight: htmlElement.style.minHeight,
                transform: style.transform,
            };
        });

        expect(paperMetrics.width).toBe('794px');
        expect(paperMetrics.minHeight).toBe('1123px');
        expect(paperMetrics.transform).not.toBe('none');

        await expect(page.getByText('文档状态', { exact: true })).toHaveCount(0);
        await expect(page.getByText('AI 辅助状态', { exact: true })).toHaveCount(0);

        await context.close();
    });

    test('editor preview shows A4 pagination guides', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 1600, height: 1200 },
        });
        const page = await context.newPage();

        await page.goto('http://localhost:3001/editor?template=mashhad', { waitUntil: 'networkidle' });

        await expect(page.getByTestId('editor-preview-paper-desktop')).toBeVisible();

        const pageBreaks = page.getByTestId('preview-page-break');
        await expect.poll(() => pageBreaks.count()).toBeGreaterThan(0);

        await context.close();
    });

    test('PDF export payload excludes pagination guides', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 1600, height: 1200 },
        });
        const page = await context.newPage();

        await page.goto('http://localhost:3001/editor?template=mashhad', { waitUntil: 'networkidle' });
        await expect(page.getByTestId('editor-preview-paper-desktop')).toBeVisible();

        let resolveBody: ((value: any) => void) | null = null;
        const requestBodyPromise = new Promise<any>((resolve) => {
            resolveBody = resolve;
        });

        await page.route(
            '**/api/generate-pdf',
            async (route) => {
                resolveBody?.(route.request().postDataJSON());
                await route.fulfill({
                    status: 200,
                    headers: { 'content-type': 'application/pdf' },
                    body: '%PDF-1.4\n%EOF\n',
                });
            },
            { times: 1 }
        );

        await page.getByRole('button', { name: /导出 PDF/i }).click();
        const requestBody = await requestBodyPromise;

        expect(typeof requestBody?.html).toBe('string');
        expect(requestBody.html).not.toContain('preview-page-break');

        await context.close();
    });

    test('PDF export API works directly', async ({ request }) => {
        // Test the PDF generation API endpoint directly
        const response = await request.post('http://localhost:3001/api/generate-pdf', {
            data: {
                html: '<h1>Test Resume</h1><p>This is a test.</p>',
                theme: 'tehran',
                styles: {
                    fontName: 'Inter',
                    fontScale: 1,
                    headingScale: 1,
                    lineHeightScale: 1.5,
                    xPaddingScale: 24,
                    yPaddingScale: 0,
                    headerColor: '#222',
                    textColor: '#444',
                    linkColor: '#1a73e8',
                },
            },
        });

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toBe('application/pdf');

        const pdfBuffer = await response.body();
        expect(pdfBuffer.length).toBeGreaterThan(0);

        // Verify PDF magic bytes
        const pdfHeader = pdfBuffer.slice(0, 4).toString();
        expect(pdfHeader).toBe('%PDF');

        // Save and verify the file
        const downloadPath = path.join('/tmp', 'test-api-resume.pdf');
        fs.writeFileSync(downloadPath, pdfBuffer);

        const fileStats = fs.statSync(downloadPath);
        expect(fileStats.size).toBeGreaterThan(1000); // Should be at least 1KB

        // Clean up
        fs.unlinkSync(downloadPath);
    });
});
