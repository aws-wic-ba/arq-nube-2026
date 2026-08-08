import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { signIn } from "aws-amplify/auth";
import { endSession, hasActiveSession } from "../../services/session";

/** Cognito distingue muchos casos de error; para quien se está logueando son
 *  todos lo mismo, y detallarlos de más le confirma a un atacante qué mails
 *  existen en el pool. */
function messageFor(error: unknown): string {
  const name = error instanceof Error ? error.name : "";

  switch (name) {
    case "NotAuthorizedException":
    case "UserNotFoundException":
      return "Email o contraseña incorrectos.";
    case "PasswordResetRequiredException":
      return "Necesitás restablecer tu contraseña antes de entrar.";
    case "TooManyRequestsException":
    case "LimitExceededException":
      return "Demasiados intentos. Esperá un momento y probá de nuevo.";
    default:
      return "No pudimos iniciar sesión. Intentá de nuevo.";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    hasActiveSession().then((isAuthenticated) => {
      if (cancelled || !isAuthenticated) return;
      navigate("/dashboard", { replace: true });
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await endSession();

      const { isSignedIn, nextStep } = await signIn({
        username: email.trim(),
        password,
      });

      if (!isSignedIn) {
        console.warn("Login pendiente de un paso extra:", nextStep.signInStep);
        setError(
          "Tu cuenta necesita un paso adicional para entrar. Escribinos y te ayudamos.",
        );
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Error de login:", err);
      setError(messageFor(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-200 px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-lg shadow-gray-900/5 sm:p-10">
        <div className="mb-8 flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Entrá a tu panel
          </h1>
          <p className="text-sm leading-relaxed text-gray-600">
            Usá el email y la contraseña con los que creaste tu refugio.
          </p>
        </div>

        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                size={17}
                strokeWidth={2}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="contacto@turefugio.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-gray-700"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock
                size={17}
                strokeWidth={2}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-11 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff size={17} strokeWidth={2} />
                ) : (
                  <Eye size={17} strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-terracotta-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-terracotta-500/25 transition-all hover:-translate-y-0.5 hover:bg-terracotta-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <>
                Entrando...
                <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />
              </>
            ) : (
              <>
                Entrar
                <ArrowRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Todavía no tenés tu refugio online?{" "}
          <a
            href="/#unite"
            className="font-semibold text-terracotta-600 underline decoration-terracotta-200 underline-offset-2 hover:text-terracotta-700"
          >
            Creá tu página
          </a>
        </p>
      </div>
    </div>
  );
}
