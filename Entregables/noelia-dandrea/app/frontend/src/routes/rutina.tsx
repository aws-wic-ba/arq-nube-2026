import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { OBJETIVO_LABEL, ajustePorEdad, calcular, franjaEdad, rutina } from "@/lib/nutricion";
import { usePerfil } from "@/lib/usePerfil";
import { PerfilForm } from "@/components/PerfilForm";

export const Route = createFileRoute("/rutina")({
  head: () => ({
    meta: [
      { title: "Tu rutina según objetivo y edad — Cocina & Objetivo" },
      {
        name: "description",
        content:
          "Ejercicios para abdomen, piernas y tren superior adaptados a tu objetivo y a tu franja de edad, con series y técnica.",
      },
      { property: "og:title", content: "Tu rutina según objetivo y edad" },
      {
        property: "og:description",
        content: "Ejercicios adaptados a tu objetivo y a tu edad, con series, técnica y descanso.",
      },
    ],
  }),
  component: RutinaPage,
});

function RutinaPage() {
  const { perfil, setPerfil } = usePerfil();
  const ejercicios = useMemo(() => rutina(perfil.objetivo, perfil.edad), [perfil]);
  const resultado = useMemo(() => calcular(perfil), [perfil]);
  const zonas = ["Cardio", "Abdomen", "Piernas y glúteos", "Tren superior"] as const;

  return (
    <main className="mx-auto max-w-5xl px-5 pb-4">
      <section className="mt-8">
        <h1 className="text-3xl sm:text-4xl">Tu rutina</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Basada en tu objetivo ({OBJETIVO_LABEL[perfil.objetivo]}) y en tu franja de edad (
          {franjaEdad(perfil.edad)} años). No reemplaza la indicación de un profesional, pero sirve
          como punto de partida realista.
        </p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <PerfilForm perfil={perfil} onChange={setPerfil} />

        <div className="space-y-6">
          <div className="surface p-6">
            <h2 className="text-lg">Ajuste por edad</h2>
            <p className="mt-2 text-sm text-muted-foreground">{ajustePorEdad(perfil.edad)}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Con {resultado.calorias} kcal diarias y {resultado.proteinas} g de proteína, el
              entrenamiento de fuerza es lo que define si el peso que se mueve es grasa o músculo.
            </p>
          </div>

          {zonas.map((zona) => {
            const items = ejercicios.filter((e) => e.zona === zona);
            if (items.length === 0) return null;
            return (
              <div key={zona} className="surface p-6">
                <h2 className="text-lg">{zona}</h2>
                <ul className="mt-4 space-y-4">
                  {items.map((e) => (
                    <li key={e.nombre} className="border-l-2 border-accent/60 pl-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium">{e.nombre}</span>
                        <span className="text-xs text-muted-foreground">{e.series}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{e.como}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="surface p-6">
            <h2 className="text-lg">Tres reglas que sostienen todo</h2>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>1. Dormir 7 a 8 horas: sin descanso no hay recuperación ni saciedad.</li>
              <li>2. Progresar de a poco: sumá una repetición o un poco de peso por semana.</li>
              <li>3. Constancia sobre intensidad: tres días sostenidos ganan a cinco abandonados.</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
