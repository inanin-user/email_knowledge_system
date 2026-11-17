"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Overview", href: "/information-case-dialog", icon: "▦" },
  { label: "Batch job", href: "/information-case-dialog/team-workload", icon: "♧" },
  { label: "Service health", href: "/information-case-dialog/service-health", icon: "▥" },
  { label: "New Request", href: "/add-information-case", icon: "+" },
];

export default function InformationCaseNavigation() {
  const pathname = usePathname();

  return (
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
  );
}