import { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";
import type { GlossaryTermData } from "../types";

interface GlossaryTermProps { term: GlossaryTermData; }

export function GlossaryTerm({ term }: GlossaryTermProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={cn(
          "rounded-lg border px-4 py-2.5 text-small font-medium transition-all duration-150",
          open
            ? "border-primary/40 bg-primary/10 text-primary shadow-glow-primary"
            : "border-border bg-surface text-text-muted hover:border-primary/30 hover:text-text"
        )}
        aria-expanded={open}>
        {term.term}
      </button>

      {open && (
        <div role="tooltip"
          className="absolute left-0 top-full z-30 mt-2.5 w-72 animate-scale-in glass-card rounded-xl p-5 shadow-hover">
          <p className="mb-2 text-small font-bold text-text">{term.term}</p>
          <p className="text-small leading-relaxed text-text-muted">{term.definition}</p>
        </div>
      )}
    </div>
  );
}
