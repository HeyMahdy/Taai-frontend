import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { FileText, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/rubric")({
  head: () => ({ meta: [{ title: "Rubric Builder — TAAI" }] }),
  component: RubricBuilder,
});

function RubricBuilder() {
  return (
    <AppShell title="Rubric Builder">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="size-12 text-muted-foreground/40 mb-3" />
        <h3 className="font-bold text-lg">Moved</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Rubrics are now managed per assignment. Go to an assignment to upload and manage rubrics.
        </p>
        <Link to="/assignments" className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition cursor-pointer">
          <ArrowLeft className="size-4" /> Go to Assignments
        </Link>
      </div>
    </AppShell>
  );
}
