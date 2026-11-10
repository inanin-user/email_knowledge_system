import type { ReactNode } from "react";
import InformationCaseShell from "@/components/InformationCaseShell";

export default function InformationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <InformationCaseShell>{children}</InformationCaseShell>;
}
