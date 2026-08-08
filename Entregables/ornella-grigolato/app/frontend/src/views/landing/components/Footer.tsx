import { PawPrint } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto px-6 py-12 flex flex-col md:grid md:grid-cols-3 items-center gap-6 px-32">
        <div className="flex items-center gap-2.5 md:justify-self-start">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-terracotta-500 text-white">
            <PawPrint size={15} strokeWidth={2.25} />
          </span>
          <span className="text-lg font-extrabold text-white tracking-tight">
            MORAR
          </span>
        </div>

        <p className="text-sm text-gray-400 text-center md:justify-self-center">
          Software de gestión para refugios de animales.
        </p>

        <p className="text-sm text-gray-500 md:justify-self-end">
          © {new Date().getFullYear()} MORAR. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
