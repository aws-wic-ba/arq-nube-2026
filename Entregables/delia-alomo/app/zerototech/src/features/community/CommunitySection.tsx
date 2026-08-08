import { Heart } from "lucide-react";
import { communitiesData } from "./data";
import { CommunityCard } from "./components/CommunityCard";

/**
 * Communities section — Noxora Holographic.
 */
export function CommunitySection() {
  return (
    <section id="comunidad" className="mx-auto max-w-5xl px-6 py-22" aria-label="Comunidades tecnológicas">
      {/* Header */}
      <div className="mb-12 animate-fade-up">
        <h2 className="font-display text-title text-text sm:text-[2.25rem]">
          Comunidad
        </h2>
        <p className="mt-3 max-w-2xl text-subtitle text-muted">
          El mundo IT se recorre mejor en compañía. Conocé las comunidades que te pueden acompañar en tu camino.
        </p>
      </div>

      {/* Section icon */}
      <div className="mb-8 flex items-center gap-3 animate-fade-up-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-hover">
          <Heart className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
        </div>
        <h3 className="text-small font-semibold uppercase tracking-wider text-text-muted">
          Comunidades para empezar
        </h3>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {communitiesData.map((c) => <CommunityCard key={c.id} community={c} />)}
      </div>
    </section>
  );
}
