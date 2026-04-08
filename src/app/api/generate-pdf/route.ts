import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface PdfRequestBody {
    html: string;
    theme: string;
    styles: {
        fontName: string;
        fontScale: number;
        headingScale: number;
        lineHeightScale: number;
        xPaddingScale: number;
        yPaddingScale: number;
        headerColor: string;
        textColor: string;
        linkColor: string;
    };
}

const fontImports = `
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Karla:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Overpass+Mono:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inika:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap');
`;

const baseStyles = `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background: white;
}

.previewContainer {
    font-family: var(--fontName, "Open Sans"), sans-serif;
    padding: var(--yPaddingScale) var(--xPaddingScale);
    background: white;
}

/* Prose-like defaults */
.previewContainer p {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.previewContainer h1 {
    margin-top: 0;
    margin-bottom: 0.5rem;
}

.previewContainer h2,
.previewContainer h3,
.previewContainer h4 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}

.previewContainer ul,
.previewContainer ol {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.previewContainer hr {
    margin: 1rem 0;
}
`;

const tehranTheme = `
.theme.tehran {
    font-family: 'Inter', 'Noto Sans SC';
    font-size: calc(16px * var(--fontScale));
    line-height: var(--lineHeightScale);
    color: var(--textColor, #444);
}

.theme.tehran h1 {
    font-weight: 800;
    font-size: calc(2.25rem * var(--fontScale) * var(--headingScale, 1));
    margin-top: 0;
    text-align: left;
    color: var(--headerColor, #222);
}

.theme.tehran h2 {
    position: relative;
    color: var(--headerColor, #222);
    font-weight: 600;
    font-size: calc(1.5rem * var(--fontScale) * var(--headingScale, 1));
    margin-top: 0.5em;
}

.theme.tehran h2:before {
    background-color: var(--linkColor, #016ef1);
    bottom: -2px;
    content: '';
    height: 3px;
    left: 0;
    position: absolute;
    width: fit-content;
}

.theme.tehran h3 {
    font-size: calc(1.25rem * var(--fontScale) * var(--headingScale, 1));
    color: var(--headerColor, #222);
    margin-top: 0.5em;
    font-weight: 600;
}

.theme.tehran h3 + p {
    margin-top: 0.2rem;
}

.theme.tehran p {
    margin-top: 0.5rem;
    color: var(--textColor, #444);
}

.theme.tehran a {
    color: var(--linkColor, #222);
    text-decoration: underline;
    font-weight: 600;
}

.theme.tehran hr {
    border-top: 1px solid #ddd;
    margin: 1em 0;
}

.theme.tehran strong {
    color: var(--textColor, #222);
    font-weight: 600;
}

.theme.tehran em {
    font-style: italic;
    color: var(--textColor, #444);
}

.theme.tehran ul {
    padding-left: 12px;
    margin-top: 0.5em;
    list-style-type: none;
}

.theme.tehran ul li {
    list-style-type: none;
    position: relative;
    color: var(--textColor, #444);
}

.theme.tehran ul li:before {
    color: var(--linkColor, #016ef1);
    font-family: 'Inter';
    font-weight: 600;
    content: '•';
    left: -12px;
    position: absolute;
    margin-right: 0.5em;
}
`;

const isfahanTheme = `
.theme.isfahan {
    font-family: "Karla", "Inter", "Noto Sans SC";
    font-size: calc(18px * var(--fontScale));
    line-height: var(--lineHeightScale);
    color: var(--textColor, #222);
}

.theme.isfahan h1 {
    font-weight: normal;
    font-size: calc(2.25rem * var(--fontScale) * var(--headingScale, 1));
    margin-top: 0;
    text-align: left;
}

.theme.isfahan h2 {
    color: var(--headerColor, #016ef1);
    font-size: calc(1.5rem * var(--fontScale) * var(--headingScale, 1));
    margin-top: 0.5em;
    font-weight: bold;
}

.theme.isfahan h3 {
    color: var(--headerColor);
    font-size: calc(1.25rem * var(--fontScale) * var(--headingScale, 1));
    margin-top: .5em;
    font-weight: bold;
}

.theme.isfahan p {
    margin-top: .5rem;
    color: var(--textColor);
}

.theme.isfahan a {
    color: var(--linkColor);
    border-bottom: 1px dotted;
    text-decoration: none;
}

.theme.isfahan strong {
    font-weight: bold;
    color: var(--textColor);
}

.theme.isfahan em {
    font-style: italic;
}

.theme.isfahan ul {
    margin-top: .5em;
    list-style-type: none;
    padding-left: 1em;
}

.theme.isfahan ul li {
    position: relative;
    color: var(--textColor);
}

.theme.isfahan ul li:before {
    color: var(--linkColor, #016ef1);
    content: "◦";
    font-family: "Inter";
    left: -1em;
    position: absolute;
    font-weight: bold;
}

.theme.isfahan hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 1em 0;
}
`;

