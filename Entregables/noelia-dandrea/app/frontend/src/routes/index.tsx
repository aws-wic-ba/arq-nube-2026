import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  INGREDIENTES,
  OBJETIVO_LABEL,
  ORDEN_INGESTA,
  buscarRecetas,
  calcular,
} from "@/lib/nutricion";
import { usePerfil } from "@/lib/usePerfil";
import { PerfilForm } from "@/components/PerfilForm";
import { PlatoIdeal } from "@/components/PlatoIdeal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cocina & Objetivo — recetas con lo que tenés en casa" },
      {
        name: "description",
        content:
          "Cargá tu perfil, marcá los ingredientes que tenés y obtené recetas, las proporciones del plato y el orden en el que conviene comer.",
      },
      { property: "og:title", content: "Cocina & Objetivo — recetas con lo que tenés en casa" },
      {
        property: "og:description",
        content:
          "Recetas según tus ingredientes y tu objetivo, con proporciones del plato y orden de ingesta.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { perfil, setPerfil } = usePerfil();
  const [seleccion, setSeleccion] = useState<string[]>(["huevo", "espinaca", "cebolla", "queso"]);
  const [estricto, setEstricto] = useState(false);

  const resultado = useMemo(() => calcular(perfil), [perfil]);
  const recetas = useMemo(
    () => buscarRecetas(seleccion, perfil.objetivo, estricto),
    [seleccion, perfil.objetivo, estricto],
  );

  const toggle = (ing: string) =>
    setSeleccion((s) => (s.includes(ing) ? s.filter((i) => i !== ing) : [...s, ing]));

  return (
    <main className="mx-auto max-w-5xl px-5 pb-4">
      <section className="hero-gradient mt-6 overflow-hidden rounded-3xl px-7 py-12 text-primary-foreground sm:px-12 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-80">
          Nutrición práctica, sin dietas imposibles
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">
          Cociná con lo que ya tenés en la heladera, según tu objetivo.
        </h1>
        <p className="mt-4 max-w-xl text-sm/relaxed opacity-90">
          Cargás tu peso, altura y edad, marcás los ingredientes que hay en casa y la app te arma
          las recetas posibles, las proporciones del plato, el orden en el que conviene comer para
          saciarte y una rutina acorde a tu edad.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
        <PerfilForm perfil={perfil} onChange={setPerfil} />

        <div className="surface p-6">
          <h2 className="text-xl">Tu día en números</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Objetivo: {OBJETIVO_LABEL[perfil.objetivo]} · IMC {resultado.imc} (
            {resultado.imcCategoria})
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Calorías" value={`${resultado.calorias}`} unit="kcal/día" destacado />
            <Metric label="Proteínas" value={`${resultado.proteinas}`} unit="g" />
            <Metric label="Carbohidratos" value={`${resultado.carbos}`} unit="g" />
            <Metric label="Grasas" value={`${resultado.grasas}`} unit="g" />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Metabolismo basal {resultado.tmb} kcal · mantenimiento {resultado.mantenimiento} kcal ·
            agua sugerida {resultado.agua} L por día.
          </p>

          <div className="mt-6 border-t border-border pt-6">
            <PlatoIdeal plato={resultado.plato} objetivo={perfil.objetivo} />
          </div>
        </div>
      </section>

      <section className="surface mt-6 p-6">
        <h2 className="text-xl">El orden en el que comés cambia el resultado</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Con los mismos alimentos, comerlos en este orden baja el pico de glucemia y te deja más
          saciada.
        </p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2">
          {ORDEN_INGESTA.map((o) => (
            <li key={o.paso} className="rounded-xl bg-secondary/60 p-4">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {o.paso}
                </span>
                <span className="font-medium">{o.titulo}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{o.detalle}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">¿Qué tenés en casa?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Marcá los ingredientes disponibles. Las recetas se ordenan por afinidad con tu objetivo y
          por cuánto podés cocinar sin ir al súper.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {INGREDIENTES.map((ing) => {
            const activo = seleccion.includes(ing);
            return (
              <button
                key={ing}
                type="button"
                onClick={() => toggle(ing)}
                aria-pressed={activo}
                className={
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors " +
                  (activo
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground")
                }
              >
                {ing}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={estricto}
              onChange={(e) => setEstricto(e.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            Solo recetas que puedo hacer sin comprar nada
          </label>
          <button
            type="button"
            onClick={() => setSeleccion([])}
            className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Limpiar selección
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {recetas.map((r) => (
            <article key={r.id} className="surface flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg leading-snug">{r.nombre}</h3>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {r.match}% match
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.minutos} min · {r.kcal} kcal · {r.proteina} g de proteína ·{" "}
                {r.objetivos.map((o) => OBJETIVO_LABEL[o]).join(" / ")}
              </p>
              <p className="mt-3 text-sm">{r.pasos}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Tenés:</span>{" "}
                {r.tenes.join(", ") || "—"}
              </p>
              {r.faltan.length > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium text-accent">Te falta:</span> {r.faltan.join(", ")}
                </p>
              )}
              <p className="mt-4 rounded-lg bg-secondary/60 p-3 text-xs text-secondary-foreground">
                {r.tip}
              </p>
            </article>
          ))}
          {recetas.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay recetas con esa combinación. Probá destildar la opción estricta o sumar algún
              ingrediente más.
            </p>
          )}
        </div>
      </section>

      <section className="surface mt-10 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-xl">¿Y el movimiento?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Armé la rutina según tu objetivo y tu edad, con los ajustes que corresponden.
          </p>
        </div>
        <Link
          to="/rutina"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Ver mi rutina
        </Link>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  unit,
  destacado,
}: {
  label: string;
  value: string;
  unit: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl p-4 " + (destacado ? "bg-primary text-primary-foreground" : "bg-secondary/60")
      }
    >
      <p className="text-xs opacity-80">{label}</p>
      <p className="font-display text-2xl font-semibold">{value}</p>
      <p className="text-xs opacity-70">{unit}</p>
    </div>
  );
}
