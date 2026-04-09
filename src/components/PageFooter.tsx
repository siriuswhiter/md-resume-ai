import React from "react";

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
    <footer>
      <div className="container mx-auto flex flex-col-reverse justify-between gap-2 px-8 py-4 md:flex-row md:px-16">
        <p className="text-gray-500">
          {copyrightText ?? `© ${year} Markdown Resume AI. All rights reserved.`}
        </p>
        <p className="text-gray-500">{creditText}</p>
      </div>
    </footer>
  );
}
