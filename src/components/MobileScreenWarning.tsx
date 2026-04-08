import {Laptop, MonitorSmartphone, TriangleAlert} from "lucide-react";
import Link from "next/link";
import Preview from "@/components/preview/Preview";

interface MobileScreenWarningProps {
    content?: string;
    theme: string;
    font: string;
}

export default function MobileScreenWarning({content, theme, font}: MobileScreenWarningProps) {
    return (
        <div className="mobile-warning space-y-4 px-4 py-5 lg:hidden">
            <div className="rounded-[28px] border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
                <TriangleAlert size={40} className='mb-3 text-amber-600'/>
                <h2 className="text-xl font-semibold text-slate-900">移动端暂时提供只读预览</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    完整编辑体验需要更宽的工作区。你仍然可以在手机上查看当前简历预览、确认内容是否同步，并回到首页。
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                        <Laptop className="mb-2 h-5 w-5 text-sky-600"/>
                        <p className="text-sm font-medium text-slate-900">推荐桌面继续编辑</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">在 1024px 以上可使用完整编辑区、预览区和工具抽屉。</p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                        <MonitorSmartphone className="mb-2 h-5 w-5 text-sky-600"/>
                        <p className="text-sm font-medium text-slate-900">当前模式可做快速复查</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">下面保留只读预览，方便确认内容和主题样式。</p>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Link href='/' className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
                        返回首页
                    </Link>
                    <Link href='/editor/' className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                        刷新当前预览
                    </Link>
                </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white/90 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <div className="mb-3 flex items-center justify-between px-2">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">当前简历预览</p>
                        <p className="text-xs text-slate-500">移动端只读，不提供完整编辑控件</p>
                    </div>
                </div>
                <Preview
                    content={content}
                    theme={theme}
                    font={font}
                    testId="editor-preview-mobile"
                    className="max-h-[60vh] min-h-[360px] rounded-[24px] border-slate-200 p-4"
                />
            </div>
        </div>
    )
}
