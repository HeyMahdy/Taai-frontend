import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { Logo } from "@/components/app/logo";
import { isAuthenticated } from "@/lib/auth";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  Brain,
  BookOpen,
  FileCheck2,
  MessageSquareText,
  Quote,
  ScanText,
  Sparkles,
  Star,
  Upload,
} from "lucide-react";

const HERO_TASKS = [
  { icon: BookOpen, title: "Lesson plan ready", detail: "45 min flow + 5 checks" },
  { icon: Bot, title: "Live misconceptions", detail: "Flags confusion in real time" },
  { icon: MessageSquareText, title: "Feedback drafts", detail: "Tone-matched to student level" },
];

const PILLARS = [
  {
    icon: BookOpen,
    title: "Plan lessons fast",
    description: "Generate objectives, examples, and exit tickets in minutes.",
  },
  {
    icon: Brain,
    title: "Guide instruction",
    description: "Spot weak concepts and get on-the-fly reteach prompts.",
  },
  {
    icon: MessageSquareText,
    title: "Coach every student",
    description: "Personalized feedback for essays, labs, and short answers.",
  },
  {
    icon: BarChart3,
    title: "Track growth",
    description: "Class trends, mastery heatmaps, and at-risk alerts.",
  },
];

const DAILY_FLOW = [
  {
    step: "01",
    title: "Before class",
    description: "Plan, prep, and predict where students will struggle.",
    chips: ["Lesson plan", "Warm-up quiz", "Misconception list"],
  },
  {
    step: "02",
    title: "During class",
    description: "Live cues for pacing, questions, and quick checks.",
    chips: ["Pace guide", "Cold-call list", "Exit ticket"],
  },
  {
    step: "03",
    title: "After class",
    description: "Summaries, grading, and next-day reteach tips.",
    chips: ["Auto feedback", "Score summary", "Parent note"],
  },
];

const WORKFLOW = [
  {
    icon: Upload,
    title: "Capture student work",
    description: "Upload scans, PDFs, or photos from classwork and homework.",
  },
  {
    icon: ScanText,
    title: "Understand responses",
    description: "OCR plus rubric-aware reasoning for Bangla and English.",
  },
  {
    icon: Brain,
    title: "Coach and reteach",
    description: "Get targeted explanations and examples for weak topics.",
  },
  {
    icon: FileCheck2,
    title: "Summarize progress",
    description: "Auto-generate class insights and shareable updates.",
  },
];

const INSIGHTS = [
  "42% of class struggled with Algebraic Expressions",
  "Writing clarity improved 18% since last term",
  "6 students flagged for targeted support",
];

const TESTIMONIALS = [
  {
    name: "Prof. Mahmud Hasan",
    role: "BRAC University",
    quote: "My prep time dropped by half and feedback quality went up.",
  },
  {
    name: "Ayesha Rahman",
    role: "Viqarunnisa Noon School",
    quote: "The assistant catches misconceptions before exam week.",
  },
  {
    name: "Tanzim Chowdhury",
    role: "United International University",
    quote: "Lesson plans finally match how my students actually learn.",
  },
];

