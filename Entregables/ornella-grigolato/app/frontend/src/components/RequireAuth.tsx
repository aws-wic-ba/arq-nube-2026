import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStatus } from "../lib/useAuthStatus";

/** Portero de las rutas privadas. Amplify lee los tokens del storage de forma
 *  asíncrona, así que hay un estado intermedio: sin él, el guard rebotaría al
 *  login por un frame antes de saber que la sesión existe. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStatus();

  if (status === "checking") {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-cream"
        aria-busy="true"
      >
        <span className="sr-only">Verificando tu sesión...</span>
        <Loader2
          size={28}
          strokeWidth={2.25}
          className="animate-spin text-terracotta-500"
        />
      </div>
    );
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
