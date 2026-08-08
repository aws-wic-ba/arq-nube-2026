import { cn } from "@/utils/cn";

type LogoVariant = "navbar" | "hero" | "favicon" | "app-icon" | "loading";
type ColorMode = "dark" | "light";

interface BrandLogoProps {
  /** Size in pixels */
  size?: number;
  /** Variant determines level of detail */
  variant?: LogoVariant;
  /** Enable breathing glow animation */
  animated?: boolean;
  /** Show glow effect */
  showGlow?: boolean;
  /** Light or dark background */
  colorMode?: ColorMode;
  className?: string;
}

/**
 * BrandLogo — ZeroToTech compass rose.
 *
 * 8-point star inside a thin ring with gradient:
 * Aqua → Celeste → Violeta → Rosa → Durazno
 *
 * Variants:
 * - navbar: clean, no particles, 34px
 * - hero: glow + sparkles
 * - favicon: simplified, star + ring only
 * - app-icon: centered on dark bg
 * - loading: infinite slow rotation
 */
export function BrandLogo({
  size = 40,
  variant = "navbar",
  animated = false,
  showGlow = false,
  colorMode = "dark",
  className,
}: BrandLogoProps) {
  const showSparkles = variant === "hero";
  const isLoading = variant === "loading";
  const hasGlow = showGlow || variant === "hero";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        isLoading && "animate-[spin_12s_linear_infinite]",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Glow layer */}
      {hasGlow && (
        <div
          className="absolute inset-0 rounded-full opacity-40 blur-xl animate-glow-pulse"
          style={{
            background: "radial-gradient(circle, rgba(127,255,208,0.3) 0%, rgba(156,140,255,0.2) 50%, transparent 70%)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Main SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          animated && !isLoading && "transition-transform duration-250 hover:rotate-[8deg] hover:scale-105"
        )}
        aria-hidden="true"
      >
        <defs>
          {/* Main gradient: aqua → celeste → violeta → rosa → durazno */}
          <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7FFFD0" />
            <stop offset="25%" stopColor="#7EC8E3" />
            <stop offset="50%" stopColor="#9C8CFF" />
            <stop offset="75%" stopColor="#FF9ECD" />
            <stop offset="100%" stopColor="#FFD6A5" />
          </linearGradient>
          {/* Star fill gradient */}
          <linearGradient id="star-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7FFFD0" />
            <stop offset="35%" stopColor="#7EC8E3" />
            <stop offset="65%" stopColor="#9C8CFF" />
            <stop offset="100%" stopColor="#FF9ECD" />
          </linearGradient>
        </defs>

        {/* Outer ring */}
        <circle
          cx="32" cy="32" r="29"
          stroke="url(#brand-grad)"
          strokeWidth="1.8"
          fill="none"
        />

        {/* 8-point star (compass rose) */}
        <path
          d="M32 6 L34.5 27 L50 14 L37 29.5 L58 32 L37 34.5 L50 50 L34.5 37 L32 58 L29.5 37 L14 50 L27 34.5 L6 32 L27 29.5 L14 14 L29.5 27 Z"
          fill="url(#star-grad)"
        />

        {/* Cardinal diamond points on ring */}
        <path d="M32 2 L33.5 5.5 L32 9 L30.5 5.5 Z" fill="url(#brand-grad)" />
        <path d="M32 55 L33.5 58.5 L32 62 L30.5 58.5 Z" fill="url(#brand-grad)" />
        <path d="M2 32 L5.5 30.5 L9 32 L5.5 33.5 Z" fill="url(#brand-grad)" />
        <path d="M55 32 L58.5 30.5 L62 32 L58.5 33.5 Z" fill="url(#brand-grad)" />

        {/* Sparkles (hero variant only) */}
        {showSparkles && (
          <>
            <path d="M52 10 L52.8 12 L52 14 L51.2 12 Z" fill="#9C8CFF" opacity="0.6" />
            <path d="M12 50 L12.6 51.5 L12 53 L11.4 51.5 Z" fill="#7FFFD0" opacity="0.5" />
            <path d="M54 46 L54.5 47 L54 48 L53.5 47 Z" fill="#FF9ECD" opacity="0.5" />
            <path d="M10 16 L10.5 17 L10 18 L9.5 17 Z" fill="#FFD6A5" opacity="0.5" />
            <circle cx="56" cy="28" r="0.8" fill="#9C8CFF" opacity="0.4" />
            <circle cx="8" cy="38" r="0.8" fill="#7FFFD0" opacity="0.4" />
          </>
        )}
      </svg>
    </div>
  );
}
