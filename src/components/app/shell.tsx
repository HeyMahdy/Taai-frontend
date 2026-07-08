import { ReactNode } from "react";
import { AppSidebar } from "./sidebar";
import { TopBar } from "./topbar";

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} subtitle={subtitle} />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
