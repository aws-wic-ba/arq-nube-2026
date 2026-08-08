import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Heart,
  HeartHandshake,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Share2,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Association } from "../../Types/Association";
import { tint } from "../../lib/color";

/** Fichas de ejemplo de la sección "Nuestros rescatados" (Serán datos reales en la Fase 2). */
const SAMPLE_RESCUES = [
  { name: "Luna", age: "2 años", trait: "Juguetona", photo: "" },
  { name: "Simón", age: "8 meses", trait: "Tranquilo", photo: "" },
  { name: "Mía", age: "4 años", trait: "Compañera", photo: "" },
];

const SOFT_SHADOW =
  "shadow-[0_1px_2px_rgba(28,25,23,0.04),0_18px_44px_-24px_rgba(28,25,23,0.22)]";

function RefugioPage() {
  const { slug } = useParams<{ slug: string }>();
  const [association, setAssociation] = useState<Association | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchAssociation = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL_GET}/dev2/associations/${slug}`,
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: { association: Association } = await response.json();
        setAssociation(data.association);
      } catch (err) {
        setFetchError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la información del refugio.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssociation();
  }, [slug]);

  const error = slug ? fetchError : "No se especificó un refugio.";
  const isBusy = Boolean(slug) && isLoading;

  return (
    <div className="min-h-screen bg-stone-50">
      {isBusy && <LoadingState />}
      {!isBusy && error && <ErrorState message={error} />}
      {!isBusy && !error && association && (
        <LandingContent association={association} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Estados                                                                    */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  // Esqueleto
  return (
    <div className="animate-pulse" aria-busy="true">
      <span className="sr-only">Cargando refugio...</span>
      <div className="h-[68px] bg-white" />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div className="space-y-5">
          <div className="h-7 w-40 rounded-full bg-stone-200/70" />
          <div className="h-12 w-4/5 rounded-2xl bg-stone-200" />
          <div className="h-4 w-full rounded-lg bg-stone-200/70" />
          <div className="h-4 w-2/3 rounded-lg bg-stone-200/70" />
          <div className="flex gap-3 pt-3">
            <div className="h-12 w-40 rounded-xl bg-stone-200" />
            <div className="h-12 w-36 rounded-xl bg-stone-200/70" />
          </div>
        </div>
        <div className="aspect-[4/3] rounded-3xl bg-stone-200" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
        <PawPrint size={26} strokeWidth={2} />
      </span>
      <p className="text-xl font-bold tracking-tight text-stone-900">
        No pudimos encontrar este refugio
      </p>
      <p className="max-w-md text-sm leading-relaxed text-stone-500">
        {message}
      </p>
      <a
        href="/"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
      >
        Ir a MORAR
        <ArrowRight size={16} strokeWidth={2.5} />
      </a>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Página                                                                     */
/* -------------------------------------------------------------------------- */

function LandingContent({ association }: { association: Association }) {
  const secondary = association.secondaryColor ?? association.primaryColor;

  return (
    <div
      className="relative bg-stone-50"
      style={
        {
          "--primary": association.primaryColor,
          "--secondary": secondary,
        } as React.CSSProperties
      }
    >
      <Navbar association={association} />
      <Hero association={association} />
      <About association={association} />
      <Rescues association={association} />
      <Contact association={association} />
      <Footer association={association} />
    </div>
  );
}

/* ------------------------------- Navbar ---------------------------------- */

const NAV_LINKS = [
  { label: "Sobre nosotros", href: "#sobre-nosotros" },
  { label: "Contacto", href: "#contacto" },
];

function Navbar({ association }: { association: Association }) {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <nav className="mx-auto flex max-w-6xl items-center justify-end gap-2 px-6 py-4 sm:gap-6 sm:py-5">
        <ul className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-white/60 hover:text-stone-900"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <ShareButton association={association} />
      </nav>
    </header>
  );
}

const COPY_FEEDBACK_MS = 2200;

function ShareButton({ association }: { association: Association }) {
  const [isCopied, setIsCopied] = useState(false);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  const handleShare = async () => {
    const url = window.location.href;

    // En mobile usamos el menú nativo
    if (navigator.share) {
      try {
        await navigator.share({
          title: association.name,
          text: `Conocé a ${association.name} y ayudalos a encontrar hogares.`,
          url,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(
        () => setIsCopied(false),
        COPY_FEEDBACK_MS,
      );
    } catch {
      console.error("No hay permiso de portapapeles");
      return;
    }
  };

  const feedbackLabel = isCopied ? "¡Link copiado!" : "Compartir esta página";

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={handleShare}
        title={feedbackLabel}
        aria-label={feedbackLabel}
        className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-white/60 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
      >
        {isCopied ? (
          <Check size={18} strokeWidth={2.75} className="text-green-600" />
        ) : (
          <Share2 size={18} strokeWidth={2.25} />
        )}
      </button>

      {isCopied && (
        <span className="pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded-full bg-stone-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm motion-safe:animate-backdrop-in">
          ¡Link copiado!
        </span>
      )}

      <span role="status" className="sr-only">
        {isCopied ? "Link copiado al portapapeles" : ""}
      </span>
    </div>
  );
}

/* -------------------------------- Hero ----------------------------------- */

function Hero({ association }: { association: Association }) {
  return (
    <section id="top" className="bg-white">
      <Cover />
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-20 text-center md:pb-28">
        <div className="relative z-10 -mt-14 sm:-mt-16">
          <Avatar association={association} size="xl" />
        </div>

        <h1 className="mt-6 text-4xl font-bold leading-tight text-stone-900 md:text-5xl">
          {association.name}
        </h1>

        <p className="mt-2 text-sm font-medium text-stone-400">
          @{association.slug}
        </p>

        <span
          className="mt-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: tint("var(--primary)", 10),
            color: "var(--primary)",
          }}
        >
          <MapPin size={14} strokeWidth={2.5} />
          {association.city}
        </span>

        <p className="mt-6 max-w-[37.5rem] text-lg leading-relaxed text-stone-600 md:text-xl md:leading-relaxed">
          Cada animal que rescatamos está esperando un lugar donde quedarse.
          Quizás ese lugar sea tu casa.
        </p>

        <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <a
            href="#contacto"
            className="inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: "var(--primary)",
              boxShadow: `0 12px 30px -12px ${tint("var(--primary)", 70)}`,
            }}
          >
            <PawPrint size={18} strokeWidth={2.5} />
            Quiero adoptar
          </a>

          <a
            href={`mailto:${association.email}?subject=${encodeURIComponent(
              `Quiero colaborar con ${association.name}`,
            )}`}
            className="inline-flex items-center justify-center gap-2.5 rounded-full border-2 bg-white px-8 py-4 text-base font-semibold transition-all hover:-translate-y-0.5"
            style={{
              borderColor: tint("var(--secondary)", 40),
              color: "var(--secondary)",
            }}
          >
            <Heart size={18} strokeWidth={2.5} />
            Quiero ayudar
          </a>
        </div>

        <p className="mt-7 flex items-center gap-2 text-sm text-stone-500">
          <HeartHandshake
            size={16}
            strokeWidth={2}
            style={{ color: "var(--primary)" }}
          />
          Adoptar es gratis · Te acompañamos en todo el proceso
        </p>
      </div>
    </section>
  );
}

function Cover() {
  return (
    <div
      className="relative h-44 w-full overflow-hidden sm:h-52 md:h-60"
      style={{ backgroundColor: tint("var(--primary)", 10) }}
    >
      {
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${tint("var(--primary)", 35)} 1.5px, transparent 1.5px)`,
            backgroundSize: "22px 22px",
          }}
        />
      }
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white"
      />
    </div>
  );
}

