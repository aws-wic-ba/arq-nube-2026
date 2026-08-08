import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";

const messages = [
  "Analizando tus respuestas...",
  "Encontrando tu camino...",
  "Preparando tu perfil...",
];

/**
 * Loader — Noxora Dark Space.
 */
export function DiscoveryLoader() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % messages.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center animate-fade-up">
      <div className="mb-8">
        <BrandLogo size={56} variant="loading" />
      </div>

      <h2 className="mb-3 font-display text-title-sm text-text">
        Calculando tu perfil
      </h2>
      <p className="text-body text-text-muted animate-fade-in" key={idx} aria-live="polite">
        {messages[idx]}
      </p>

      <div className="mt-10 h-2 w-48 overflow-hidden rounded-full bg-surface-raised">
        <div className="h-full w-1/3 rounded-full bg-gradient-brand-h animate-slide-right" />
      </div>
    </div>
  );
}
