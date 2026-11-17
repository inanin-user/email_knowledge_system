import type { ReactNode } from "react";
import Link from "next/link";
import InformationCaseNavigation from "./InformationCaseNavigation";
import InformationCaseHeader from "./InformationCaseHeader";

export default function InformationCaseShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-[#f5f6fa] text-[#24283d]">
      {/* Left sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[228px] flex-col bg-[#123B32] text-white">
        <div className="flex h-20 items-center gap-3 px-6" />

        <div className="px-5 pt-7">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#9298b0]">
            Workspace
          </p>

          <div className="flex items-center justify-between rounded-lg bg-[#1D4B40] px-3 py-3 text-sm">
            <span>Information Case</span>
            <span className="text-[#a4abc2]">⌄</span>
          </div>
        </div>

        <InformationCaseNavigation />

        <div className="border-t border-[#30344b] px-5 py-5">
          <div className="text-sm font-medium">Workspace Admin</div>
          <div className="mt-1 text-xs text-[#9298b0]">
            Information Case
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-[228px] flex min-w-0 min-h-0 flex-1 flex-col">
        <InformationCaseHeader />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-auto">
          <div className="mx-auto w-full max-w-[1500px] p-5 sm:p-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}