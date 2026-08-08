import { Building2, Globe } from "lucide-react";
import { companiesData } from "./data";
import { CompanyCard } from "./components/CompanyCard";

/**
 * Companies section — Noxora Holographic.
 * Two groups: Argentine + International.
 */
export function CompaniesSection() {
  const argentine = companiesData.filter((c) => c.group === "argentina");
  const international = companiesData.filter((c) => c.group === "internacional");

  return (
    <section id="empresas" className="mx-auto max-w-5xl px-6 py-22" aria-label="Empresas tecnológicas">
      {/* Header */}
      <div className="mb-12 animate-fade-up">
        <h2 className="font-display text-title text-text sm:text-[2.25rem]">
          Descubrí el mundo de las empresas tecnológicas
        </h2>
        <p className="mt-3 max-w-2xl text-subtitle text-text-muted">
          Conocé las empresas que están transformando la tecnología en Argentina y el mundo. Descubrí a qué se dedican, cómo es su cultura y qué perfiles profesionales buscan.
        </p>
      </div>

      {/* Argentine companies */}
      <div className="mb-18">
        <div className="mb-6 flex items-center gap-3 animate-fade-up-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aqua-glow">
            <Building2 className="h-4.5 w-4.5 text-aqua" aria-hidden="true" />
          </div>
          <h3 className="text-small font-semibold uppercase tracking-wider text-text-muted">
            Empresas argentinas
          </h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {argentine.map((c) => <CompanyCard key={c.id} company={c} />)}
        </div>
      </div>

      {/* International companies */}
      <div>
        <div className="mb-6 flex items-center gap-3 animate-fade-up-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-hover">
            <Globe className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
          </div>
          <h3 className="text-small font-semibold uppercase tracking-wider text-text-muted">
            Internacionales con presencia en Argentina
          </h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {international.map((c) => <CompanyCard key={c.id} company={c} />)}
        </div>
      </div>
    </section>
  );
}
