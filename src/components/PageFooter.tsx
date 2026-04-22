import React from "react";
import { cn } from "@/lib/utils";
import { siteSans } from "@/lib/siteFonts";

interface PageFooterProps {
  copyrightText?: string;
  creditText?: string;
}

export default function PageFooter({
  copyrightText,
  creditText = "Built by Sirius Whiter",
}: PageFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn(siteSans.className, "border-t border-[--ui-border] py-6")}>
      <div className="container mx-auto flex items-center justify-between px-6 md:px-10 xl:px-16">
        <p className="text-xs text-[--ui-text-muted]">
          {copyrightText ?? `© ${year} Markdown Resume AI`}
        </p>
        <p className="text-xs text-[--ui-text-muted]">{creditText}</p>
      </div>
    </footer>
  );
}
