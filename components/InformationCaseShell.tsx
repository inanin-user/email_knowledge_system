
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { label: "Overview", href: "/information-case-dialog", icon: "▦" },
  { label: "Team workload", href: "/information-case-dialog/team-workload", icon: "♧" },
  { label: "Service health", href: "/information-case-dialog/service-health", icon: "▥" },
  { label: "New Request", href: "/add-information-case", icon: "+" },
];

export default function InformationCaseShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#f5f6fa] text-[#24283d]">
      {/* Left sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[228px] flex-col bg-[#123B32] text-white">
        <div className="flex h-20 items-center gap-3 px-6">
          {/* <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#191c30] text-lg font-bold">
            
          </div> */}
          {/* <span className="text-xl font-semibold tracking-tight">
            K and I System
          </span> */}
        </div>

        <div className="px-5 pt-7">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#9298b0]">
            Workspace
          </p>
          <div className="flex items-center justify-between rounded-lg bg-[#1D4B40] px-3 py-3 text-sm">
            <span>Information Case</span>
            <span className="text-[#a4abc2]">⌄</span>
          </div>
        </div>

        <nav className="mt-8 flex-1 space-y-2 px-3">
          {navigation.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/information-case-dialog" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                  active
                    ? "bg-confirm font-semibold text-confirm-foreground"
                    : "text-white/70 hover:bg-[#1D4B40] hover:text-white"
                }`}
              >
                <span className="w-5 text-center text-lg" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#30344b] px-5 py-5">
          <div className="text-sm font-medium">Workspace Admin</div>
          <div className="mt-1 text-xs text-[#9298b0]">
            Information Case
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-[228px] flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#e7e9f0] bg-white px-8">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[#9298aa]">Information Case</span>
            <span className="text-[#c4c8d3]">/</span>
            <span className="font-semibold text-[#292d42]">
              {pathname.includes("team-workload")
                ? "Team workload"
                : pathname.includes("service-health")
                  ? "Service health"
                  : pathname.includes("add-information-case")
                    ? "New Request"
                    : "Overview"}
            </span>
          </div>

          {/* <div className="flex items-center gap-6">
            <div className="hidden items-center gap-3 rounded-lg bg-[#f5f6fa] px-4 py-2.5 text-sm text-[#9298aa] md:flex">
              <span>⌕</span>
              <span>Search information cases...</span>
            </div>
          </div> */}
        </header>

        <main className="flex-1 p-6 md:p-9">
          {children}
        </main>
      </div>
    </div>
  );
}
