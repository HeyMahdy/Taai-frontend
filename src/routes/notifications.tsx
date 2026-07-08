import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { Bell, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — TAAI" }] }),
  component: Notifications,
});

function Notifications() {
  return (
    <AppShell title="Notifications">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Bell className="size-12 text-muted-foreground/40 mb-3" />
        <h3 className="font-bold text-lg">Coming Soon</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Notifications are not yet available. Check back later.
        </p>
        <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition cursor-pointer">
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link>
      </div>
    </AppShell>
  );
}
