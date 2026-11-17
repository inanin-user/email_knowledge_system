import type { ReactNode } from "react";
import { Suspense } from "react";
import InformationCaseShell from "@/components/InformationCaseShell";

export default function InformationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-full min-h-0 w-full overflow-hidden">
      <Suspense
        fallback={<div className="h-full min-h-screen bg-[#f5f6fa]" />}
      >
        <InformationCaseShell>
          {children}
        </InformationCaseShell>
      </Suspense>
    </div>
  );
}