/* ------------------------------- Sobre nosotros --------------------------- */

function About({ association }: { association: Association }) {
  if (!association.description) return null;

  return (
    <section id="sobre-nosotros" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
        <SectionLabel>Sobre nosotros</SectionLabel>
        <figure className="mt-8">
          <span
            aria-hidden
            className="mx-auto mb-6 block h-1 w-14 rounded-full"
            style={{ backgroundColor: tint("var(--primary)", 55) }}
          />
          <blockquote className="text-2xl font-medium leading-relaxed tracking-tight text-stone-700 md:text-3xl md:leading-relaxed">
            {association.description}
          </blockquote>
          <figcaption className="mt-8 text-sm font-semibold text-stone-400">
            — El equipo de {association.name}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------- Rescatados ------------------------------- */

function Rescues({ association }: { association: Association }) {
  return (
    <section id="rescatados" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide"
            style={{
              backgroundColor: tint("var(--secondary)", 12),
              color: "var(--secondary)",
            }}
          >
            <Sparkles size={13} strokeWidth={2.5} />
            Próximamente
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 md:text-4xl">
            Nuestros rescatados
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-stone-500">
            Estamos preparando las fichas de cada animal de {association.name}.
            Muy pronto vas a poder conocerlos acá y empezar tu adopción online.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8">
          {SAMPLE_RESCUES.map((rescue) => (
            <RescueCard key={rescue.name} {...rescue} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RescueCard({
  name,
  age,
  trait,
  photo,
}: (typeof SAMPLE_RESCUES)[number]) {
  return (
    <article
      className={`overflow-hidden rounded-3xl bg-white ${SOFT_SHADOW} transition-transform hover:-translate-y-1`}
    >
      <div className="relative aspect-[4/3]">
        <Photo src={photo} alt="" iconSize={40} />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-stone-500 backdrop-blur-sm">
          Ejemplo
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold tracking-tight text-stone-900">
            {name}
          </h3>
          <p className="text-sm text-stone-500">{age}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: tint("var(--primary)", 10),
            color: "var(--primary)",
          }}
        >
          {trait}
        </span>
      </div>
    </article>
  );
}

/* -------------------------------- Contacto -------------------------------- */

function Contact({ association }: { association: Association }) {
  return (
    <section id="contacto" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mb-12 text-center">
          <SectionLabel>Contacto</SectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 md:text-4xl">
            Hablemos
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-stone-500">
            Escribinos para adoptar, ser hogar de tránsito o dar una mano. Te
            respondemos a la brevedad.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8">
          <ContactCard icon={MapPin} label="Ciudad" value={association.city} />
          <ContactCard
            icon={Phone}
            label="Teléfono"
            value={association.contactPhone}
            href={`tel:${association.contactPhone.replace(/\s/g, "")}`}
          />
          <ContactCard
            icon={Mail}
            label="Email"
            value={association.email}
            href={`mailto:${association.email}`}
          />
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: tint("var(--primary)", 10),
          color: "var(--primary)",
        }}
      >
        <Icon size={21} strokeWidth={2.25} />
      </span>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>
      <p className="mt-1.5 truncate text-base font-semibold text-stone-900">
        {value}
      </p>
    </>
  );

  const className = `flex flex-col rounded-3xl bg-stone-50 p-7 ${
    href ? "transition-colors hover:bg-stone-100" : ""
  }`;

  return href ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

/* --------------------------------- Footer --------------------------------- */

function Footer({ association }: { association: Association }) {
  return (
    <footer className="border-t border-stone-100 bg-stone-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 py-10 sm:flex-row">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar association={association} size="sm" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold text-stone-900">
              {association.name}
            </p>
            <p className="text-xs text-stone-400">{association.city}</p>
          </div>
        </div>

        <a
          href="/"
          className="group flex items-center gap-2 text-xs font-medium text-stone-400 transition-colors hover:text-stone-600"
        >
          Impulsado por
          <span className="flex items-center gap-1.5 font-extrabold tracking-tight text-stone-500 transition-colors group-hover:text-terracotta-600">
            <PawPrint size={13} strokeWidth={2.5} />
            MORAR
          </span>
        </a>
      </div>
    </footer>
  );
}

/* -------------------------------- Compartidos ----------------------------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs font-bold uppercase tracking-[0.14em]"
      style={{ color: "var(--primary)" }}
    >
      {children}
    </span>
  );
}

const AVATAR_SIZES = {
  sm: "h-9 w-9 text-sm ring-2",
  xl: "h-28 w-28 text-4xl ring-[6px] sm:h-32 sm:w-32 sm:text-5xl",
};

function Avatar({
  association,
  size,
}: {
  association: Association;
  size: keyof typeof AVATAR_SIZES;
}) {
  const box = `${AVATAR_SIZES[size]} shrink-0 rounded-full ring-white bg-white shadow-[0_10px_30px_-12px_rgba(28,25,23,0.35)]`;

  if (association.logoUrl) {
    return (
      <img
        src={association.logoUrl}
        alt={`Logo de ${association.name}`}
        className={`${box} object-cover`}
      />
    );
  }

  return (
    <span
      className={`${box} flex items-center justify-center font-extrabold`}
      style={{
        backgroundColor: tint("var(--primary)", 12),
        color: "var(--primary)",
      }}
    >
      {association.name.charAt(0).toUpperCase()}
    </span>
  );
}

function Photo({
  src,
  alt,
  iconSize = 40,
  hint,
}: {
  src: string;
  alt: string;
  iconSize?: number;
  hint?: string;
}) {
  if (src) {
    return <img src={src} alt={alt} className="h-full w-full object-cover" />;
  }

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3"
      style={{ backgroundColor: tint("var(--primary)", 7) }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <PawPrint
        size={iconSize}
        strokeWidth={1.5}
        style={{ color: tint("var(--primary)", 40) }}
      />
      {hint && (
        <p
          className="max-w-[14rem] px-4 text-center text-xs font-semibold"
          style={{ color: tint("var(--primary)", 70) }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export default RefugioPage;
