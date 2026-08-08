import { Target, Code2, Brain, TrendingUp, Building2, BookOpen } from "lucide-react";
import type { RoleCardData } from "../types";

interface RoleCardProps { role: RoleCardData; }

export function RoleCard({ role }: RoleCardProps) {
  return (
    <article className="glass-card rounded-2xl p-7 transition-all duration-150 hover:-translate-y-1 hover:shadow-hover sm:p-8">
      <div className="mb-5 flex items-center gap-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-raised text-2xl">
          {role.emoji}
        </div>
        <div>
          <h3 className="text-body font-bold text-text">{role.roleName}</h3>
          <p className="text-caption text-primary">{role.entryLevel.split(".")[0]}</p>
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">Qué hace</span>
        </div>
        <p className="text-small text-text-secondary leading-relaxed">{role.whatTheyDo}</p>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">Problemas que resuelve</span>
        </div>
        <p className="text-small text-text-secondary leading-relaxed">{role.problemsSolved}</p>
      </div>

      <div className="mb-5">
        <div className="mb-2.5 flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">Tecnologías</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {role.technologies.map((t) => (
            <span key={t} className="rounded-md border border-border bg-surface-raised px-2.5 py-1 text-caption font-medium text-text-muted">{t}</span>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2.5 flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">Habilidades</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {role.skills.map((s) => (
            <span key={s} className="rounded-md border border-border bg-aqua-glow px-2.5 py-1 text-caption font-medium text-text-muted">{s}</span>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">Cómo aprender</span>
        </div>
        <p className="text-small text-text-secondary leading-relaxed">{role.howToLearn}</p>
      </div>

      <div className="rounded-lg border border-border bg-surface-hover p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">Empresas</span>
        </div>
        <p className="text-small text-text-secondary">{role.companies.join(" · ")}</p>
      </div>
    </article>
  );
}
