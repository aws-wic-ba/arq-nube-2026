import { useEffect, useRef, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

interface PublicUrlFieldProps {
  slug: string;
  /** Color de ícono y hover del botón copiar. En el dashboard le
   *  paso el color primario del refugio; sin prop cae al terracota de MORAR. */
  accentColor?: string;
}

type CopyStatus = "idle" | "copied" | "error";

const FEEDBACK_DURATION_MS = 2200;

const FEEDBACK_MESSAGES: Record<CopyStatus, string> = {
  idle: "",
  copied: "¡Link copiado!",
  error: "No pudimos copiar el link. Ya está seleccionado: usá Ctrl+C.",
};

export default function PublicUrlField({
  slug,
  accentColor,
}: PublicUrlFieldProps) {
  const urlRef = useRef<HTMLSpanElement>(null);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  const path = `/refugio/${slug}`;
  const displayUrl = `${window.location.host}${path}`;
  const absoluteUrl = `${window.location.origin}${path}`;

  const showFeedback = (next: CopyStatus) => {
    setStatus(next);
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = setTimeout(
      () => setStatus("idle"),
      FEEDBACK_DURATION_MS,
    );
  };

  // Si el navegador no deja tocar el portapapeles, al menos
  // dejo el texto seleccionado para copiarlo a mano.
  const selectUrlText = () => {
    const node = urlRef.current;
    if (!node) return;

    const range = document.createRange();
    range.selectNodeContents(node);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      showFeedback("copied");
    } catch {
      selectUrlText();
      showFeedback("error");
    }
  };

  const isCopied = status === "copied";

  return (
    <div
      style={
        accentColor
          ? ({ "--accent": accentColor } as React.CSSProperties)
          : undefined
      }
    >
      <div className="flex items-center gap-2 rounded-xl border border-cream-200 bg-cream px-3 py-2.5 transition-colors focus-within:border-[var(--accent,var(--color-terracotta-500))]/40">
        <Link2
          size={15}
          strokeWidth={2}
          className="shrink-0 text-[var(--accent,var(--color-terracotta-500))]"
        />
        <span
          ref={urlRef}
          className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-gray-700"
        >
          {displayUrl}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          title={isCopied ? "Link copiado" : "Copiar link"}
          aria-label={isCopied ? "Link copiado" : "Copiar link"}
          className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-[var(--accent,var(--color-terracotta-600))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent,var(--color-terracotta-500))]/40"
        >
          {isCopied ? (
            <Check size={15} strokeWidth={2.5} className="text-green-600" />
          ) : (
            <Copy size={15} strokeWidth={2.5} />
          )}
        </button>
      </div>

      <p
        role="status"
        className={`min-h-4 pt-1.5 text-xs font-medium ${
          status === "error" ? "text-red-500" : "text-green-600"
        }`}
      >
        {FEEDBACK_MESSAGES[status]}
      </p>
    </div>
  );
}
