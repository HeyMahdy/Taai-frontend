import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/shell";
import {
  Users, ClipboardList, Plus, ArrowRight, Loader2, BookOpen, Hash,
} from "lucide-react";
import { getStudents, getAssignments } from "@/lib/api";
import { getProfile } from "@/lib/api";
import type { UserProfile, Assignment } from "@/lib/api";
import { DashboardSkeleton } from "@/components/app/skeleton";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — TAAI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const profileRes = await getProfile();
      if (profileRes.data) setProfile(profileRes.data);

      const studentsRes = await getStudents();
      if (studentsRes.data) setStudentCount(studentsRes.data.count);

      const assignmentsRes = await getAssignments();
      if (assignmentsRes.data) setAssignments(assignmentsRes.data.data);

      setLoading(false);
    }
    load();
  }, []);

  const displayName = profile?.display_name || profile?.email?.split("@")[0] || "Teacher";
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <DashboardSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell title={`${greeting}, ${displayName}`} subtitle={dateStr}>
      <div className="w-full space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="TOTAL STUDENTS" value={String(studentCount)} sub={`${studentCount} registered`} />
          <StatCard label="ASSIGNMENTS" value={String(assignments.length)} sub={`${assignments.length} total`} />
          <StatCard label="PENDING" value="—" sub="No grading API yet" />
          <StatCard label="AVG. SCORE" value="—" sub="No grading API yet" />
        </div>

        {/* Quick action */}
        <div className="flex items-center gap-3">
          <Link
            to="/assignments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer"
          >
            <Plus className="size-4" /> New Assignment
          </Link>
          <Link
            to="/student"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition cursor-pointer"
          >
            <Users className="size-4" /> Manage Students
          </Link>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Assignments list */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-bold text-sm">Assignments</h2>
              <Link to="/assignments" className="text-xs text-primary font-medium hover:underline cursor-pointer flex items-center gap-1">
                Manage all <ArrowRight className="size-3" />
              </Link>
            </div>

            {assignments.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <ClipboardList className="size-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No assignments yet.</p>
                <Link to="/assignments" className="mt-3 inline-flex items-center gap-2 text-xs text-primary font-medium cursor-pointer">
                  <Plus className="size-3" /> Create your first
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {assignments.map((a) => {
                  const id = a.assignment_id || a.id || 0;
                  return (
                    <Link
                      key={id}
                      to="/assignments/$assignmentId"
                      params={{ assignmentId: String(id) }}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/50 transition cursor-pointer"
                    >
                      <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center text-xs font-bold shrink-0">
                        {a.subject.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{a.title}</div>
                        <div className="text-xs text-muted-foreground">{a.subject}{a.topic ? ` · ${a.topic}` : ""}</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Hash className="size-3" /> {a.total_marks} pts
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Quick info */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-bold text-sm mb-3">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-xs truncate max-w-[160px]">{profile?.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Students</span>
                  <span className="font-medium">{studentCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assignments</span>
                  <span className="font-medium">{assignments.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium text-xs">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent students */}
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="font-bold text-sm">Students</h3>
                <Link to="/student" className="text-xs text-primary font-medium hover:underline cursor-pointer">
                  View all
                </Link>
              </div>
              <div className="px-5 py-4">
                {studentCount === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No students added yet.</p>
                ) : (
                  <div className="flex items-center gap-3">
                    <Users className="size-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{studentCount} students</div>
                      <div className="text-xs text-muted-foreground">registered in your roster</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-5 rounded-lg border border-border bg-card">
      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">{label}</div>
      <div className="text-3xl font-bold leading-none">{value}</div>
      <div className="text-xs text-muted-foreground mt-1.5">{sub}</div>
    </div>
  );
}
