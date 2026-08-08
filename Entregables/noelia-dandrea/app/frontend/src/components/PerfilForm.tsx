import {
  ACTIVIDAD_FACTOR,
  OBJETIVO_LABEL,
  type Actividad,
  type Objetivo,
  type Perfil,
  type Sexo,
} from "@/lib/nutricion";

const ACTIVIDAD_LABEL: Record<Actividad, string> = {
  sedentaria: "Sedentaria (trabajo de escritorio)",
  ligera: "Ligera (camino, entreno 1-2 veces)",
  moderada: "Moderada (entreno 3-4 veces)",
  alta: "Alta (entreno 5+ veces o trabajo físico)",
};

export function PerfilForm({
  perfil,
  onChange,
}: {
  perfil: Perfil;
  onChange: (p: Perfil) => void;
}) {
  const set = <K extends keyof Perfil>(k: K, v: Perfil[K]) => onChange({ ...perfil, [k]: v });

  return (
    <div className="surface h-fit p-6">
      <h2 className="text-xl">Tu perfil</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Se guarda en tu navegador. Con esto calculo todo lo demás.
      </p>

      <div className="mt-5 space-y-4">
        <Field label="Objetivo">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-secondary/70 p-1">
            {(Object.keys(OBJETIVO_LABEL) as Objetivo[]).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => set("objetivo", o)}
                className={
                  "rounded-lg px-2 py-2 text-xs font-medium transition-colors " +
                  (perfil.objetivo === o
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {OBJETIVO_LABEL[o]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Sexo biológico">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary/70 p-1">
            {(["f", "m"] as Sexo[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set("sexo", s)}
                className={
                  "rounded-lg px-2 py-2 text-xs font-medium transition-colors " +
                  (perfil.sexo === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {s === "f" ? "Femenino" : "Masculino"}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Edad">
            <NumberInput
              value={perfil.edad}
              min={15}
              max={95}
              onChange={(v) => set("edad", v)}
              suffix="años"
            />
          </Field>
          <Field label="Peso">
            <NumberInput
              value={perfil.peso}
              min={35}
              max={220}
              onChange={(v) => set("peso", v)}
              suffix="kg"
            />
          </Field>
          <Field label="Altura">
            <NumberInput
              value={perfil.altura}
              min={130}
              max={220}
              onChange={(v) => set("altura", v)}
              suffix="cm"
            />
          </Field>
        </div>

        <Field label="Nivel de actividad">
          <select
            value={perfil.actividad}
            onChange={(e) => set("actividad", e.target.value as Actividad)}
            className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
          >
            {(Object.keys(ACTIVIDAD_FACTOR) as Actividad[]).map((a) => (
              <option key={a} value={a}>
                {ACTIVIDAD_LABEL[a]}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix: string;
}) {
  return (
    <div className="flex items-center rounded-xl border border-input bg-card px-2.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25">
      <input
        type="number"
        value={Number.isFinite(value) ? value : ""}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Math.min(max, Math.max(min, Number.isFinite(n) ? n : min)));
        }}
        className="w-full bg-transparent py-2.5 text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="pl-1 text-xs text-muted-foreground">{suffix}</span>
    </div>
  );
}
