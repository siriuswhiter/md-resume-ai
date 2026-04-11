
export const fonts = {
    "Open Sans": 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap',
    "Noto Sans": 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;600;700&display=swap',
    "Noto Sans SC": 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap',
    "Noto Serif SC": 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&display=swap',
    "Ubuntu": 'https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap',
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
    'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap',
    'Nunito': 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap',
    'Work Sans': 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;700&display=swap',
    "Merriweather": 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
    "PT Sans": 'https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap',
    "Karla": 'https://fonts.googleapis.com/css2?family=Karla:wght@400;700&display=swap',
    "Overpass Mono": 'https://fonts.googleapis.com/css2?family=Overpass+Mono:wght@400;700&display=swap',
    "Raleway": 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap',
    "Montserrat": 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
    "Inika": 'https://fonts.googleapis.com/css2?family=Inika:wght@400;700&display=swap',
    "Lato": 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap'
} as const;

export type FontKey = keyof typeof fonts;

const cjkFontFallbacks = [
    "Noto Sans SC",
    "Noto Serif SC",
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    "Source Han Sans SC",
];

const quoteFontFamily = (fontName: string) => `"${fontName.replace(/"/g, '\\"')}"`;

export const getFontFamilyStack = (fontName: string) => {
    const uniqueFonts = [fontName, ...cjkFontFallbacks].filter(
        (value, index, array) => array.indexOf(value) === index
    );

    return `${uniqueFonts.map(quoteFontFamily).join(", ")}, sans-serif`;
};


export interface ThemeProps {
    fontName: string;
    fontScale: number;
    headingScale: number;
    lineHeightScale: number;
    xPaddingScale: number;
    yPaddingScale: number;
    headerColor: string;
    textColor: string;
    linkColor: string;
}

export const themes = {
    tehran: {
        fontName: 'Inter',
        fontScale: 1,
        headingScale: 1,
        lineHeightScale: 1.5,
        xPaddingScale: 24,
        yPaddingScale: 0,
        headerColor: "#222",
        textColor: '#444',
        linkColor: "#1a73e8"
    },
    isfahan: {
        fontName: 'Poppins',
        fontScale: 1,
        headingScale: 1,
        lineHeightScale: 1.5,
        xPaddingScale: 24,
        yPaddingScale: 0,
        headerColor: "#016ef1",
        textColor: '#222',
        linkColor: "#1a73e8"
    },
    shiraz: {
        fontName: 'Nunito',
        fontScale: 1,
        headingScale: 1,
        lineHeightScale: 1.5,
        xPaddingScale: 24,
        yPaddingScale: 0,
        headerColor: "#222",
        textColor: '#444',
        linkColor: "#1a73e8"
    },
    mashhad: {
        fontName: 'Work Sans',
        fontScale: 1,
        headingScale: 1,
        lineHeightScale: 1.5,
        xPaddingScale: 24,
        yPaddingScale: 0,
        headerColor: "#222",
        textColor: '#222',
        linkColor: "#1a73e8"
    }
} satisfies Record<string, ThemeProps>;

export type ThemeKey = keyof typeof themes;

export interface ThemePresetMeta {
    id: ThemeKey;
    label: string;
    summary: string;
    bestFor: string;
    expectation: string;
}

export const themePresetMeta: Record<ThemeKey, ThemePresetMeta> = {
    tehran: {
        id: "tehran",
        label: "Tehran",
        summary: "稳重克制，信息优先，适合传统招聘流程和 ATS 友好场景。",
        bestFor: "通用岗位、校招、需要强调清晰度的简历",
        expectation: "标题克制、层级清晰、适合快速扫描。",
    },
    isfahan: {
        id: "isfahan",
        label: "Isfahan",
        summary: "更有品牌感和色彩识别，适合希望提升视觉辨识度的候选人。",
        bestFor: "产品、运营、市场、设计相关岗位",
        expectation: "强调色更明显，观感更现代。",
    },
    shiraz: {
        id: "shiraz",
        label: "Shiraz",
        summary: "亲和、轻巧，阅读压力低，适合经历较多但想保留柔和气质的内容。",
        bestFor: "多项目经历、需要更柔和视觉语气的简历",
        expectation: "版面更轻盈，适合长内容连续阅读。",
    },
    mashhad: {
        id: "mashhad",
        label: "Mashhad",
        summary: "现代感强，标题和正文对比更清楚，适合专业技术向内容。",
        bestFor: "开发、数据、技术管理等岗位",
        expectation: "信息密度平衡，适合导出后直接投递。",
    },
};

export type DensityPresetId = "compact" | "balanced" | "airy";

export interface DensityPreset {
    id: DensityPresetId;
    label: string;
    summary: string;
    lineHeightScale: number;
    xPaddingScale: number;
    yPaddingScale: number;
}

export const densityPresets: DensityPreset[] = [
    {
        id: "compact",
        label: "紧凑",
        summary: "在一页内塞下更多经历，适合项目和工作经历较长的简历。",
        lineHeightScale: 1.35,
        xPaddingScale: 18,
        yPaddingScale: 12,
    },
    {
        id: "balanced",
        label: "平衡",
        summary: "默认推荐，兼顾可读性和信息密度。",
        lineHeightScale: 1.5,
        xPaddingScale: 24,
        yPaddingScale: 16,
    },
    {
        id: "airy",
        label: "舒展",
        summary: "留白更多，适合内容较少或需要更强展示感的简历。",
        lineHeightScale: 1.7,
        xPaddingScale: 28,
        yPaddingScale: 20,
    },
];

export enum ThemeList {
    tehran = 'Tehran',
    isfahan = 'Isfahan',
    shiraz = 'Shiraz',
    mashhad = 'Mashhad',
}
