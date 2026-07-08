import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/app/shell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Pencil, Trash2, Loader2, ClipboardList,
  X, Check, AlertTriangle, BookOpen, Hash, Upload,
} from "lucide-react";
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from "@/lib/api";
import type { Assignment } from "@/lib/api";
import { CardGridSkeleton } from "@/components/app/skeleton";

export const Route = createFileRoute("/assignments/")({
  head: () => ({ meta: [{ title: "Assignments — TAAI" }] }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", subject: "", total_marks: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", subject: "", topic: "", total_marks: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    const result = await getAssignments();
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setAssignments(result.data.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.subject.toLowerCase().includes(search.toLowerCase()) ||
    (a.topic || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!createForm.title.trim()) { setCreateError("Title is required."); return; }
    if (!createForm.subject.trim()) { setCreateError("Subject is required."); return; }
    if (!createForm.total_marks || Number(createForm.total_marks) <= 0) { setCreateError("Total marks must be a positive number."); return; }
    setCreateLoading(true);
    const result = await createAssignment({ title: createForm.title.trim(), subject: createForm.subject.trim(), total_marks: Number(createForm.total_marks) });
    setCreateLoading(false);
    if (result.error) { setCreateError(result.error); return; }
    setCreateForm({ title: "", subject: "", total_marks: "" });
    setShowCreate(false);
    fetchAssignments();
  }

  function startEdit(a: Assignment) {
    const id = getId(a);
    if (!id || id === "0") return;
    setEditingId(id);
    setEditForm({ title: a.title, subject: a.subject, topic: a.topic || "", total_marks: String(a.total_marks) });
  }

  async function handleEdit() {
    if (!editingId || !editForm.title.trim() || !editForm.subject.trim()) return;
    setEditLoading(true);
    const result = await updateAssignment(Number(editingId), { title: editForm.title.trim(), subject: editForm.subject.trim(), topic: editForm.topic.trim() || undefined, total_marks: Number(editForm.total_marks) || undefined });
    setEditLoading(false);
    if (result.error) { setError(result.error); return; }
    setEditingId(null);
    fetchAssignments();
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    const result = await deleteAssignment(Number(id));
    setDeleteLoading(false);
    if (result.error) {
      const friendly = result.error.includes("foreign key") || result.error.includes("constraint") || result.error.includes("Database error while deleting")
        ? "Cannot delete this assignment because it has questions, rubrics, or solutions attached. Please delete them first."
        : result.error;
      setError(friendly);
      setDeletingId(null);
      return;
    }
    setDeletingId(null);
    fetchAssignments();
  }

  function getId(a: Assignment): string { return String(a.assignment_id || a.id || 0); }

  return (
    <AppShell title="Assignments" subtitle="Create and manage your assessments">
      <div className="w-full">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card w-80">
            <Search className="size-4 text-muted-foreground" />
            <input placeholder="Search by title, subject, or topic..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
          </div>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium  hover: transition cursor-pointer shrink-0">
            <Plus className="size-4" /> New Assignment
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" /> {error}
            <button onClick={() => setError(null)} className="ml-auto cursor-pointer"><X className="size-4" /></button>
          </div>
        )}

        {/* Create modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-card rounded-lg border border-border p-6 w-full max-w-lg shadow-[0_24px_64px_-12px_oklch(0.2_0.02_280/0.25)]">
                <div className="flex items-center justify-between mb-5">
                  <div><h2 className="text-xl font-display font-bold">Create Assignment</h2><p className="text-sm text-muted-foreground mt-0.5">Set up a new assessment</p></div>
                  <button onClick={() => { setShowCreate(false); setCreateError(null); }} className="size-8 rounded-lg hover:bg-accent grid place-items-center cursor-pointer"><X className="size-4" /></button>
                </div>
                {createError && <div className="mb-4 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs">{createError}</div>}
                <form onSubmit={handleCreate} className="space-y-4">
                  <div><label className="text-xs font-medium text-muted-foreground">Title <span className="text-destructive">*</span></label><input type="text" placeholder="e.g. Midterm Exam" value={createForm.title} onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))} className="mt-1.5 w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-ring outline-none" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium text-muted-foreground">Subject <span className="text-destructive">*</span></label><input type="text" placeholder="e.g. Computer Science" value={createForm.subject} onChange={(e) => setCreateForm((p) => ({ ...p, subject: e.target.value }))} className="mt-1.5 w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-ring outline-none" /></div>
                    <div><label className="text-xs font-medium text-muted-foreground">Total Marks <span className="text-destructive">*</span></label><input type="number" min="1" placeholder="e.g. 50" value={createForm.total_marks} onChange={(e) => setCreateForm((p) => ({ ...p, total_marks: e.target.value }))} className="mt-1.5 w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-ring outline-none" /></div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => { setShowCreate(false); setCreateError(null); }} className="px-4 py-2.5 rounded-md border border-border text-sm font-medium hover:bg-accent transition cursor-pointer">Cancel</button>
                    <button type="submit" disabled={createLoading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60 cursor-pointer">{createLoading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Create</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit modal */}
        <AnimatePresence>
          {editingId !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setEditingId(null)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-card rounded-lg border border-border p-6 w-full max-w-lg shadow-[0_24px_64px_-12px_oklch(0.2_0.02_280/0.25)]">
                <div className="flex items-center justify-between mb-5">
                  <div><h2 className="text-xl font-display font-bold">Edit Assignment</h2><p className="text-sm text-muted-foreground mt-0.5">Update assignment details</p></div>
                  <button onClick={() => setEditingId(null)} className="size-8 rounded-lg hover:bg-accent grid place-items-center cursor-pointer"><X className="size-4" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-4">
                  <div><label className="text-xs font-medium text-muted-foreground">Title</label><input type="text" value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className="mt-1.5 w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-ring outline-none" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium text-muted-foreground">Subject</label><input type="text" value={editForm.subject} onChange={(e) => setEditForm((p) => ({ ...p, subject: e.target.value }))} className="mt-1.5 w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-ring outline-none" /></div>
                    <div><label className="text-xs font-medium text-muted-foreground">Total Marks</label><input type="number" min="1" value={editForm.total_marks} onChange={(e) => setEditForm((p) => ({ ...p, total_marks: e.target.value }))} className="mt-1.5 w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-ring outline-none" /></div>
                  </div>
                  <div><label className="text-xs font-medium text-muted-foreground">Topic (optional)</label><input type="text" placeholder="e.g. Recursion" value={editForm.topic} onChange={(e) => setEditForm((p) => ({ ...p, topic: e.target.value }))} className="mt-1.5 w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-ring outline-none" /></div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2.5 rounded-md border border-border text-sm font-medium hover:bg-accent transition cursor-pointer">Cancel</button>
                    <button type="submit" disabled={editLoading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60 cursor-pointer">{editLoading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Save Changes</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete modal */}
        <AnimatePresence>
          {deletingId !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setDeletingId(null)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-card rounded-lg border border-border p-6 w-full max-w-sm shadow-[0_24px_64px_-12px_oklch(0.2_0.02_280/0.25)]">
                <div className="flex items-center gap-3 mb-4"><div className="size-10 rounded-md bg-destructive/10 grid place-items-center"><Trash2 className="size-5 text-destructive" /></div><div><h3 className="font-bold">Delete Assignment</h3><p className="text-xs text-muted-foreground">This action cannot be undone.</p></div></div>
                <p className="text-sm text-muted-foreground mb-5">Are you sure? All associated questions, rubrics, and solutions will also be removed.</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setDeletingId(null)} className="px-4 py-2.5 rounded-md border border-border text-sm font-medium hover:bg-accent transition cursor-pointer">Cancel</button>
                  <button onClick={() => deletingId && handleDelete(deletingId)} disabled={deleteLoading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-destructive text-destructive-foreground text-sm font-semibold disabled:opacity-60 cursor-pointer">{deleteLoading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards */}
        {loading ? (
          <CardGridSkeleton count={6} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="size-12 text-muted-foreground/40 mb-3" />
            <h3 className="font-bold text-lg">{search ? "No assignments found" : "No assignments yet"}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">{search ? "Try a different search term." : "Create your first assignment to start grading with AI."}</p>
            {!search && <button onClick={() => setShowCreate(true)} className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer"><Plus className="size-4" /> Create Assignment</button>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a, i) => {
              const id = getId(a);
              return (
                <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group p-5 rounded-lg bg-card border border-border hover:border-primary/30 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="size-11 rounded-md bg-primary grid place-items-center text-primary-foreground text-xs font-bold">{a.subject.slice(0, 2).toUpperCase()}</div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(a)} className="size-8 rounded-lg hover:bg-accent grid place-items-center transition cursor-pointer opacity-0 group-hover:opacity-100" title="Edit"><Pencil className="size-3.5 text-muted-foreground" /></button>
                      <button onClick={() => setDeletingId(id)} className="size-8 rounded-lg hover:bg-destructive/10 grid place-items-center transition cursor-pointer opacity-0 group-hover:opacity-100" title="Delete"><Trash2 className="size-3.5 text-muted-foreground" /></button>
                    </div>
                  </div>
                  <h3 className="font-bold leading-tight mb-1 line-clamp-2">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{a.subject}</p>
                  <div className="space-y-2 mb-4">
                    {a.topic && <div className="flex items-center gap-2 text-xs text-muted-foreground"><BookOpen className="size-3.5 shrink-0" /><span className="truncate">{a.topic}</span></div>}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Hash className="size-3.5 shrink-0" /><span>Total marks: {a.total_marks}</span></div>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <Link
                      to="/assignments/$assignmentId"
                      params={{ assignmentId: String(id) }}
                      className="inline-flex items-center gap-2 text-xs text-primary font-medium hover:underline cursor-pointer"
                    >
                      <Upload className="size-3.5" /> Upload Questions & Rubrics →
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {filtered.length > 0 && <div className="mt-4 text-xs text-muted-foreground text-center">{filtered.length} assignment{filtered.length !== 1 ? "s" : ""}{search && ` matching "${search}"`}</div>}
      </div>
    </AppShell>
  );
}
