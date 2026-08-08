import type { ReactNode } from "react";
import { Header } from "@/features/home";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface MainLayoutProps {
  children?: ReactNode;
}

/**
 * Layout — Noxora Dark Space.
 * Starfield background, dark footer with logo.
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative min-h-dvh starfield">
      <div className="relative z-10">
        <Header />
        <main>{children}</main>

        <footer className="mt-26 border-t border-border bg-surface/50">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="mb-6 flex items-center gap-2.5">
              <BrandLogo size={28} variant="navbar" />
              <span className="font-display text-body font-bold bg-gradient-brand bg-clip-text text-transparent">ZeroToTech</span>
            </div>
            <p className="mb-8 max-w-sm text-small text-text-muted leading-relaxed">
              Tu guía para descubrir el ecosistema tecnológico.
              Descubrí. Explorá. Crecé.
            </p>
            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
              <p className="text-caption text-text-muted">Kiro AI Hackathon 2025</p>
              <p className="text-caption text-text-muted">Hecho para quienes empiezan.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
