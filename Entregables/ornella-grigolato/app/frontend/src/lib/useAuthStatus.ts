import { useEffect, useState } from "react";
import { Hub } from "aws-amplify/utils";
import { hasActiveSession } from "../services/session";

export type AuthStatus = "checking" | "authenticated" | "anonymous";

/** Estado de sesión reactivo.*/
export function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    hasActiveSession().then((isAuthenticated) => {
      if (cancelled) return;
      setStatus(isAuthenticated ? "authenticated" : "anonymous");
    });

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
        case "tokenRefresh":
          setStatus("authenticated");
          break;
        // tokenRefresh_failure = el refresh token venció o fue revocado: la
        // sesión ya no se puede renovar sola.
        case "signedOut":
        case "tokenRefresh_failure":
          setStatus("anonymous");
          break;
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return status;
}
