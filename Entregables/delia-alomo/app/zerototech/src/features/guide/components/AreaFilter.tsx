import { cn } from "@/utils/cn";
import type { ITCategory } from "@/features/discovery/types";

const filters: { value: ITCategory | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "soporte", label: "Soporte" },
  { value: "cloud", label: "Cloud" },
  { value: "ciberseguridad", label: "Seguridad" },
  { value: "ux-ui", label: "UX/UI" },
  { value: "desarrollo", label: "Dev" },
];

interface AreaFilterProps {
  selected: ITCategory | "all";
  onChange: (value: ITCategory | "all") => void;
}

export function AreaFilter({ selected, onChange }: AreaFilterProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1.5"
      role="radiogroup" aria-label="Filtrar por área">
      {filters.map((f) => (
        <button key={f.value} type="button" role="radio"
          aria-checked={selected === f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            "rounded-lg px-4 py-2 text-small font-medium transition-all duration-150",
            selected === f.value
              ? "bg-gradient-brand text-background shadow-glow"
              : "text-text-muted hover:text-text hover:bg-surface-raised"
          )}>
          {f.label}
        </button>
      ))}
    </div>
  );
}
