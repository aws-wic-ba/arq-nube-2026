import { Building2, ExternalLink, GraduationCap, Lightbulb, Code2, Users } from "lucide-react";
import type { CompanyData } from "../types";

interface CompanyCardProps {
  company: CompanyData;
}

/**
 * Company card — premium, structured, expandable.
 * Glass surface with Noxora holographic identity.
 */
export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <article className="glass-card rounded-2xl p-7 transition-all duration-300 ease-elegant hover:-translate-y-1 hover:shadow-hover sm:p-8">
      {/* Header */}
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-raised">
          <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-body font-bold text-text">{company.name}</h3>
          <p className="text-caption text-text-muted">{company.group === "argentina" ? "Empresa argentina" : "Internacional"}</p>
        </div>
      </div>

      {/* History */}
      <p className="mb-5 text-small text-text-muted leading-relaxed">{company.history}</p>

      {/* Focus */}
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">A qué se dedica</span>
        </div>
        <p className="text-small text-text-muted leading-relaxed">{company.focus}</p>
      </div>

      {/* Technologies */}
      <div className="mb-5">
        <div className="mb-2.5 flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">Tecnologías</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {company.technologies.map((tech) => (
            <span key={tech} className="rounded-md border border-border bg-surface-raised px-2.5 py-1 text-caption font-medium text-text-muted">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Hiring roles */}
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">Roles que buscan</span>
        </div>
        <p className="text-small text-text-muted">{company.hiringRoles.join(" · ")}</p>
      </div>

      {/* Student programs */}
      {company.studentPrograms && (
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <GraduationCap className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span className="text-caption font-semibold uppercase tracking-wider text-text-muted">Para estudiantes</span>
          </div>
          <p className="text-small text-muted">{company.studentPrograms}</p>
        </div>
      )}

      {/* Fun fact */}
      <div className="mb-6 rounded-lg border-l-3 border-aqua bg-aqua-glow p-4">
        <p className="text-small text-text"><span className="font-semibold text-aqua">Dato curioso:</span> {company.funFact}</p>
      </div>

      {/* CTA */}
      <a
        href={company.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 rounded-xl bg-surface-hover px-5 py-2.5 text-small font-semibold text-text transition-all duration-150 hover:bg-gradient-brand hover:text-background hover:shadow-glow"
      >
        Conocer más
        <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </a>
    </article>
  );
}
