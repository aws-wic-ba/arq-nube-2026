import { OBJETIVO_LABEL, type Objetivo } from "@/lib/nutricion";

const PARTES = [
  { key: "verduras", label: "Verduras y fibra", color: "var(--plate-verduras)" },
  { key: "proteina", label: "Proteína", color: "var(--plate-proteina)" },
  { key: "carbos", label: "Carbohidratos", color: "var(--plate-carbos)" },
  { key: "grasas", label: "Grasas buenas", color: "var(--plate-grasas)" },
] as const;

export function PlatoIdeal({
  plato,
  objetivo,
}: {
  plato: { verduras: number; proteina: number; carbos: number; grasas: number };
  objetivo: Objetivo;
}) {
  let acumulado = 0;
  const stops = PARTES.map((p) => {
    const desde = acumulado;
    acumulado += plato[p.key];
    return `${p.color} ${desde}% ${acumulado}%`;
  }).join(", ");

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        className="size-36 shrink-0 rounded-full border-4 border-card shadow-[var(--shadow-soft)]"
        style={{ background: `conic-gradient(${stops})` }}
        role="img"
        aria-label={`Proporciones del plato para ${OBJETIVO_LABEL[objetivo]}`}
      />
      <div className="min-w-[190px] flex-1">
        <h3 className="text-base font-medium">Cómo armar el plato</h3>
        <ul className="mt-3 space-y-2">
          {PARTES.map((p) => (
            <li key={p.key} className="flex items-center gap-2 text-sm">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: p.color }}
                aria-hidden
              />
              <span className="flex-1">{p.label}</span>
              <span className="font-medium tabular-nums">{plato[p.key]}%</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Proporciones por superficie del plato, no por peso. Un plato de 24 cm alcanza para casi
          cualquier comida principal.
        </p>
      </div>
    </div>
  );
}
