import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/app/shell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Users,
  X,
  Check,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { getStudents, createStudent, updateStudent, deleteStudent } from "@/lib/api";
import type { Student } from "@/lib/api";
import { TableSkeleton } from "@/components/app/skeleton";

export const Route = createFileRoute("/student/")({
  head: () => ({ meta: [{ title: "Students — TAAI" }] }),
  component: StudentsPage,
});

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Add student state
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ id: "", name: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit student state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStudentId, setEditStudentId] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const result = await getStudents();
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setStudents(result.data.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filtered students
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase())
  );

  // Add student
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);

    if (!addForm.id.trim() || !addForm.name.trim()) {
      setAddError("Both Student ID and Name are required.");
      return;
    }

    setAddLoading(true);
    const result = await createStudent({
      student_id: addForm.id.trim(),
      name: addForm.name.trim(),
    });
    setAddLoading(false);

    if (result.error) {
      if (result.status === 409) {
        setAddError("A student with this ID already exists.");
      } else {
        setAddError(result.error);
      }
      return;
    }

    setAddForm({ id: "", name: "" });
    setShowAdd(false);
    fetchStudents();
  }

  // Edit student
  function startEdit(student: Student) {
    setEditingId(student.student_id);
    setEditName(student.name);
    setEditStudentId(student.student_id);
  }

  async function handleEdit(studentId: string) {
    if (!editName.trim() || !editStudentId.trim()) return;
    setEditLoading(true);
    const result = await updateStudent(studentId, {
      name: editName.trim(),
      student_id: editStudentId.trim(),
    });
    setEditLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setEditingId(null);
    fetchStudents();
  }

  // Delete student
  async function handleDelete(studentId: string) {
    setDeleteLoading(true);
    const result = await deleteStudent(studentId);
    setDeleteLoading(false);

    if (result.error) {
      setError(result.error);
      setDeletingId(null);
      return;
    }

    setDeletingId(null);
    fetchStudents();
  }

  return (
    <AppShell title="Students" subtitle="Manage your student roster">
      <div className="w-full">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card w-72">
            <Search className="size-4 text-muted-foreground" />
            <input
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium  hover: transition cursor-pointer shrink-0"
          >
            <Plus className="size-4" /> Add Student
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" /> {error}
            <button onClick={() => setError(null)} className="ml-auto cursor-pointer">
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Add student form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleAdd}
                className="mb-4 p-4 rounded-lg bg-card border border-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">Add New Student</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdd(false);
                      setAddError(null);
                    }}
                    className="size-7 rounded-lg hover:bg-accent grid place-items-center cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {addError && (
                  <div className="px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs">
                    {addError}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Student ID <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2021001"
                      value={addForm.id}
                      onChange={(e) => setAddForm((p) => ({ ...p, id: e.target.value }))}
                      className="mt-1 w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-ring outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alice Johnson"
                      value={addForm.name}
                      onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                      className="mt-1 w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-ring outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdd(false);
                      setAddError(null);
                    }}
                    className="px-4 py-2 rounded-md border border-border text-sm hover:bg-accent transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60 cursor-pointer"
                  >
                    {addLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    Add
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Student list */}
        {loading ? (
          <TableSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="size-12 text-muted-foreground/40 mb-3" />
            <h3 className="font-bold text-lg">
              {search ? "No students found" : "No students yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search
                ? "Try a different search term."
                : "Add your first student to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground grid grid-cols-[120px_1fr_140px]">
              <span>Student ID</span>
              <span>Name</span>
              <span className="text-right">Actions</span>
            </div>

            {filtered.map((student) => (
              <motion.div
                key={student.student_id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-[120px_1fr_140px] items-center px-4 py-3 rounded-md border border-border bg-card hover:bg-accent/50 transition"
              >
                {/* Student ID (editable) */}
                <div className="min-w-0">
                  {editingId === student.student_id ? (
                    <input
                      type="text"
                      value={editStudentId}
                      onChange={(e) => setEditStudentId(e.target.value)}
                      className="w-full px-2 py-1 rounded-md border border-ring bg-background text-sm font-mono outline-none"
                    />
                  ) : (
                    <span className="text-sm font-mono text-muted-foreground">
                      {student.student_id}
                    </span>
                  )}
                </div>

                {/* Name (editable) */}
                <div className="min-w-0 pr-4">
                  {editingId === student.student_id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEdit(student.student_id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="w-full px-2 py-1 rounded-lg border border-ring bg-background text-sm outline-none"
                    />
                  ) : (
                    <span className="text-sm font-medium truncate block">
                      {student.name}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  {editingId === student.student_id ? (
                    <>
                      <button
                        onClick={() => handleEdit(student.student_id)}
                        disabled={editLoading}
                        className="size-8 rounded-lg bg-success/10 text-success grid place-items-center hover:bg-success/20 transition cursor-pointer"
                      >
                        {editLoading ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Check className="size-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="size-8 rounded-lg hover:bg-accent grid place-items-center transition cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </button>
                    </>
                  ) : deletingId === student.student_id ? (
                    <>
                      <span className="text-xs text-destructive mr-1">Delete?</span>
                      <button
                        onClick={() => handleDelete(student.student_id)}
                        disabled={deleteLoading}
                        className="size-8 rounded-lg bg-destructive/10 text-destructive grid place-items-center hover:bg-destructive/20 transition cursor-pointer"
                      >
                        {deleteLoading ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Check className="size-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="size-8 rounded-lg hover:bg-accent grid place-items-center transition cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/student/$studentId"
                        params={{ studentId: student.id }}
                        className="size-8 rounded-lg hover:bg-primary/10 grid place-items-center transition cursor-pointer"
                        title="Details"
                      >
                        <Eye className="size-3.5 text-primary" />
                      </Link>
                      <button
                        onClick={() => startEdit(student)}
                        className="size-8 rounded-lg hover:bg-accent grid place-items-center transition cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="size-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => setDeletingId(student.student_id)}
                        className="size-8 rounded-lg hover:bg-destructive/10 grid place-items-center transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="size-3.5 text-muted-foreground" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}

            <div className="pt-2 text-xs text-muted-foreground text-center">
              {filtered.length} student{filtered.length !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
