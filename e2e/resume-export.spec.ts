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

    test('editor keeps the sidebar compact and uses an A4-style preview canvas', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 1600, height: 1200 },
        });
        const page = await context.newPage();

        await page.goto('http://localhost:3001/editor', { waitUntil: 'networkidle' });

        const previewShell = page.getByTestId('editor-preview-desktop');
        const previewPaper = page.getByTestId('editor-preview-paper-desktop');

        await expect(previewShell).toBeVisible();
        await expect(previewPaper).toBeVisible();
        await expect(page.getByRole('button', { name: 'AI 配置' })).toBeVisible();
        await expect(page.getByText('当前主题预设', { exact: true })).toHaveCount(0);
        await expect(page.getByText('自定义 CSS', { exact: true })).toHaveCount(0);

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

    test('style controls update the visible preview paper typography', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 1600, height: 1200 },
        });
        const page = await context.newPage();

        await page.goto('http://localhost:3001/editor?template=mashhad', { waitUntil: 'networkidle' });

        const previewPaper = page.getByTestId('editor-preview-paper-desktop');
        await expect(previewPaper).toBeVisible();

        const fontSelect = page.locator('.sidebar select[aria-label="选择字体"]').first();
        await expect(fontSelect).toBeVisible();
        await fontSelect.selectOption('Noto Sans SC');
        await page.evaluate(() => document.fonts.ready);

        const paperFontFamily = await previewPaper
            .locator('.previewContainer')
            .evaluate((element) => window.getComputedStyle(element).fontFamily);

        expect(paperFontFamily).toContain('Noto Sans SC');

        await context.close();
    });

    test('managed preview styles keep font and page padding controls effective over custom CSS', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 1600, height: 1200 },
        });
        const page = await context.newPage();

        await page.addInitScript(() => {
            window.localStorage.setItem('FONT', JSON.stringify('Noto Sans SC'));
            window.localStorage.setItem('FONT_SCALE', JSON.stringify(1.25));
            window.localStorage.setItem('HEADING_SCALE', JSON.stringify(1.2));
            window.localStorage.setItem('LINE_HEIGHT_SCALE', JSON.stringify(1.7));
            window.localStorage.setItem('X_PADDING_SCALE', JSON.stringify(36));
            window.localStorage.setItem(
                'CUSTOM_PREVIEW_CSS',
                JSON.stringify(`
.previewContainer {
  padding: 0 !important;
}

.previewContainer,
.previewContainer * {
  font-family: Georgia, serif !important;
}

.previewContainer h1,
.previewContainer h2,
.previewContainer h3,
.previewContainer p,
.previewContainer li {
  font-size: 12px !important;
  line-height: 1 !important;
}
`)
            );
        });

        await page.goto('http://localhost:3001/editor?template=mashhad', { waitUntil: 'networkidle' });

        const previewContainer = page.getByTestId('editor-preview-paper-desktop').locator('.previewContainer');
        await expect(previewContainer).toBeVisible();

        const previewMetrics = await previewContainer.evaluate((element) => {
            const containerStyle = window.getComputedStyle(element);
            const headingStyle = window.getComputedStyle(element.querySelector('h1') as HTMLElement);
            const paragraphStyle = window.getComputedStyle(element.querySelector('p') as HTMLElement);

            return {
                fontFamily: containerStyle.fontFamily,
                paddingLeft: containerStyle.paddingLeft,
                headingFontSize: headingStyle.fontSize,
                paragraphFontSize: paragraphStyle.fontSize,
                paragraphLineHeight: paragraphStyle.lineHeight,
            };
        });

        expect(previewMetrics.fontFamily).toContain('Noto Sans SC');
        expect(previewMetrics.fontFamily).not.toContain('Georgia');
        expect(previewMetrics.paddingLeft).toBe('36px');
        expect(previewMetrics.headingFontSize).not.toBe('12px');
        expect(previewMetrics.paragraphFontSize).not.toBe('12px');
        expect(previewMetrics.paragraphLineHeight).not.toBe('12px');

        await context.close();
    });

    test('PDF export payload excludes pagination guides', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 1600, height: 1200 },
        });
        const page = await context.newPage();

        await page.goto('http://localhost:3001/editor?template=mashhad', { waitUntil: 'networkidle' });
        await expect(page.getByTestId('editor-preview-paper-desktop')).toBeVisible();

        await page.getByRole('button', { name: '高级设置' }).click();
        const customCssInput = page.locator('.sidebar textarea').first();
        await expect(customCssInput).toBeVisible();
        await customCssInput.fill('.previewContainer h2 { border-bottom: 1px solid var(--headerColor); }');

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
        expect(requestBody.styles?.customCss).toContain('.previewContainer h2');

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
                    customCss: '.previewContainer h2 { border-bottom: 1px solid #222; }',
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
