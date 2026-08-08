import { Wrench, Cloud, Shield, Palette, Code, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

const iconMap: Record<string, LucideIcon> = { Wrench, Cloud, Shield, Palette, Code };

interface OptionCardProps {
  text: string;
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Option card — Noxora Dark Space.
 */
export function OptionCard({ text, icon, isSelected, onSelect }: OptionCardProps) {
  const Icon = iconMap[icon] ?? Code;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-4 rounded-xl border-2 p-5 text-left transition-all duration-150",
        isSelected
          ? "border-aqua/50 bg-aqua-glow shadow-glow-aqua"
          : "glass-card border-border hover:-translate-y-1 hover:border-violet/30 hover:shadow-hover"
      )}
      aria-pressed={isSelected}
    >
      <div className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-all duration-150",
        isSelected ? "bg-gradient-brand text-background" : "bg-surface-raised text-text-muted group-hover:text-primary"
      )}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <span className={cn(
        "flex-1 text-body leading-relaxed",
        isSelected ? "text-text font-medium" : "text-text-muted"
      )}>
        {text}
      </span>

      {isSelected && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aqua animate-scale-in">
          <Check className="h-3.5 w-3.5 text-background" strokeWidth={3} aria-hidden="true" />
        </div>
      )}
    </button>
  );
}
