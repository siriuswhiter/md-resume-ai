import {Coffee, Download, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";

interface ButtonsProps {
    handleExportPdf: () => void;
    isExporting: boolean;
}

export const SidebarButtons = ({handleExportPdf, isExporting}: ButtonsProps) => {
    return (
        <div className='px-4 flex gap-3 border-t p-4'>
            <Button onClick={handleExportPdf} variant="outline" size="sm" className="w-1/2" disabled={isExporting}>
                {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                ) : (
                    <Download className="h-4 w-4 mr-2"/>
                )}
                {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
            <Button size="sm" asChild   className="w-1/2">
                <Link href="mailto:xuewenjie2017@gmail.com" target="_blank">
                    <Coffee className="h-4 w-4 mr-2"/>
                    Support
                </Link>
            </Button>
        </div>
    )
}
