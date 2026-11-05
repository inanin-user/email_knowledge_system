
import type { ReactNode } from "react";
import Navigation from "@/components/Navigation";

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="min-h-[calc(100vh-56px)]">
        {children}
      </main>
    </div>
  );
}