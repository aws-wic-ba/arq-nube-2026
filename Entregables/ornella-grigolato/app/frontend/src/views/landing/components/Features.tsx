import type { LucideIcon } from "lucide-react";
import { FileEdit, Share2 } from "lucide-react";

interface FeatureCardProps {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

function FeatureCard({ step, title, description, icon: Icon }: FeatureCardProps) {
  return (
    <article className="flex flex-col gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-terracotta-50 flex items-center justify-center text-terracotta-600">
          <Icon size={22} strokeWidth={2.25} />
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-terracotta-500">
          Paso {step}
        </span>
      </div>
      <h3 className="font-bold text-xl text-gray-900 leading-snug">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </article>
  );
}

const FEATURES = [
  {
    step: "01",
    title: "Llená tus datos",
    description:
      "Contanos sobre tu refugio: su identidad, su imagen y los colores que lo representan.",
    icon: FileEdit,
  },
  {
    step: "02",
    title: "Compartí tu página y gestioná tu refugio",
    description:
      "Obtenés una URL única para compartir en tus redes y accedés a todas las herramientas de gestión.",
    icon: Share2,
  },
];

export default function Features() {
  return (
    <section id="como-funciona" className="bg-cream-200">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="max-w-xl mx-auto text-center flex flex-col gap-3 mb-14">
          <span className="text-xs font-semibold uppercase tracking-wide text-terracotta-500">
            Cómo funciona
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Empezá en dos simples pasos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {FEATURES.map((f) => (
            <FeatureCard key={f.step} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
