import {Laptop, MonitorSmartphone, TriangleAlert} from "lucide-react";
import Link from "next/link";
import Preview from "@/components/preview/Preview";
import { cn } from "@/lib/utils";
import { siteMono, siteSans } from "@/lib/siteFonts";

interface MobileScreenWarningProps {
    content?: string;
    theme: string;
    font: string;
    fontScale: number;
    headingScale: number;
    lineHeightScale: number;
    xPaddingScale: number;
    yPaddingScale: number;
    headerColor: string;
    textColor: string;
    linkColor: string;
    customCss?: string;
}

export default function MobileScreenWarning({
    content,
    theme,
    font,
    fontScale,
    headingScale,
    lineHeightScale,
    xPaddingScale,
    yPaddingScale,
    headerColor,
    textColor,
    linkColor,
    customCss,
}: MobileScreenWarningProps) {
    return (
        <div className={cn(siteSans.className, "mobile-warning space-y-4 px-4 py-5 lg:hidden")}>
            <div className="rounded-[32px] border border-[#dad4c8] bg-[#f8cc65] p-5 shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)]">
                <TriangleAlert size={40} className='mb-3 text-[#9d6a09]'/>
                <p className={cn(siteMono.className, "text-[11px] uppercase tracking-[0.24em] text-[#9d6a09]")}>Mobile preview</p>
                <h2 className="mt-2 text-xl font-semibold text-black">移动端暂时提供只读预览</h2>
                <p className="mt-2 text-sm leading-6 text-[#333333]">
                    完整编辑体验需要更宽的工作区。你仍然可以在手机上查看当前简历预览、确认内容是否同步，并回到首页。
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-[#dad4c8] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)]">
                        <Laptop className="mb-2 h-5 w-5 text-[#01418d]"/>
                        <p className="text-sm font-medium text-black">推荐桌面继续编辑</p>
                        <p className="mt-1 text-xs leading-5 text-[#55534e]">在 1024px 以上可使用完整编辑区、预览区和工具抽屉。</p>
                    </div>
                    <div className="rounded-[24px] border border-[#dad4c8] bg-[#c1b0ff] p-4 shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)]">
                        <MonitorSmartphone className="mb-2 h-5 w-5 text-[#32037d]"/>
                        <p className="text-sm font-medium text-[#32037d]">当前模式可做快速复查</p>
                        <p className="mt-1 text-xs leading-5 text-[#32037d]">下面保留只读预览，方便确认内容和主题样式。</p>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Link href='/' className="inline-flex items-center justify-center rounded-full border border-black bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-1 hover:-rotate-2 hover:bg-[#fc7981] hover:shadow-[-7px_7px_0_#000000]">
                        返回首页
                    </Link>
                    <Link href='/editor/' className="inline-flex items-center justify-center rounded-full border border-black bg-transparent px-5 py-2.5 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-1 hover:-rotate-2 hover:bg-[#84e7a5] hover:shadow-[-7px_7px_0_#000000]">
                        刷新当前预览
                    </Link>
                </div>
            </div>

            <div className="rounded-[32px] border border-[#dad4c8] bg-white p-3 shadow-[0_1px_1px_rgba(0,0,0,0.1),_0_-1px_1px_rgba(0,0,0,0.04)_inset,_0_-0.5px_1px_rgba(0,0,0,0.05)]">
                <div className="mb-3 flex items-center justify-between px-2">
                    <div>
                        <p className={cn(siteMono.className, "text-[11px] uppercase tracking-[0.24em] text-[#55534e]")}>Paper view</p>
                        <p className="mt-1 text-sm font-semibold text-black">当前简历预览</p>
                        <p className="text-xs text-[#55534e]">移动端只读，不提供完整编辑控件</p>
                    </div>
                </div>
                <Preview
                    content={content}
                    theme={theme}
                    font={font}
                    fontScale={fontScale}
                    headingScale={headingScale}
                    lineHeightScale={lineHeightScale}
                    xPaddingScale={xPaddingScale}
                    yPaddingScale={yPaddingScale}
                    headerColor={headerColor}
                    textColor={textColor}
                    linkColor={linkColor}
                    customCss={customCss}
                    testId="editor-preview-mobile"
                    className="max-h-[60vh] min-h-[360px] rounded-[24px] border-[#dad4c8] p-4"
                />
            </div>
        </div>
    )
}
