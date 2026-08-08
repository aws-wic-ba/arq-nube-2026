import { useState, useMemo } from "react";
import { Users, BookOpen } from "lucide-react";
import type { ITCategory } from "@/features/discovery/types";
import { rolesData, glossaryData } from "./data";
import { AreaFilter, RoleCard, GlossaryTerm } from "./components";

export function GuideSection() {
  const [area, setArea] = useState<ITCategory | "all">("all");

  const roles = useMemo(() => {
    if (area === "all") return rolesData;
    return rolesData.filter((r) => r.category === area);
  }, [area]);

  const terms = useMemo(() => {
    if (area === "all") return glossaryData;
    return glossaryData.filter((t) => t.categories.includes(area));
  }, [area]);

  return (
    <section id="guide-section" className="mx-auto max-w-5xl px-6 py-22">
      <div className="mb-12 animate-fade-up">
        <h2 className="font-display text-title text-text">Explorá los Roles IT</h2>
        <p className="mt-3 text-subtitle text-text-secondary">
          Cada rol resuelve problemas diferentes. Encontrá el que más se conecte con vos.
        </p>
      </div>

      <div className="mb-12 animate-fade-up-1">
        <AreaFilter selected={area} onChange={setArea} />
      </div>

      <div className="mb-18">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-glow">
            <Users className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
          </div>
          <h3 className="text-small font-semibold uppercase tracking-wider text-text-muted">Roles</h3>
        </div>
        {roles.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {roles.map((role) => <RoleCard key={role.id} role={role} />)}
          </div>
        ) : (
          <p className="glass-card rounded-xl p-10 text-center text-small text-text-muted">
            No hay roles para esta categoría.
          </p>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-peach-glow">
            <BookOpen className="h-4.5 w-4.5 text-peach" aria-hidden="true" />
          </div>
          <h3 className="text-small font-semibold uppercase tracking-wider text-text-muted">Glosario</h3>
        </div>
        <p className="mb-6 text-small text-text-muted">Hacé clic en un término para ver su explicación.</p>
        {terms.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {terms.map((t) => <GlossaryTerm key={t.id} term={t} />)}
          </div>
        ) : (
          <p className="glass-card rounded-xl p-10 text-center text-small text-text-muted">
            No hay términos para esta categoría.
          </p>
        )}
      </div>
    </section>
  );
}
