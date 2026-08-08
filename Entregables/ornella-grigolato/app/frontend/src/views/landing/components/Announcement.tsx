import { CheckCircle2, ArrowRight } from "lucide-react";

const TOOLS = [
  "Página pública personalizada para tu refugio",
  "Gestión de adopciones y seguimiento de animales",
  "Control de vacunas y tratamientos",
  "Reportes y estadísticas en tiempo real",
];

export default function Announcement() {
  return (
    <section id="herramientas" className="bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 w-full">
          <img
            src="https://www.konsultori.com/wp-content/uploads/2026/06/Grwoth-Navigator-Sales.jpg"
            alt="Panel de gestión de MORAR"
            className="w-full h-auto max-w-md mx-auto rounded-2xl shadow-md shadow-gray-900/5 object-cover aspect-square"
          />
        </div>

        <div className="flex-1 flex flex-col gap-6 max-w-lg">
          <span className="text-xs font-semibold uppercase tracking-wide text-terracotta-500">
            Herramientas
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            No te pierdas de todas las herramientas que tenemos para vos
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Conocé más sobre todo lo que MORAR puede facilitar en la gestión de
            tu refugio.
          </p>

          <ul className="flex flex-col gap-3">
            {TOOLS.map((tool) => (
              <li key={tool} className="flex items-start gap-3 text-gray-700">
                <CheckCircle2
                  size={20}
                  strokeWidth={2.25}
                  className="text-terracotta-500 shrink-0 mt-0.5"
                />
                <span className="leading-relaxed">{tool}</span>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <a
              href="#unite"
              className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 text-sm font-semibold px-5 py-3 rounded-xl hover:bg-gray-900 hover:text-white transition-colors"
            >
              Descubrí más
              <ArrowRight size={16} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
