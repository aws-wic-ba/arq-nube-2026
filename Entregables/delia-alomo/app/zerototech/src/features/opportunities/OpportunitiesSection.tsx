import { GraduationCap, Heart, Calendar } from "lucide-react";
import type { ITCategory } from "@/features/discovery/types";
import { foundationsData, eventsData } from "./data";
import { communitiesData } from "@/features/community/data";
import { FoundationCard, EventCard } from "./components";
import { CommunityCard } from "@/features/community/components/CommunityCard";

interface OpportunitiesSectionProps {
  /** User's quiz result category for personalization */
  userProfile?: ITCategory | null;
}

/**
 * Opportunities section — combines Foundations, Communities, Events.
 * Shows personalized recommendations when user has a profile.
 */
export function OpportunitiesSection({ userProfile }: OpportunitiesSectionProps) {
  const isRecommended = (cats: ITCategory[]) =>
    userProfile ? cats.includes(userProfile) : false;

  // Sort recommended items first
  const sortedFoundations = [...foundationsData].sort((a, b) => {
    const aR = isRecommended(a.relatedCategories) ? 0 : 1;
    const bR = isRecommended(b.relatedCategories) ? 0 : 1;
    return aR - bR;
  });

  const sortedEvents = [...eventsData].sort((a, b) => {
    const aR = isRecommended(a.relatedCategories) ? 0 : 1;
    const bR = isRecommended(b.relatedCategories) ? 0 : 1;
    return aR - bR;
  });

  return (
    <section id="oportunidades" className="mx-auto max-w-5xl px-6 py-22 text-green-500">
      {/* Header */}
      <div className="mb-12 animate-fade-up">
        <h2 className="font-display text-title text-accent sm:text-[2.25rem]">
          Oportunidades para crecer
        </h2>
        <p className="mt-3 max-w-2xl text-subtitle text-text-secondary">
          Encontrá formación gratuita, comunidades y eventos para dar tus primeros pasos en tecnología.
        </p>
      </div>

      {/* Foundations */}
      <div className="mb-18">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-hover">
            <GraduationCap className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
          </div>
          <h3 className="text-small font-semibold uppercase tracking-wider text-text-muted">
            Fundaciones y organizaciones
          </h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {sortedFoundations.map((f) => (
            <FoundationCard
              key={f.id}
              foundation={f}
              isRecommended={isRecommended(f.relatedCategories)}
            />
          ))}
        </div>
      </div>

      {/* Communities */}
      <div className="mb-18">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-hover">
            <Heart className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
          </div>
          <h3 className="text-small font-semibold uppercase tracking-wider text-text-muted">
            Comunidades tecnológicas
          </h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {communitiesData.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </div>
      </div>

      {/* Events */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-hover">
            <Calendar className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
          </div>
          <h3 className="text-small font-semibold uppercase tracking-wider text-text-muted">
            Eventos tecnológicos
          </h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {sortedEvents.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              isRecommended={isRecommended(e.relatedCategories)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
