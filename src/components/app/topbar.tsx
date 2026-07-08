import { Link, useNavigate } from "@tanstack/react-router";
import { Sun, Moon, Settings, LogOut, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getProfile } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import type { UserProfile } from "@/lib/api";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const nav = useNavigate();
  const [dark, setDark] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    async function load() {
      const result = await getProfile();
      if (result.data) setProfile(result.data);
    }
    load();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  function handleLogout() {
    clearToken();
    nav({ to: "/login" });
  }

  const displayName = profile?.display_name || profile?.email?.split("@")[0] || "Teacher";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>

        {/* New Assignment button */}
        <Link
          to="/assignments"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary/90 transition"
        >
          <Plus className="size-4" /> New Assignment
        </Link>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          className="size-10 rounded-md border border-border bg-card grid place-items-center hover:bg-accent transition cursor-pointer"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition cursor-pointer"
          >
            <div className="size-9 rounded-full bg-primary grid place-items-center text-primary-foreground text-xs font-bold">
              {initials}
            </div>
            <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
              {displayName}
            </span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-card shadow-[0_8px_32px_-8px_oklch(0.2_0.02_280/0.15)] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border">
                <div className="text-sm font-medium truncate">{displayName}</div>
                <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
              </div>
              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition cursor-pointer"
                >
                  <Settings className="size-4 text-muted-foreground" /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition cursor-pointer"
                >
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
