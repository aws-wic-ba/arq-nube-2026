import type { GlossaryTermData } from "../types";

/**
 * Glosario / Traductor de Jerga IT.
 * Cada término está explicado "con manzanas" — sin tecnicismos.
 */
export const glossaryData: GlossaryTermData[] = [
  {
    id: "g-deploy",
    term: "Deploy",
    definition:
      "Es como publicar una foto en Instagram: tomás tu código terminado y lo 'subís' para que todos puedan usarlo. Cuando decimos 'deployar', significa poner tu aplicación disponible en internet.",
    categories: ["desarrollo", "cloud"],
  },
  {
    id: "g-sla",
    term: "SLA",
    definition:
      "Es una promesa escrita entre una empresa y sus clientes: 'te garantizamos que el servicio va a funcionar el 99.9% del tiempo'. Si no se cumple, hay consecuencias. Como una garantía de electrodoméstico, pero para servicios digitales.",
    categories: ["soporte", "cloud"],
  },
  {
    id: "g-cloud",
    term: "Cloud (La Nube)",
    definition:
      "Son computadoras de otra empresa (como Amazon o Microsoft) que vos alquilás por internet en vez de tener las tuyas propias. Es como alquilar un departamento en vez de construir una casa.",
    categories: ["cloud"],
  },
  {
    id: "g-saas",
    term: "SaaS",
    definition:
      "Software que usás por internet sin instalar nada. Gmail, Spotify, Netflix... todos son SaaS. Pagás (o no) y lo usás desde el navegador. No te preocupás por actualizaciones ni mantenimiento.",
    categories: ["cloud", "desarrollo"],
  },
  {
    id: "g-api",
    term: "API",
    definition:
      "Es como un mozo en un restaurante: vos le pedís algo (datos, una acción), el mozo va a la cocina (el servidor), y te trae la respuesta. Las apps se comunican entre sí usando APIs.",
    categories: ["desarrollo", "cloud"],
  },
  {
    id: "g-frontend",
    term: "Frontend",
    definition:
      "Todo lo que VES y TOCÁS en una web o app: los botones, los colores, las animaciones, los formularios. Es la parte visible, la cara bonita del software.",
    categories: ["desarrollo", "ux-ui"],
  },
  {
    id: "g-backend",
    term: "Backend",
    definition:
      "Todo lo que pasa POR DETRÁS y no ves: la base de datos, la lógica de login, los cálculos. Si el frontend es el salón del restaurante, el backend es la cocina.",
    categories: ["desarrollo"],
  },
  {
    id: "g-firewall",
    term: "Firewall",
    definition:
      "Un guardia de seguridad digital que decide quién entra y quién no a tu red o servidor. Revisa cada 'visitante' (dato) y bloquea a los sospechosos.",
    categories: ["ciberseguridad", "soporte"],
  },
  {
    id: "g-phishing",
    term: "Phishing",
    definition:
      "Cuando alguien se hace pasar por una empresa (como tu banco) para robarte datos. Ese mail 'urgente' pidiéndote la contraseña... es phishing. La palabra viene de 'fishing' (pescar), porque tiran el anzuelo y esperan que muerdas.",
    categories: ["ciberseguridad"],
  },
  {
    id: "g-git",
    term: "Git",
    definition:
      "Una máquina del tiempo para tu código. Guardás versiones de tu trabajo y si algo se rompe, podés volver atrás. También permite que varias personas trabajen en el mismo código sin pisarse.",
    categories: ["desarrollo"],
  },
  {
    id: "g-ticket",
    term: "Ticket",
    definition:
      "Un pedido formal de ayuda. Cuando alguien tiene un problema técnico, crea un 'ticket' (como sacar número en el banco) y el equipo de soporte lo resuelve en orden de prioridad.",
    categories: ["soporte"],
  },
  {
    id: "g-wireframe",
    term: "Wireframe",
    definition:
      "Un boceto rápido de cómo va a verse una pantalla, sin colores ni detalles. Es como el plano de una casa antes de construirla: solo muestra dónde va cada cosa.",
    categories: ["ux-ui"],
  },
  {
    id: "g-responsive",
    term: "Responsive",
    definition:
      "Que se ve bien tanto en el celular como en la computadora. El diseño se adapta al tamaño de pantalla, como el agua que toma la forma del vaso.",
    categories: ["desarrollo", "ux-ui"],
  },
  {
    id: "g-docker",
    term: "Docker",
    definition:
      "Una caja mágica donde metés tu aplicación con TODO lo que necesita para funcionar. Así podés moverla a cualquier computadora y va a funcionar igual. Como llevar tu habitación entera a otro país.",
    categories: ["cloud", "desarrollo"],
  },
  {
    id: "g-vpn",
    term: "VPN",
    definition:
      "Un túnel secreto por internet. Nadie puede ver qué hacés o desde dónde te conectás. Las empresas lo usan para que sus empleados accedan a sistemas internos de forma segura desde casa.",
    categories: ["ciberseguridad", "soporte"],
  },
];
