import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Brain } from "lucide-react";
import { Logo } from "@/components/app/logo";
import { login } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — TAAI" }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!form.password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    const result = await login({
      email: form.email.trim(),
      password: form.password,
    });

    setLoading(false);

    if (result.error) {
      if (result.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(result.error);
      }
      return;
    }

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass rounded-2xl p-4 text-primary-foreground max-w-sm">
              <div className="flex items-center gap-2 text-xs mb-2 opacity-80">
                <Brain className="size-3.5" /> AI evaluation complete
              </div>
              <div className="text-2xl font-bold">94% confidence</div>
              <div className="text-xs opacity-80 mt-1">Newton's Laws · Rahim Ahmed</div>
            </div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="glass rounded-2xl p-4 text-primary-foreground max-w-sm ml-12"
            >
              <div className="text-xs opacity-80 mb-1">Class average improving</div>
              <div className="flex items-end gap-1 h-12">
                {[40, 55, 50, 70, 65, 80, 88].map((h, i) => (
                  <div key={i} className="flex-1 bg-card/30 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </motion.div>
          </motion.div>
          <h2 className="relative text-4xl font-display font-bold text-primary-foreground mt-12 max-w-md leading-tight">
            Grade smarter, teach better.
          </h2>
          <p className="relative text-primary-foreground/80 mt-3 max-w-md">
            Join educators across Bangladesh using AI-assisted assessment.
          </p>
        </div>
        <div className="relative text-primary-foreground/60 text-sm">
          "Cut my grading time by 80%." — Prof. Mahmud Hasan, BRAC University
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <Logo size="default" className="text-foreground" />
            </Link>
          </div>

          <h1 className="text-3xl font-display font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to continue</p>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email
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
                Password
              </label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-3 rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring transition">
                <Lock className="size-4 text-muted-foreground shrink-0" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="bg-transparent outline-none text-sm flex-1"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-primary rounded" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-glow transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
