import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/shell";
import { User, Save, Loader2, LogOut, CheckCircle2 } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import type { UserProfile } from "@/lib/api";
import { SettingsSkeleton } from "@/components/app/skeleton";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — TAAI" }] }),
  component: Settings,
});

function Settings() {
  const nav = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const result = await getProfile();
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      if (result.data) {
        setProfile(result.data);
        setDisplayName(result.data.display_name || "");
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    const result = await updateProfile({
      display_name: displayName.trim() || undefined,
    });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data) {
      setProfile(result.data);
      setDisplayName(result.data.display_name || "");
    }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  function handleLogout() {
    clearToken();
    nav({ to: "/login" });
  }

  if (loading) {
    return (
      <AppShell title="Settings" subtitle="Manage your profile">
        <SettingsSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings" subtitle="Manage your profile">
      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <User className="size-5 text-primary" />
            <h3 className="font-bold text-lg">Profile</h3>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-4 py-3 rounded-md bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
              <CheckCircle2 className="size-4" /> Profile updated successfully.
            </div>
          )}

          {/* Read-only info */}
          <div className="mb-6 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <div className="mt-1 px-3 py-2.5 rounded-md border border-border bg-muted/50 text-sm text-muted-foreground">
                {profile?.email}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Member since</label>
              <div className="mt-1 px-3 py-2.5 rounded-md border border-border bg-muted/50 text-sm text-muted-foreground">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="display_name" className="text-xs font-medium text-muted-foreground">
                Display name
              </label>
              <input
                id="display_name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="mt-1 w-full px-3 py-2.5 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-ring outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold  hover: transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" /> Save changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Logout */}
        <div className="p-6 rounded-lg bg-card border border-border">
          <h3 className="font-bold text-lg mb-2">Session</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Sign out of your account on this device.
          </p>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>
    </AppShell>
  );
}