const HEATMAP_LEVELS = Array.from({ length: 49 }, (_, i) => (Math.sin(i * 0.75) + 1) / 2);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TAAI — AI Teaching Assistant for Smarter Classrooms" },
      {
        name: "description",
        content:
          "Plan lessons, guide instruction, and deliver feedback with an AI teaching assistant built for Bangladeshi educators.",
      },
      { property: "og:title", content: "TAAI — AI Teaching Assistant" },
      { property: "og:description", content: "Your co-teacher for lesson planning, grading, and student insights." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  const loggedIn = isAuthenticated();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <motion.div
        className="fixed top-4 left-0 right-0 z-40 mx-4 md:mx-8 lg:mx-12"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: scrolled ? 0 : -100, opacity: scrolled ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl border border-border bg-background/70 backdrop-blur-xl shadow-[0_4px_24px_-4px_oklch(0.2_0.02_280/0.08)]">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" className="text-foreground" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#workflow" className="hover:text-foreground transition">Workflow</a>
            <a href="#analytics" className="hover:text-foreground transition">Analytics</a>
            <a href="#testimonials" className="hover:text-foreground transition">Testimonials</a>
          </div>
          <div className="flex items-center gap-2">
            {loggedIn ? (
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold transition-all hover:bg-primary/90"
              >
                <span>Dashboard</span>
                <span className="size-7 rounded-full bg-primary-foreground text-primary grid place-items-center transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-primary transition">Sign in</Link>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold transition-all hover:bg-primary/90"
                >
                  <span>Sign up</span>
                  <span className="size-7 rounded-full bg-primary-foreground text-primary grid place-items-center transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </Link>
              </>
            )}
          </div>
        </nav>
      </motion.div>

      {/* Static top nav (visible before scroll) */}
      <nav className="relative z-30 max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="default" className="text-foreground" />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#workflow" className="hover:text-foreground transition">Workflow</a>
          <a href="#analytics" className="hover:text-foreground transition">Analytics</a>
          <a href="#testimonials" className="hover:text-foreground transition">Testimonials</a>
        </div>
        <div className="flex items-center gap-2">
          {loggedIn ? (
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold transition-all hover:bg-primary/90"
            >
              <span>Dashboard</span>
              <span className="size-7 rounded-full bg-primary-foreground text-primary grid place-items-center transition-transform group-hover:translate-x-0.5">
                <ArrowUpRight className="size-3.5" />
              </span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-primary transition">Sign in</Link>
              <Link
                to="/register"
                className="group inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold transition-all hover:bg-primary/90"
              >
                <span>Sign up</span>
                <span className="size-7 rounded-full bg-primary-foreground text-primary grid place-items-center transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[80vh]">
        <div className="absolute inset-0 hero-aurora pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 hero-sweep pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 hero-veil pointer-events-none" aria-hidden="true" />
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-20 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium mb-6">
              <span className="size-1.5 rounded-full bg-success animate-pulse-glow" />
              AI co-teacher for busy classrooms
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight">
              Your <span className="font-handwriting font-normal italic text-primary">AI Teaching Assistant</span>
              <br />
              plans, guides, and follows up
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Lesson planning, live classroom cues, grading, and student insights in one place.
              Built for university classrooms across Bangladesh.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to={loggedIn ? "/dashboard" : "/register"}
                className="group inline-flex items-center gap-4 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold transition-all hover:bg-primary/90"
              >
                <span>{loggedIn ? "Go to Dashboard" : "Get Started"}</span>
                <span className="size-9 rounded-full bg-primary-foreground text-primary grid place-items-center transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
              <a href="#workflow" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-card font-semibold hover:bg-accent transition">
                See Workflow
              </a>
            </div>
            <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-xs text-muted-foreground">
              <div><span className="text-2xl font-bold text-foreground block">6 hrs</span> saved weekly</div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div><span className="text-2xl font-bold text-foreground block">48</span> students tracked</div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div><span className="text-2xl font-bold text-foreground block">94%</span> feedback quality</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-12 relative">
            <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-card text-left">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Assistant session</span>
                <span>Class XI · Physics</span>
              </div>
              <div className="mt-4 rounded-2xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Lesson focus</div>
                    <div className="text-lg font-semibold mt-1">Newton's Laws · 45 min</div>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-success/15 text-success text-xs font-medium">Ready</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded-full bg-muted">3 misconceptions</span>
                  <span className="px-2 py-1 rounded-full bg-muted">5 checks</span>
                  <span className="px-2 py-1 rounded-full bg-muted">Exit ticket</span>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {HERO_TASKS.map((task, i) => (
                  <motion.div
                    key={task.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.1 }}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-3"
                  >
                    <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
                      <task.icon className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{task.title}</div>
                      <div className="text-xs text-muted-foreground">{task.detail}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground">Auto feedback draft</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Rahim Ahmed:</span> Strong explanation, but mention equal
                  and opposite forces in 3rd Law example.
                </p>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity }}
              className="hidden sm:flex absolute -top-6 left-6 items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs shadow-card"
            >
              <div className="size-7 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <Bot className="size-4" />
              </div>
              Misconception alert
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="hidden sm:flex absolute -bottom-6 right-8 items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs shadow-card"
            >
              <div className="size-7 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <MessageSquareText className="size-4" />
              </div>
              Feedback ready in 2 min
            </motion.div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.2, repeat: Infinity }}
              className="hidden md:flex absolute top-1/2 -left-10 items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs shadow-card"
            >
              <div className="size-7 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <BookOpen className="size-4" />
              </div>
              Slide deck generated
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
          <div>
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Teaching assistant</div>
            <h2 className="text-4xl md:text-5xl font-display font-bold">Before, during, after class - covered</h2>
            <p className="text-muted-foreground mt-4 max-w-xl">
              From lesson planning to grading and parent updates, the assistant keeps your class moving and your
              students supported.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {PILLARS.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="p-5 rounded-2xl border border-border bg-card shadow-card"
                >
                  <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3">
                    <pillar.icon className="size-5" />
                  </div>
                  <div className="font-semibold">{pillar.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{pillar.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Daily teaching loop</div>
              <div className="text-xs text-muted-foreground">Class XI Physics</div>
            </div>
            <div className="mt-5 space-y-5">
              {DAILY_FLOW.map((flow) => (
                <div key={flow.title} className="flex gap-4">
                  <div className="text-2xl font-display text-muted-foreground">{flow.step}</div>
                  <div>
                    <div className="font-semibold">{flow.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{flow.description}</div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {flow.chips.map((chip) => (
                        <span key={chip} className="px-2 py-1 rounded-full bg-muted">{chip}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="workflow" className="bg-muted/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Workflow</div>
            <h2 className="text-4xl md:text-5xl font-display font-bold">From student work to teaching moves</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {WORKFLOW.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="relative p-6 rounded-2xl bg-card border border-border shadow-card"
              >
                <div className="text-4xl font-display text-muted-foreground mb-3">0{i + 1}</div>
                <step.icon className="size-6 text-primary mb-3" />
                <h3 className="font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics showcase */}
      <section id="analytics" className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Analytics</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">See what your class actually understands</h2>
          <p className="text-muted-foreground mb-6">
            Heatmaps, weak-topic alerts, and pacing cues surface patterns that gradebooks miss.
            Identify struggling students before exam week and reteach with confidence.
          </p>
          <ul className="space-y-3">
            {INSIGHTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm">
                <span className="size-5 rounded-full bg-success/15 text-success grid place-items-center"><FileCheck2 className="size-3" /></span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="grid grid-cols-7 gap-1.5">
            {HEATMAP_LEVELS.map((intensity, i) => (
              <div
                key={i}
                className="aspect-square rounded-md"
                style={{ background: `oklch(0.58 0.22 295 / ${0.1 + intensity * 0.75})` }}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Topic mastery heatmap · 7 weeks</span>
            <span>Low → High</span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-muted/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-16">Trusted by teachers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-card border border-border shadow-card">
                <Quote className="size-6 text-primary mb-3" />
                <p className="text-sm mb-4 leading-relaxed">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary grid place-items-center text-primary-foreground text-xs font-bold">
                    {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mt-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="size-3 fill-warning text-warning" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 md:p-20 text-center shadow-card">
          <div className="absolute -top-20 left-10 size-64 rounded-full bg-primary/10 blur-3xl opacity-70" />
          <div className="absolute -bottom-24 right-0 size-72 rounded-full bg-accent/60 blur-3xl opacity-70" />
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">Meet your AI teaching assistant</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Plan faster, teach smarter, and give every student the feedback they deserve.
            </p>
            <Link
              to={loggedIn ? "/dashboard" : "/register"}
              className="group inline-flex items-center gap-4 rounded-full bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold transition-all hover:bg-primary/90"
            >
              <span>{loggedIn ? "Go to Dashboard" : "Get Started Free"}</span>
              <span className="size-10 rounded-full bg-primary-foreground text-primary grid place-items-center transition-transform group-hover:translate-x-0.5">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Logo size="sm" className="text-foreground" />
            <span>© 2025 TAAI · Built for Bangladeshi classrooms</span>
          </div>
          <div className="flex gap-6"><a href="#" className="hover:text-foreground">Privacy</a><a href="#" className="hover:text-foreground">Terms</a><a href="#" className="hover:text-foreground">Contact</a></div>
        </div>
      </footer>
    </div>
  );
}
