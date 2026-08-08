import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  HeartHandshake,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  Palette,
  PawPrint,
  Phone,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import type { Association } from "../../Types/Association";
import {
  endSession,
  getActiveAssociation,
  getAuthHeaders,
} from "../../services/session";
import PublicUrlField from "../../components/PublicUrlField";
import { tint } from "../../lib/color";

const CARD =
  "rounded-2xl bg-white p-7 shadow-[0_1px_2px_rgba(94,58,38,0.04),0_16px_40px_-20px_rgba(94,58,38,0.18)] sm:p-8";

function DashboardPage() {
  const [association, setAssociation] = useState<Association | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssociation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // El refugio y el token salen los dos de la sesión de Cognito.
        const [activeIdentifier, authHeaders] = await Promise.all([
          getActiveAssociation(),
          getAuthHeaders(),
        ]);

        if (!activeIdentifier) {
          // Cuenta sin custom:association_slug: no hay panel que mostrarle.
          setError(
            "Tu usuario no tiene un refugio asociado. Escribinos para que lo revisemos.",
          );
          return;
        }

        // Ruta privada: mismos datos que la pública, pero detrás del authorizer.
        const response = await fetch(
          `${import.meta.env.VITE_API_URL_GET}/dev2/private/associations/${activeIdentifier}`,
          { headers: authHeaders },
        );

        // 401: el token venció o fue revocado del lado de Cognito.
        if (response.status === 401) {
          await endSession();
          navigate("/login", { replace: true });
          return;
        }

        // 403: el token es válido pero apunta a otro refugio.
        if (response.status === 403) {
          setError(
            "Tu sesión no tiene permiso sobre este refugio. Cerrá sesión y volvé a entrar.",
          );
          return;
        }

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: { association: Association } = await response.json();
        setAssociation(data.association);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la información del refugio.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssociation();
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          {isLoading && <LoadingState />}
          {!isLoading && error && <ErrorState message={error} />}
          {!isLoading && !error && association && (
            <DashboardContent association={association} />
          )}
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Navegación   
/* -------------------------------------------------------------------------- */

const NAV_ITEMS = [
  { label: "Resumen", icon: LayoutGrid },
  { label: "Animales", icon: PawPrint },
  { label: "Adopciones", icon: HeartHandshake },
  { label: "Personalización", icon: Palette },
  { label: "Configuración", icon: Settings },
];

/** Los mismos ítems para el sidebar y para el drawer: si mañana se agrega una
 *  sección, aparece en los dos lados sin tocar nada más. */
function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ label, icon: Icon }, index) => {
        const isActive = index === 0;

        return (
          <a
            key={label}
            href="#"
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-xl py-2.5 pl-4 pr-3 text-sm transition-all ${
              isActive
                ? "bg-white font-semibold text-terracotta-700 shadow-[0_1px_2px_rgba(94,58,38,0.05),0_8px_20px_-14px_rgba(94,58,38,0.35)]"
                : "font-medium text-gray-500 hover:bg-white/60 hover:text-gray-900"
            }`}
          >
            {/* Barra lateral del ítem activo: el ancla visual del menú */}
            {isActive && (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-terracotta-500"
              />
            )}
            <Icon
              size={17}
              strokeWidth={isActive ? 2.4 : 2}
              className={
                isActive
                  ? "text-terracotta-500"
                  : "text-gray-400 transition-colors group-hover:text-gray-600"
              }
            />
            {label}
          </a>
        );
      })}
    </nav>
  );
}

function NavSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
      {children}
    </p>
  );
}

/** Ir a /login no alcanza para desloguearse: mientras los tokens sigan en el
 *  storage, el guard deja volver al panel con el botón de atrás. */
function useLogout() {
  const navigate = useNavigate();

  return async (onNavigate?: () => void) => {
    onNavigate?.();
    await endSession();
    navigate("/login", { replace: true });
  };
}

function LogoutLink({ onNavigate }: { onNavigate?: () => void }) {
  const logout = useLogout();

  return (
    <button
      type="button"
      onClick={() => logout(onNavigate)}
      className="flex w-full items-center gap-3 rounded-xl py-2.5 pl-4 pr-3 text-left text-sm font-medium text-gray-500 transition-colors hover:bg-white/60 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500/40"
    >
      <LogOut size={17} strokeWidth={2} className="text-gray-400" />
      Cerrar sesión
    </button>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <a href="/" className="flex items-center gap-2.5">
      <span
        className={`flex items-center justify-center rounded-xl bg-terracotta-500 text-white shadow-sm shadow-terracotta-500/30 ${
          compact ? "h-8 w-8" : "h-9 w-9"
        }`}
      >
        <PawPrint size={compact ? 16 : 18} strokeWidth={2.25} />
      </span>
      <span
        className={`font-extrabold tracking-tight text-gray-900 ${
          compact ? "text-lg" : "text-xl"
        }`}
      >
        MORAR
      </span>
    </a>
  );
}

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col bg-cream-200/60 px-5 py-7 sm:flex">
      <div className="mb-9 px-2">
        <BrandMark />
      </div>

      <NavSectionLabel>Panel</NavSectionLabel>
      <NavList />

      <div className="mt-auto pt-6">
        <LogoutLink />
      </div>
    </aside>
  );
}

const DRAWER_EXIT_MS = 160;

function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const exitTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const logout = useLogout();

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    dialog?.showModal();
    panelRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      dialog?.close();
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (exitTimeout.current) clearTimeout(exitTimeout.current);
    };
  }, []);

  const finishClose = () => {
    if (exitTimeout.current) clearTimeout(exitTimeout.current);
    exitTimeout.current = null;
    setIsClosing(false);
    setIsOpen(false);
  };

  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    exitTimeout.current = setTimeout(finishClose, DRAWER_EXIT_MS);
  };

  // Si el viewport crece hasta el breakpoint del sidebar (rotar la tablet, por
  // ejemplo), el drawer queda oculto por CSS: con este useEffect lo cerramos de verdad,
  // sino el scroll queda bloqueado y el foco atrapado en algo que ya no se ve.
  useEffect(() => {
    if (!isOpen) return;

    const query = window.matchMedia("(min-width: 40rem)");
    const handleChange = () => {
      if (query.matches) finishClose();
    };

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [isOpen]);

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    requestClose();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) requestClose();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-cream-200/80 px-5 py-4 backdrop-blur-md sm:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            className="-ml-2 rounded-lg p-2 text-gray-600 transition-colors hover:bg-white/70 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500/40"
          >
            <Menu size={20} strokeWidth={2.25} />
          </button>
          <BrandMark compact />
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/70 hover:text-gray-700"
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} strokeWidth={2} />
        </button>
      </header>

      <dialog
        ref={dialogRef}
        aria-label="Menú del panel"
        onCancel={handleCancel}
        onClick={handleBackdropClick}
        className="hidden open:flex fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none items-stretch justify-start bg-transparent p-0 backdrop:bg-gray-900/50 backdrop:motion-safe:animate-backdrop-in sm:open:hidden"
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          className={`flex h-full w-[17rem] max-w-[85vw] flex-col bg-cream-200 px-5 py-7 shadow-2xl shadow-gray-900/20 outline-none ${
            isClosing
              ? "motion-safe:animate-drawer-out"
              : "motion-safe:animate-drawer-in"
          }`}
        >
          <div className="mb-9 flex items-center justify-between gap-3 px-2">
            <BrandMark />
            <button
              type="button"
              onClick={requestClose}
              aria-label="Cerrar menú"
              className="-mr-2 rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/70 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500/40"
            >
              <X size={20} strokeWidth={2.25} />
            </button>
          </div>

          <NavSectionLabel>Panel</NavSectionLabel>
          <NavList onNavigate={requestClose} />

          <div className="mt-auto pt-6">
            <LogoutLink onNavigate={requestClose} />
          </div>
        </div>
      </dialog>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Estados                                                                    */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  // Esqueleto
  return (
    <div className="mx-auto max-w-6xl animate-pulse" aria-busy="true">
      <span className="sr-only">Cargando información del refugio...</span>
      <div className="mb-10 space-y-3">
        <div className="h-9 w-72 rounded-xl bg-cream-200" />
        <div className="h-4 w-56 rounded-lg bg-cream-200/70" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7">
        <div className="h-60 rounded-2xl bg-white/70" />
        <div className="h-60 rounded-2xl bg-white/70" />
        <div className="h-40 rounded-2xl bg-white/70" />
        <div className="h-40 rounded-2xl bg-white/70" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center gap-3 rounded-2xl bg-white p-10 text-center shadow-[0_1px_2px_rgba(94,58,38,0.04),0_16px_40px_-20px_rgba(94,58,38,0.18)]">
      <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <PawPrint size={22} strokeWidth={2.25} />
      </span>
      <p className="text-lg font-bold text-gray-900">
        Ocurrió un error al cargar el panel
      </p>
      <p className="max-w-md text-sm leading-relaxed text-gray-500">
        {message}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Contenido                                                                  */
/* -------------------------------------------------------------------------- */

function DashboardContent({ association }: { association: Association }) {
  const secondary = association.secondaryColor ?? association.primaryColor;

  return (
    <div
      className="mx-auto max-w-6xl"
      style={
        {
          "--primary": association.primaryColor,
          "--secondary": secondary,
        } as React.CSSProperties
      }
    >
      <GreetingHeader association={association} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7">
        <ProfileCard association={association} />
        <PersonalizationCard association={association} />
      </div>

      <section className="mt-12">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            Tu actividad
          </h2>
          <span className="text-xs font-medium text-gray-400">
            Actualizado hoy
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-7">
          <StatCard
            label="Animales rescatados"
            value={0}
            icon={PawPrint}
            accent="var(--primary)"
            hint="Cargá tu primer rescatado"
          />
          <StatCard
            label="Solicitudes de adopción"
            value={0}
            icon={HeartHandshake}
            accent="var(--secondary)"
            hint="Todavía no recibiste solicitudes"
          />
        </div>
      </section>
    </div>
  );
}

function GreetingHeader({ association }: { association: Association }) {
  return (
    <header className="mb-10 flex flex-wrap items-center justify-between gap-5">
      <div>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl">
          Bienvenido,{" "}
          <span className="text-[var(--primary)]">{association.name}</span>
        </h1>
        <p className="mt-2 text-base text-gray-400">
          Este es el panel privado de tu refugio.
        </p>
      </div>

      <a
        href={`/refugio/${association.slug}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-[0_1px_2px_rgba(94,58,38,0.05),0_10px_24px_-16px_rgba(94,58,38,0.3)] transition-all hover:-translate-y-0.5 hover:text-[var(--primary)]"
      >
        Ver mi página pública
        <ChevronRight size={16} strokeWidth={2.5} />
      </a>
    </header>
  );
}

