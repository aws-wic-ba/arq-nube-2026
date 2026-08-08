import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import { ArrowRight, Check, X } from "lucide-react";
import PublicUrlField from "../../../components/PublicUrlField";

interface JoinSuccessModalProps {
  associationName: string;
  slug: string;
  onGoToDashboard: () => void;
  onClose: () => void;
}

const EXIT_DURATION_MS = 140;

export default function JoinSuccessModal({
  associationName,
  slug,
  onGoToDashboard,
  onClose,
}: JoinSuccessModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const exitTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();

    panelRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      if (exitTimeout.current) clearTimeout(exitTimeout.current);
      dialog?.close();
    };
  }, []);

  const close = (action?: () => void) => {
    if (isClosing) return;
    setIsClosing(true);
    exitTimeout.current = setTimeout(() => {
      dialogRef.current?.close();
      onClose();
      action?.();
    }, EXIT_DURATION_MS);
  };

  // Frena el cierre nativo instantáneo para que se vea la animación.
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    close();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) close();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="join-success-title"
      aria-describedby="join-success-description"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="hidden open:flex fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-4 backdrop:bg-gray-900/60 backdrop:motion-safe:animate-backdrop-in"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-8 text-center shadow-2xl shadow-gray-900/25 outline-none sm:p-10 ${
          isClosing
            ? "motion-safe:animate-dialog-out"
            : "motion-safe:animate-dialog-in"
        }`}
      >
        <button
          type="button"
          onClick={() => close()}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500/40"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-green-500/30 motion-safe:animate-halo"
          />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-100 motion-safe:animate-check-pop">
            <Check size={32} strokeWidth={3} className="text-green-600" />
          </span>
        </div>

        <h2
          id="join-success-title"
          className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl"
        >
          ¡Todo listo!
        </h2>
        <p
          id="join-success-description"
          className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base"
        >
          Ya creamos la página de{" "}
          <span className="font-semibold text-gray-900">{associationName}</span>
          . Entrá al panel para cargar tus animales y empezar a recibir
          adopciones.
        </p>

        <div className="mt-6">
          <PublicUrlField slug={slug} />
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => close(onGoToDashboard)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-terracotta-500/25 transition-all hover:-translate-y-0.5 hover:bg-terracotta-600 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500/40"
          >
            Ir a mi panel
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => close()}
            className="w-full rounded-xl px-6 py-3 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          >
            Quizás más tarde
          </button>
        </div>
      </div>
    </dialog>
  );
}
