import { PawPrint, ArrowRight, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-terracotta-200/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-terracotta-100/60 blur-3xl"
      />

      <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 flex flex-col gap-7">
          <span className="w-fit inline-flex items-center gap-2 bg-terracotta-50 text-terracotta-600 text-xs font-semibold uppercase tracking-wide px-3.5 py-1.5 rounded-full">
            <PawPrint size={14} strokeWidth={2.5} />
            Software para refugios de animales
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">
            Te ayudamos a <span className="text-terracotta-500">ayudarlos</span>
            .
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
            En MORAR sabemos todo lo que implica gestionar un refugio. Vos
            concentrate en ellos, nosotros nos encargamos del resto.
          </p>

          <div className="flex flex-wrap items-center gap-5 mt-2">
            <a
              href="#unite"
              className="inline-flex items-center gap-2 bg-terracotta-500 text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-md shadow-terracotta-500/25 hover:bg-terracotta-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Registrate
              <ArrowRight size={16} strokeWidth={2.5} />
            </a>
            <a
              href="#como-funciona"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              Saber más
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <ShieldCheck size={16} className="text-terracotta-500" />
            Sin tarjeta de crédito · Configurá tu refugio en minutos
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-sm">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-terracotta-200/60 -rotate-6"
            />
            <img
              src="https://morar-refugios-images.s3.us-east-1.amazonaws.com/HEADER.png"
              alt="Voluntaria acompañando a un perro rescatado"
              className="relative w-full h-auto object-cover aspect-square rounded-[60%_40%_30%_70%/60%_30%_70%_40%] shadow-xl"
            />

            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-md shadow-gray-900/5 px-4 py-3 flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-terracotta-50 text-terracotta-600">
                <PawPrint size={16} strokeWidth={2.5} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-gray-900">+120 refugios</p>
                <p className="text-xs text-gray-500">ya confían en MORAR</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