function ProfileCard({ association }: { association: Association }) {
  return (
    <section className={CARD}>
      <CardTitle>Perfil</CardTitle>
      <div className="flex items-center gap-5">
        {association.logoUrl ? (
          <img
            src={association.logoUrl}
            alt={`Logo de ${association.name}`}
            className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-4"
            style={
              {
                "--tw-ring-color": tint("var(--primary)", 12),
              } as React.CSSProperties
            }
          />
        ) : (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold text-[var(--primary)] ring-4"
            style={
              {
                backgroundColor: tint("var(--primary)", 12),
                "--tw-ring-color": tint("var(--primary)", 8),
              } as React.CSSProperties
            }
          >
            {association.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-xl font-bold tracking-tight text-gray-900">
            {association.name}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={2} className="text-gray-300" />
              {association.city}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone size={14} strokeWidth={2} className="text-gray-300" />
              {association.contactPhone}
            </span>
          </div>
        </div>
      </div>

      {association.description && (
        <figure
          className="mt-7 border-l-2 pl-5"
          style={{ borderColor: tint("var(--primary)", 30) }}
        >
          <blockquote className="text-[15px] italic leading-relaxed text-gray-400">
            {association.description}
          </blockquote>
        </figure>
      )}
    </section>
  );
}

function PersonalizationCard({ association }: { association: Association }) {
  return (
    <section className={`${CARD} flex flex-col`}>
      <CardTitle>Personalización</CardTitle>

      <div className="flex flex-wrap gap-8">
        <ColorSwatch label="Primario" value={association.primaryColor} />
        {association.secondaryColor && (
          <ColorSwatch label="Secundario" value={association.secondaryColor} />
        )}
      </div>

      <div className="mt-auto pt-8">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
          Tu página pública
        </p>
        <PublicUrlField
          slug={association.slug}
          accentColor={association.primaryColor}
        />
      </div>
    </section>
  );
}

function ColorSwatch({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-11 w-11 shrink-0 rounded-full ring-4 ring-white"
        style={{
          backgroundColor: value,
          boxShadow: `0 6px 16px -6px ${tint(value, 70)}`,
        }}
      />
      <div className="leading-tight">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="mt-0.5 font-mono text-xs uppercase text-gray-400">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: number;
  icon: typeof PawPrint;
  accent: string;
  hint: string;
}) {
  return (
    <section className={`${CARD} flex items-start justify-between gap-5`}>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-500">{label}</h3>
        <p className="mt-2 text-5xl font-extrabold leading-none tracking-tight text-gray-900">
          {value}
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
          <Sparkles size={13} strokeWidth={2} className="text-gray-300" />
          {hint}
        </p>
      </div>

      <span
        aria-hidden
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: tint(accent, 12), color: accent }}
      >
        <Icon size={24} strokeWidth={2.25} />
      </span>
    </section>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
      {children}
    </h2>
  );
}

export default DashboardPage;
