import { useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Menu, X } from "lucide-react";
import { useAuthStatus } from "../../../lib/useAuthStatus";

const NAV_LINKS = [
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Herramientas", href: "#herramientas" },
];

const GHOST_ACTION =
  "text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors";
const PRIMARY_ACTION =
  "bg-terracotta-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-terracotta-500/30 hover:bg-terracotta-600 transition-all";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isSignedIn = useAuthStatus() === "authenticated";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-cream/80 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-terracotta-500 text-white shadow-sm shadow-terracotta-500/30">
            <PawPrint size={18} strokeWidth={2.25} />
          </span>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">
            MORAR
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <Link
              to="/dashboard"
              className={`${PRIMARY_ACTION} hover:shadow-md hover:-translate-y-0.5`}
            >
              Ir a mi panel
            </Link>
          ) : (
            <>
              <Link to="/login" className={GHOST_ACTION}>
                Ingresar
              </Link>
              <a
                href="#unite"
                className={`${PRIMARY_ACTION} hover:shadow-md hover:-translate-y-0.5`}
              >
                Sumate
              </a>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-cream/95 backdrop-blur-md">
          <ul className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {isSignedIn ? (
              <li>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-center ${PRIMARY_ACTION}`}
                >
                  Ir a mi panel
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block ${GHOST_ACTION}`}
                  >
                    Ingresar
                  </Link>
                </li>
                <li>
                  <a
                    href="#unite"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block text-center ${PRIMARY_ACTION}`}
                  >
                    Sumate
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
