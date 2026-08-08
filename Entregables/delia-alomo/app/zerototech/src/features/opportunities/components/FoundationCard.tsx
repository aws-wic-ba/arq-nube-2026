import { GraduationCap, ExternalLink, Heart } from "lucide-react";
import type { FoundationData } from "../types";

interface FoundationCardProps {
  foundation: FoundationData;
  isRecommended?: boolean;
}

export function FoundationCard({ foundation, isRecommended }: FoundationCardProps) {
  return (
    <article className="glass-card rounded-2xl p-7 transition-all duration-300 ease-elegant hover:-translate-y-1 hover:shadow-hover">
      {isRecommended && (
        <div className="badge mb-4">
          <Heart className="h-3 w-3 text-green-400" aria-hidden="true" />
          <span className="text-green-300">Recomendado para vos</span>
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-hover">
          <GraduationCap className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-body font-bold text-green-400">{foundation.name}</h3>
          {foundation.isFree && (
            <span className="text-caption font-semibold text-green-300">Gratuito</span>
          )}
        </div>
      </div>

      <p className="mb-4 text-small text-slate-300 leading-relaxed">{foundation.description}</p>

      <div className="mb-4">
        <p className="mb-1.5 text-caption font-semibold uppercase tracking-wider text-slate-400">Programas</p>
        <p className="text-small text-slate-300">{foundation.programs}</p>
      </div>

      <div className="mb-5">
        <p className="mb-1.5 text-caption font-semibold uppercase tracking-wider text-slate-400">Dirigido a</p>
        <p className="text-small text-slate-300">{foundation.audience}</p>
      </div>

      <a href={foundation.url} target="_blank" rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-5 py-2.5 text-small font-semibold text-green-400 transition-all duration-300 hover:bg-green-500/20 hover:shadow-glow">
        Descubrir oportunidad
        <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </a>
    </article>
  );
}
