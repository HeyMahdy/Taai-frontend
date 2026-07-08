import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/app/shell";
import { Send, Bot, User, Sparkles, Loader2, AlertTriangle, Plus, PanelRight, PanelRightClose, Trash2, MessageSquare, Download, Copy, RefreshCw } from "lucide-react";
import { MarkdownRender } from "@/components/app/markdown-render";
import { sendChatMessage } from "@/lib/api";
import { parseTaChatResponse } from "@/lib/api/chat";
import type { ChatMessage, TaChatResponseContent, SlidesSuccess, SlidesError } from "@/lib/api/chat";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "TAAI Chat" }] }),
  component: ChatPage,
});

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string | TaChatResponseContent;
  error?: boolean;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
};

const STORAGE_KEY = "taai_chat_sessions";
const ACTIVE_KEY = "taai_chat_active";

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveSessions(s: ChatSession[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
function loadActiveId(): string | null { if (typeof window === "undefined") return null; return localStorage.getItem(ACTIVE_KEY); }
function saveActiveId(id: string) { localStorage.setItem(ACTIVE_KEY, id); }

const SUGGESTIONS = [
  "What's the average score for Physics Exam?",
  "Show me students who scored below 50%",
  "How many assignments are pending grading?",
  "Summarize Rakib's performance",
];

function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const storedSessions = loadSessions();
    const storedActiveId = loadActiveId();

    setSessions(storedSessions);
    setActiveId(storedActiveId);

    if (storedActiveId) {
      const session = storedSessions.find((s) => s.id === storedActiveId);
      setMessages(session?.messages || []);
    }
  }, []);

  // Load messages when switching sessions only
  function switchTo(id: string) {
    setActiveId(id);
    saveActiveId(id);
    const session = sessions.find((s) => s.id === id);
    setMessages(session?.messages || []);
  }
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function persistSessions(updated: ChatSession[]) {
    setSessions(updated);
    saveSessions(updated);
  }

  function startNewChat() {
    const id = Date.now().toString();
    const newSession: ChatSession = { id, title: "New Chat", messages: [] };
    const updated = [newSession, ...sessions];
    persistSessions(updated);
    setActiveId(id);
    saveActiveId(id);
    setMessages([]);
  }

  function deleteChat(id: string) {
    const updated = sessions.filter((s) => s.id !== id);
    persistSessions(updated);
    if (activeId === id) {
      const next = updated[0]?.id || null;
      setActiveId(next);
      if (next) saveActiveId(next);
      else setMessages([]);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  }

  async function handleSend(text?: string) {
    const content = (text || input).trim();
    if (!content || loading) return;
    setLastPrompt(content);

    // Ensure we have an active session
    let currentId = activeId;
    let currentSessions = sessions;
    if (!currentId) {
      const id = Date.now().toString();
      const newSession: ChatSession = { id, title: content.slice(0, 40), messages: [] };
      currentSessions = [newSession, ...sessions];
      persistSessions(currentSessions);
      setActiveId(id);
      saveActiveId(id);
      currentId = id;
    }

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: "user", content };
    const withUser = [...messages, userMsg];
    setMessages(withUser);

    // Persist user message
    const isFirst = messages.length === 0;
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === currentId ? { ...s, messages: withUser, title: isFirst ? content.slice(0, 40) : s.title } : s
      );
      saveSessions(updated);
      return updated;
    });

    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setLoading(true);

    // Call API
    const history: ChatMessage[] = withUser.map((m) => ({ role: m.role, content: m.content }));
    const result = await sendChatMessage(content, history);
    const parsedResponse = parseTaChatResponse(result.data?.data?.response);

    const assistantMsg: Message = result.error
      ? { id: (Date.now() + 1).toString(), role: "assistant", content: result.error, error: true }
      : { id: (Date.now() + 1).toString(), role: "assistant", content: parsedResponse };

    // Add assistant message
    const withAssistant = [...withUser, assistantMsg];
    setMessages(withAssistant);

    // Persist using functional update to avoid stale state
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === currentId ? { ...s, messages: withAssistant } : s
      );
      saveSessions(updated);
      return updated;
    });
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function openDownloadUrl(downloadUrl?: string) {
    if (!downloadUrl || typeof window === "undefined") return;
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  }

  async function copyDownloadLink(downloadUrl?: string) {
    if (!downloadUrl) return;

    try {
      await navigator.clipboard.writeText(downloadUrl);
    } catch {
      const fallbackInput = document.createElement("textarea");
      fallbackInput.value = downloadUrl;
      fallbackInput.readOnly = true;
      fallbackInput.style.position = "fixed";
      fallbackInput.style.left = "-9999px";
      document.body.appendChild(fallbackInput);
      fallbackInput.select();
      document.execCommand("copy");
      document.body.removeChild(fallbackInput);
    }
  }

  return (
    <AppShell title="TAAI Chat" subtitle="Ask anything about your students, assignments, and grades">
      <div className="w-full h-[calc(100vh-140px)] flex">
        {/* Main chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={startNewChat} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-xs font-medium hover:bg-accent transition cursor-pointer">
              <Plus className="size-3.5" /> New Chat
            </button>
            <button onClick={() => setShowHistory(!showHistory)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-xs font-medium hover:bg-accent transition cursor-pointer">
              {showHistory ? <PanelRightClose className="size-3.5" /> : <PanelRight className="size-3.5" />} History
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="size-16 rounded-lg bg-primary/10 grid place-items-center mb-4">
                  <Sparkles className="size-7 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold mb-2">TAAI Chat</h2>
                <p className="text-sm text-muted-foreground max-w-md mb-8">Ask me anything about your students, assignments, grades, or teaching workflow.</p>
                <div className="grid sm:grid-cols-2 gap-2 max-w-lg w-full">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => handleSend(s)} className="text-left px-4 py-3 rounded-md border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition cursor-pointer">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto py-6 space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="size-8 rounded-md bg-primary/10 grid place-items-center shrink-0 mt-0.5">
                        <Bot className="size-4 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[75%] px-4 py-3 rounded-lg text-sm leading-relaxed ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : msg.error ? "bg-destructive/10 border border-destructive/20 text-destructive" : "bg-card border border-border"
                    }`}>
                      {msg.error && <AlertTriangle className="size-3.5 inline mr-1.5" />}
                      {msg.role === "assistant" ? (
                        <AssistantMessageContent
                          content={msg.content}
                          onCopyLink={copyDownloadLink}
                          onOpenDownload={openDownloadUrl}
                          onRetry={() => handleSend(lastPrompt)}
                          retryDisabled={!lastPrompt || loading}
                        />
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="size-8 rounded-md bg-muted grid place-items-center shrink-0 mt-0.5">
                        <User className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="size-8 rounded-md bg-primary/10 grid place-items-center shrink-0"><Bot className="size-4 text-primary" /></div>
                    <div className="px-4 py-3 rounded-lg bg-card border border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Thinking...</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border pt-4 pb-2">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-2 px-4 py-3 rounded-lg border border-border bg-card focus-within:border-primary/50 transition">
                <textarea ref={inputRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Ask about students, assignments, grades..." rows={1} className="flex-1 bg-transparent outline-none text-sm resize-none max-h-40 placeholder:text-muted-foreground" />
                <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* History sidebar */}
        <div className={cn("border-l border-border bg-card transition-all duration-200 overflow-hidden shrink-0", showHistory ? "w-72" : "w-0")}>
          {showHistory && (
            <div className="w-72 h-full flex flex-col">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-sm">Chat History</h3>
                <span className="text-[10px] text-muted-foreground">{sessions.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
                {sessions.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-muted-foreground">No history yet.</div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => switchTo(session.id)}
                      className={cn("group flex items-center gap-2 px-4 py-2.5 cursor-pointer transition", session.id === activeId ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-accent border-l-2 border-l-transparent")}
                    >
                      <MessageSquare className="size-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{session.title}</div>
                        <div className="text-[10px] text-muted-foreground">{session.messages.length} msgs</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteChat(session.id); }} className="size-6 rounded grid place-items-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition cursor-pointer">
                        <Trash2 className="size-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function AssistantMessageContent({
  content,
  onCopyLink,
  onOpenDownload,
  onRetry,
  retryDisabled,
}: {
  content: string | TaChatResponseContent;
  onCopyLink: (downloadUrl?: string) => Promise<void>;
  onOpenDownload: (downloadUrl?: string) => void;
  onRetry: () => void;
  retryDisabled: boolean;
}) {
  if (typeof content === "string") {
    return <MarkdownRender content={content} className="text-sm" />;
  }

  if (content.kind === "text") {
    return <MarkdownRender content={content.text} className="text-sm" />;
  }

  if (content.kind === "slides_success") {
    return <SlidesSuccessCard slide={content.slide} onCopyLink={onCopyLink} onOpenDownload={onOpenDownload} />;
  }

  return <SlidesErrorCard slide={content.slide} onRetry={onRetry} retryDisabled={retryDisabled} />;
}

function SlidesSuccessCard({
  slide,
  onCopyLink,
  onOpenDownload,
}: {
  slide: SlidesSuccess;
  onCopyLink: (downloadUrl?: string) => Promise<void>;
  onOpenDownload: (downloadUrl?: string) => void;
}) {
  const onOpenDownloadRef = useRef(onOpenDownload);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    onOpenDownloadRef.current = onOpenDownload;
  }, [onOpenDownload]);

  useEffect(() => {
    if (autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    onOpenDownloadRef.current(slide.downloadUrl);
  }, [slide.downloadUrl]);

  const hasDownloadUrl = Boolean(slide.downloadUrl);

  return (
    <div className="space-y-3 text-foreground">
      <div className="flex items-start gap-2">
        <Download className="size-4 text-primary mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold text-sm">Slides Ready</div>
          <div className="text-xs text-muted-foreground">{slide.slidePageCount ?? "Unknown"} slide{slide.slidePageCount === 1 ? "" : "s"}</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Theme classification: {slide.themeClassification || "n/a"}</div>
        <div>Theme ID: {slide.themeId || "n/a"}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={slide.downloadUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition",
            hasDownloadUrl ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground pointer-events-none"
          )}
          onClick={(e) => {
            if (!hasDownloadUrl) e.preventDefault();
          }}
        >
          <Download className="size-3.5" />
          Download Slides
        </a>
        <button
          type="button"
          onClick={() => onCopyLink(slide.downloadUrl)}
          disabled={!hasDownloadUrl}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-xs font-medium hover:bg-accent transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Copy className="size-3.5" />
          Copy Link
        </button>
      </div>
    </div>
  );
}

function SlidesErrorCard({
  slide,
  onRetry,
  retryDisabled,
}: {
  slide: SlidesError;
  onRetry: () => void;
  retryDisabled: boolean;
}) {
  return (
    <div className="space-y-3 text-destructive">
      <div className="flex items-start gap-2">
        <AlertTriangle className="size-4 mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold text-sm">Slides request failed</div>
          <div className="text-xs text-destructive/80">HTTP {slide.httpStatus ?? "unknown"}</div>
        </div>
      </div>
      <div className="text-xs text-destructive/80 whitespace-pre-wrap">{slide.error || "Unknown slide generation error."}</div>
      <button
        type="button"
        onClick={onRetry}
        disabled={retryDisabled}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RefreshCw className="size-3.5" />
        Retry
      </button>
    </div>
  );
}
