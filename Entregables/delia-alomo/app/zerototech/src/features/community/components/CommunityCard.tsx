import { ExternalLink, Users } from "lucide-react";
import type { CommunityData } from "../types";

interface CommunityCardProps {
  community: CommunityData;
}

export function CommunityCard({ community }: CommunityCardProps) {
  return (
    <article className="rounded-2xl border border-purple-200 bg-white/70 backdrop-blur-sm p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <Users className="h-5 w-5 text-purple-600" aria-hidden="true" />
        </div>
        <h3 className="text-body font-bold text-purple-900">{community.name}</h3>
      </div>

      <p className="mb-5 text-small text-purple-700 leading-relaxed">{community.description}</p>

      <div className="mb-5">
        <p className="mb-2 text-caption font-semibold uppercase tracking-wider text-purple-500">Actividades</p>
        <div className="flex flex-wrap gap-2">
          {community.activities.map((a) => (
            <span key={a} className="rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1 text-caption font-medium text-purple-700">
              {a}
            </span>
          ))}
        </div>
      </div>

      <p className="mb-5 text-small text-purple-700">
        <span className="font-semibold text-purple-500">Para:</span> {community.audience}
      </p>

      <a
        href={community.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-small font-semibold text-white transition-all duration-300 hover:bg-purple-700 hover:shadow-md"
      >
        Explorar
        <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </a>
    </article>
  );
}
