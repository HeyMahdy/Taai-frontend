import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/app/logo";
import { signup } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — TAAI" }] }),
  component: Register,
});

function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    display_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!form.password.trim()) {
      setError("Password is required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const result = await signup({
      email: form.email.trim(),
      password: form.password,
      display_name: form.display_name.trim() || undefined,
    });

    setLoading(false);

    if (result.error) {
      if (result.status === 409) {
        setError("This email is already registered. Try signing in instead.");
      } else {
        setError(result.error);
      }
      return;
    }

    // Success — redirect to dashboard
    nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <Link to="/" className="relative flex items-center gap-2 text-primary-foreground">
          <Logo size="default" className="text-primary-foreground" />
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-display font-bold text-primary-foreground max-w-md leading-tight">
            Built for Bangladeshi classrooms.
          </h2>
          <p className="text-primary-foreground/80 mt-3 max-w-md">
            AI-powered grading and feedback for university educators.
          </p>
        </div>
        <div className="relative text-primary-foreground/60 text-sm">© 2025 TAAI</div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <Logo size="default" className="text-foreground" />
            </Link>
          </div>

          <h1 className="text-3xl font-display font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-1">Start grading smarter in minutes</p>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Display Name */}
            <div>
              <label htmlFor="display_name" className="text-xs font-medium text-muted-foreground">
                Full name
              </label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-3 rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring transition">
                <User className="size-4 text-muted-foreground shrink-0" />
                <input
                  id="display_name"
                  name="display_name"
                  type="text"
                  placeholder="Dr. Smith"
                  value={form.display_name}
                  onChange={handleChange}
                  className="bg-transparent outline-none text-sm flex-1"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email <span className="text-destructive">*</span>
              </label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-3 rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring transition">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="teacher@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="bg-transparent outline-none text-sm flex-1"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-3 rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring transition">
                <Lock className="size-4 text-muted-foreground shrink-0" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="bg-transparent outline-none text-sm flex-1"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">
                Confirm password <span className="text-destructive">*</span>
              </label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-3 rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring transition">
                <Lock className="size-4 text-muted-foreground shrink-0" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="bg-transparent outline-none text-sm flex-1"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-glow transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Creating account...
                </>
              ) : (
                <>
                  Create account <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
