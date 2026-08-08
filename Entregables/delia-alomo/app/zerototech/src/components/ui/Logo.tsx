import { cn } from "@/utils/cn";

interface LogoProps {
  /** Size in pixels (default 40) */
  size?: number;
  /** Enable subtle rotation animation */
  animated?: boolean;
  /** Show "ZeroToTech" text next to the icon */
  showText?: boolean;
  className?: string;
}

/**
 * ZeroToTech Logo — Compass Rose + 8-Point Star in Circle.
 * Built in pure SVG. Gradient: aqua → lavender → pink.
 * Reusable across header, footer, loading, favicon.
 */
export function Logo({ size = 40, animated = false, showText = true, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Isotipo SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(animated && "animate-[spin_20s_linear_infinite]")}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7FFFD0" />
            <stop offset="50%" stopColor="#9C8CFF" />
            <stop offset="100%" stopColor="#FF9ECD" />
          </linearGradient>
        </defs>

        {/* Outer circle */}
        <circle cx="32" cy="32" r="30" stroke="url(#logo-gradient)" strokeWidth="1.5" fill="none" opacity="0.7" />

        {/* 8-point star (compass rose) */}
        <path
          d="M32 4L35.5 28.5L56 20L37 32L56 44L35.5 35.5L32 60L28.5 35.5L8 44L27 32L8 20L28.5 28.5L32 4Z"
          fill="url(#logo-gradient)"
          opacity="0.9"
        />

        {/* Inner circle accent */}
        <circle cx="32" cy="32" r="6" fill="url(#logo-gradient)" opacity="0.6" />

        {/* Cardinal points (compass) */}
        <circle cx="32" cy="6" r="1.5" fill="url(#logo-gradient)" />
        <circle cx="32" cy="58" r="1.5" fill="url(#logo-gradient)" />
        <circle cx="6" cy="32" r="1.5" fill="url(#logo-gradient)" />
        <circle cx="58" cy="32" r="1.5" fill="url(#logo-gradient)" />
      </svg>

      {/* Wordmark */}
      {showText && (
        <span className="font-display text-xl font-bold tracking-tight bg-gradient-brand bg-clip-text text-transparent">
          ZeroToTech
        </span>
      )}
    </div>
  );
}
