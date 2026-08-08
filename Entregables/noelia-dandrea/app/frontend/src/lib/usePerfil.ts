import { useEffect, useState } from "react";
import type { Perfil } from "./nutricion";

const KEY = "cyo-perfil";

export const PERFIL_DEFAULT: Perfil = {
  sexo: "f",
  edad: 32,
  peso: 68,
  altura: 165,
  actividad: "ligera",
  objetivo: "bajar",
};

export function usePerfil() {
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setPerfil({ ...PERFIL_DEFAULT, ...JSON.parse(raw) });
    } catch {
      /* perfil por defecto */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(perfil));
    } catch {
      /* sin persistencia */
    }
  }, [perfil, hydrated]);

  return { perfil, setPerfil, hydrated };
}
