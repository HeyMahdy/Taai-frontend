import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
  sub?: string;
};

type Props = {
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
};

export function SearchableSelect({ options, value, onChange, placeholder = "Select...", className }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.value.toLowerCase().includes(search.toLowerCase()) ||
      (o.sub || "").toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus search input when opened
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-md border border-border bg-card text-sm cursor-pointer hover:bg-accent/50 transition"
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selected && (
            <span
              onClick={(e) => { e.stopPropagation(); onChange(null); setSearch(""); }}
              className="size-5 rounded grid place-items-center hover:bg-accent cursor-pointer"
            >
              <X className="size-3 text-muted-foreground" />
            </span>
          )}
          <ChevronDown className={cn("size-4 text-muted-foreground transition", open && "rotate-180")} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-border bg-card shadow-[0_8px_32px_-8px_oklch(0.2_0.02_280/0.12)] overflow-hidden">
          {/* Search */}
          <div className="px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Search className="size-3.5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">No results found</div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); setSearch(""); }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition cursor-pointer",
                    o.value === value && "bg-primary/5 text-primary font-medium"
                  )}
                >
                  <div className="truncate">{o.label}</div>
                  {o.sub && <div className="text-xs text-muted-foreground truncate">{o.sub}</div>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