const shirazTheme = `
.theme.shiraz {
    font-family: "Work Sans", "Inter", 'Noto Sans SC';
    font-size: calc(16px * var(--fontScale));
    line-height: var(--lineHeightScale);
    color: var(--textColor, #222);
}

.theme.shiraz h1,
.theme.shiraz h2,
.theme.shiraz h3,
.theme.shiraz h4,
.theme.shiraz h5,
.theme.shiraz h6 {
    font-family: "Poppins", "Inter", 'Noto Sans SC';
}

.theme.shiraz h1 {
    font-weight: normal;
    font-size: calc(2.25rem * var(--fontScale) * var(--headingScale, 1));
    margin-top: 0;
    text-align: left;
    color: var(--headerColor, #222);
}

.theme.shiraz h2 {
    border-bottom: 1px dashed var(--linkColor, #016ef1);
    font-weight: 700;
    font-size: calc(1.5rem * var(--fontScale) * var(--headingScale, 1));
    margin-top: 0.5em;
    position: relative;
    display: inline-block;
    color: var(--headerColor, #222);
}

.theme.shiraz h3 {
    font-size: calc(1.25rem * var(--fontScale) * var(--headingScale, 1));
    margin-top: 0.5rem;
    font-weight: 600;
    color: var(--headerColor, #222);
}

.theme.shiraz p {
    margin-top: 0.5rem;
    color: var(--textColor, #222);
}

.theme.shiraz a {
    color: var(--linkColor, #222);
    font-weight: 500;
    text-decoration: underline;
}

.theme.shiraz hr {
    margin: 1em 0;
    border: none;
}

.theme.shiraz strong {
    font-weight: 500;
    color: var(--textColor, #222);
}

.theme.shiraz em {
    font-style: italic;
    color: var(--textColor, #222);
}

.theme.shiraz ul {
    padding-left: 16px;
    margin-top: 0.5em;
    list-style-type: none;
}

.theme.shiraz ul li {
    list-style-type: none;
    position: relative;
    color: var(--textColor, #222);
}

.theme.shiraz ul li:before {
    font-weight: bold;
    content: '-';
    left: -16px;
    position: absolute;
    margin-right: 0.5em;
    color: var(--linkColor, #016ef1);
}
`;

const mashhadTheme = `
.theme.mashhad {
    font-family: "Nunito", "Inter", 'Noto Sans SC';
    font-size: calc(16px * var(--fontScale));
    line-height: var(--lineHeightScale);
    color: var(--textColor, #444);
}

.theme.mashhad h1, .theme.mashhad h2, .theme.mashhad h3, .theme.mashhad h4, .theme.mashhad h5, .theme.mashhad h6 {
    font-family: "Inika", "Inter", 'Noto Sans SC';
}

.theme.mashhad h1 {
    font-weight: 800;
    font-size: calc(2.5rem * var(--fontScale) * var(--headingScale, 1));
    margin-top: 0;
    text-align: left;
    color: var(--headerColor, #222);
}

.theme.mashhad h2 {
    display: flex;
    position: relative;
    color: var(--headerColor, #222);
    font-weight: 600;
    font-size: calc(1.5rem * var(--fontScale) * var(--headingScale, 1));
    margin-top: 0.5em;
}

.theme.mashhad h2:after {
    color: var(--headerColor);
    align-self: end;
    content: '';
    flex-grow: 1;
    height: 1px;
    margin-bottom: 1rem;
    margin-left: 4px;
}

.theme.mashhad h3 {
    color: var(--headerColor, #016ef1);
    margin-top: 0.5rem;
    font-weight: 600;
    font-size: calc(1.25rem * var(--fontScale) * var(--headingScale, 1));
}

.theme.mashhad h3 + p {
    margin-top: .2rem;
}

.theme.mashhad p {
    margin-top: .5rem;
    color: var(--textColor);
}

.theme.mashhad a {
    color: var(--linkColor, #222);
    border-bottom: 1px dashed;
    text-decoration: none !important;
}

.theme.mashhad hr {
    border-top: 1px solid #ddd;
    margin: 1em 0;
}

.theme.mashhad strong {
    color: var(--textColor, #222);
    font-weight: 600;
}

.theme.mashhad em {
    font-style: italic;
    color: var(--textColor, #444);
}

.theme.mashhad ul {
    padding-left: 12px;
    margin-top: .5em;
    list-style-type: none;
}

.theme.mashhad ul li {
    list-style-type: none;
    position: relative;
    color: var(--textColor);
}

.theme.mashhad ul li:before {
    color: var(--linkColor, #016ef1);
    font-family: "Overpass Mono";
    font-weight: 700;
    content: "*";
    left: -12px;
    position: absolute;
}
`;

export async function POST(request: NextRequest) {
    try {
        const body: PdfRequestBody = await request.json();
        const { html, theme, styles } = body;

        const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${fontImports}

        :root {
            --fontName: "${styles.fontName}";
            --fontScale: ${styles.fontScale};
            --headingScale: ${styles.headingScale};
            --lineHeightScale: ${styles.lineHeightScale};
            --xPaddingScale: ${styles.xPaddingScale}px;
            --yPaddingScale: ${styles.yPaddingScale}px;
            --headerColor: ${styles.headerColor};
            --textColor: ${styles.textColor};
            --linkColor: ${styles.linkColor};
        }

        ${baseStyles}
        ${tehranTheme}
        ${isfahanTheme}
        ${shirazTheme}
        ${mashhadTheme}

        @page {
            margin: 24px 0;
            size: letter;
        }

        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="previewContainer theme ${theme}" style="font-family: '${styles.fontName}', sans-serif;">
        ${html}
    </div>
</body>
</html>
`;

        const browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

        // Wait for fonts to load
        await page.evaluate(() => document.fonts.ready);

        const pdf = await page.pdf({
            format: 'letter',
            printBackground: true,
            margin: {
                top: '0',
                right: '0',
                bottom: '0',
                left: '0',
            },
        });

        await browser.close();

        return new NextResponse(pdf, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="resume.pdf"',
            },
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}
