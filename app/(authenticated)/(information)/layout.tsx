import type { ReactNode } from "react";
import InformationCaseShell from "@/components/InformationCaseShell";
import { Suspense } from "react";

export default function InformationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f6fa]" />}>
      <InformationCaseShell>
        {children}
      </InformationCaseShell>
    </Suspense>
  );
}