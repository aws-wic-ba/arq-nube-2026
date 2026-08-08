import { ArrowDown } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

/**
 * Hero — Noxora Dark Space.
 * Emotional. Elegant serif headlines. Gradient CTA. Logo prominent.
 */
export function HeroSection() {
  const handleScroll = () => {
    document.getElementById("descubri")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="inicio"
      className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 text-center"
      aria-labelledby="hero-title"
    >
      {/* Logo animated */}
      <div className="mb-8 animate-fade-up">
        <BrandLogo size={120} variant="hero" animated showGlow />
      </div>

      {/* Headline */}
      <h1
        id="hero-title"
        className="mb-6 animate-fade-up-1 font-display text-hero-sm font-bold text-text sm:text-hero"
      >
        No necesitás saber tecnología
        <br />
        <span className="bg-gradient-brand bg-clip-text text-transparent">
          para empezar.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mx-auto mb-10 max-w-lg animate-fade-up-2 text-subtitle text-text-muted leading-relaxed">
        ZeroToTech te acompaña a descubrir tu lugar en el mundo IT.
        Solo necesitás curiosidad.
      </p>

      {/* CTA */}
      <div className="animate-fade-up-3">
        <button
          onClick={handleScroll}
          className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-brand px-8 py-4 font-body text-body font-semibold text-background shadow-glow transition-all duration-150 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(127,255,208,0.2)] active:scale-[0.98]"
        >
          Comenzar mi recorrido
          <ArrowDown className="h-4 w-4 transition-transform duration-150 group-hover:translate-y-0.5" aria-hidden="true" />
        </button>
      </div>

      {/* Tagline */}
      <p className="mt-8 animate-fade-up-4 text-caption text-text-muted uppercase tracking-widest">
        Descubrí. Explorá. Crecé.
      </p>
    </section>
  );
}
