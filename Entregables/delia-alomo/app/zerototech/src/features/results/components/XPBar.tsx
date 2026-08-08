import { Zap } from "lucide-react";
import type { XPLevel } from "../types";

const levels: XPLevel[] = [
  { level: 1, name: "Curioso/a", minXP: 0, maxXP: 50 },
  { level: 2, name: "Explorador/a", minXP: 50, maxXP: 150 },
  { level: 3, name: "Aprendiz", minXP: 150, maxXP: 300 },
  { level: 4, name: "Practicante", minXP: 300, maxXP: 500 },
  { level: 5, name: "Protagonista IT", minXP: 500, maxXP: 999 },
];

function getCurrentLevel(xp: number): XPLevel {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXP) return levels[i];
  }
  return levels[0];
}

interface XPBarProps { totalXP: number; }

/**
 * XP bar — Noxora Dark Space. Peach accent.
 */
export function XPBar({ totalXP }: XPBarProps) {
  const level = getCurrentLevel(totalXP);
  const pct = Math.min(Math.round(((totalXP - level.minXP) / (level.maxXP - level.minXP)) * 100), 100);

  return (
    <div className="animate-fade-up-1 glass-card flex items-center gap-4 rounded-xl p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-peach-glow">
        <Zap className="h-5 w-5 text-peach" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-small font-bold text-text">Nivel {level.level}</span>
          <span className="text-caption text-text-muted">{level.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-raised"
            role="progressbar" aria-valuenow={totalXP} aria-valuemin={level.minXP} aria-valuemax={level.maxXP}>
            <div className="h-full rounded-full bg-peach transition-all duration-500 ease-elegant" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-caption font-bold text-peach">{totalXP} XP</span>
        </div>
      </div>
    </div>
  );
}
