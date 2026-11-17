"use client";

import { usePathname } from "next/navigation";

export default function InformationCaseHeader() {
  const pathname = usePathname();

  const title = pathname.includes("team-workload")
    ? "Batch jobs"
    : pathname.includes("service-health")
      ? "Service health"
      : pathname.includes("add-information-case")
        ? "New Request"
        : pathname.includes("edit-information-case")
          ? "Edit Request"
          : "Overview";

  return (
    <header className="shrink-0 sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#e7e9f0] bg-white px-8">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-[#9298aa]">Information Case</span>
        <span className="text-[#c4c8d3]">/</span>
        <span className="font-semibold text-[#292d42]">
          {title}
        </span>
      </div>
    </header>
  );
}