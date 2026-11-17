import type { ReactNode } from "react";
import { Suspense } from "react";
import Navigation from "@/components/Navigation";

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Suspense fallback={<div className="h-16 shrink-0 bg-background" />}>
        <Navigation />
      </Suspense>

      <main className="min-h-0 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}