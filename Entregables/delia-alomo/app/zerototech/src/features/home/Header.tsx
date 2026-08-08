import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { BrandLogo } from "@/components/ui/BrandLogo";

const navItems = [
  { id: "inicio", label: "Inicio" },
  { id: "descubri", label: "Descubrí" },
  { id: "roles", label: "Roles" },
  { id: "empresas", label: "Empresas" },
  { id: "oportunidades", label: "Comunidad" },
  { id: "roadmap", label: "Roadmap" },
];

/**
 * Header — Noxora Dark Space.
 * Dark glass navigation, new Logo component, subtle border.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-glass backdrop-blur-lg border-b border-border">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2.5" aria-label="ZeroToTech — Inicio">
          <BrandLogo size={34} variant="navbar" animated />
          <span className="font-display text-xl font-bold tracking-tight bg-gradient-brand bg-clip-text text-transparent">
            ZeroToTech
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación">
          {navItems.map((item) => (
            <button key={item.id} type="button" onClick={() => scrollTo(item.id)}
              className="rounded-lg px-3 py-2 text-small font-medium text-text-muted transition-all duration-150 hover:text-aqua hover:bg-aqua-glow">
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button type="button" onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg lg:hidden text-text-muted hover:text-aqua hover:bg-aqua-glow transition-colors"
          aria-label="Menú">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-border bg-surface-raised p-4 animate-fade-in">
          {navItems.map((item) => (
            <button key={item.id} type="button" onClick={() => scrollTo(item.id)}
              className={cn("block w-full rounded-lg px-4 py-3 text-left text-small font-medium text-text-muted hover:text-aqua hover:bg-aqua-glow transition-colors")}>
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
