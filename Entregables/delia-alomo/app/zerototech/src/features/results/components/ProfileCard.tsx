import { Award } from "lucide-react";
import type { RoadmapData } from "../types";

interface ProfileCardProps {
  roadmap: RoadmapData;
}

/**
 * Profile card — Noxora Dark Space.
 */
export function ProfileCard({ roadmap }: ProfileCardProps) {
  return (
    <div className="animate-fade-up glass-card relative overflow-hidden rounded-2xl p-10 text-center sm:p-14">
      {/* Icon */}
      <div className="mb-6 inline-flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
        <Award className="h-8 w-8 text-background" aria-hidden="true" />
      </div>

      <p className="mb-4 text-caption font-semibold uppercase tracking-widest text-aqua">
        Tu perfil descubierto
      </p>

      <h2 className="mb-5 font-display text-title text-text sm:text-[2.5rem]">
        {roadmap.roleName}
      </h2>

      <p className="mx-auto max-w-md text-body text-text-muted leading-relaxed">
        {roadmap.motivationalMessage}
      </p>

      <div className="mx-auto mt-8 h-1 w-20 rounded-full bg-gradient-brand" />
    </div>
  );
}
