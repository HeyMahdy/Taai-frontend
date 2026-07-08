import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/shell";
import { ArrowLeft, Loader2, User, Hash, Calendar, Shield, ClipboardList } from "lucide-react";
import { getStudent, getStudentAssignments } from "@/lib/api";
import type { Student, StudentAssignmentMark } from "@/lib/api";
import { DetailSkeleton } from "@/components/app/skeleton";

export const Route = createFileRoute("/student/$studentId")({
  head: () => ({ meta: [{ title: "Student Details — TAAI" }] }),
  component: StudentDetail,
});

function StudentDetail() {
  const { studentId } = Route.useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [assignments, setAssignments] = useState<StudentAssignmentMark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // getStudent uses UUID (id)
      const result = await getStudent(studentId);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setStudent(result.data.data);
        // getStudentAssignments uses UUID (id)
        const marksResult = await getStudentAssignments(result.data.data.id);
        if (marksResult.data) {
          setAssignments(marksResult.data.data);
        }
      }

      setLoading(false);
    }
    load();
  }, [studentId]);

  if (loading) {
    return (
      <AppShell title="Student Details">
        <DetailSkeleton />
      </AppShell>
    );
  }

  if (error || !student) {
    return (
      <AppShell title="Student Details">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <User className="size-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-bold text-lg">Student not found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error || "This student doesn't exist."}
          </p>
          <Link
            to="/student"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-medium hover:bg-accent transition cursor-pointer"
          >
            <ArrowLeft className="size-4" /> Back to Students
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Student Details" subtitle={student.name}>
      <div className="w-full">
        {/* Back button */}
        <Link
          to="/student"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition cursor-pointer mb-6"
        >
          <ArrowLeft className="size-4" /> Back to Students
        </Link>

        {/* Student info card */}
        <div className="max-w-2xl">
          <div className="p-6 rounded-lg bg-card border border-border">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="size-16 rounded-lg bg-primary grid place-items-center text-primary-foreground text-xl font-bold">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">{student.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Student ID: {student.student_id}</p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-md bg-muted/50 border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <Hash className="size-3.5" /> Student ID
                </div>
                <div className="text-base font-mono font-semibold">{student.student_id}</div>
              </div>

              <div className="p-4 rounded-md bg-muted/50 border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <User className="size-3.5" /> Full Name
                </div>
                <div className="text-base font-semibold">{student.name}</div>
              </div>

              <div className="p-4 rounded-md bg-muted/50 border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <Shield className="size-3.5" /> Teacher ID
                </div>
                <div className="text-sm font-mono text-muted-foreground break-all">
                  {student.teacher_id}
                </div>
              </div>

              <div className="p-4 rounded-md bg-muted/50 border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <Calendar className="size-3.5" /> Added On
                </div>
                <div className="text-base font-semibold">
                  {new Date(student.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(student.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Marks */}
          <div className="mt-6 rounded-md border border-border bg-card">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <ClipboardList className="size-4 text-muted-foreground" />
              <h3 className="font-bold text-sm">Assignment Marks</h3>
              {assignments.length > 0 && <span className="text-xs text-muted-foreground ml-auto">{assignments.length} assignments</span>}
            </div>

            {assignments.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No graded assignments yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Assignment</th>
                    <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Subject</th>
                    <th className="text-right px-5 py-2.5 font-medium text-muted-foreground">Score</th>
                    <th className="text-right px-5 py-2.5 font-medium text-muted-foreground">Questions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {assignments.map((a) => (
                    <tr key={a.assignment_id} className="hover:bg-accent/50 transition">
                      <td className="px-5 py-3">
                        <Link
                          to="/assignments/$assignmentId"
                          params={{ assignmentId: String(a.assignment_id) }}
                          className="font-medium text-primary hover:underline cursor-pointer"
                        >
                          {a.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{a.subject}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-bold">{a.marks_obtained}</span>
                        <span className="text-muted-foreground"> / {a.assignment_total_marks}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{a.graded_question_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
