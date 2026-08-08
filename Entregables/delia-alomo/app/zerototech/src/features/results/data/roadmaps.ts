import type { RoadmapData } from "../types";
import type { ITCategory } from "@/features/discovery/types";

/**
 * Roadmaps por categoría IT.
 * Cada uno tiene 4 fases: Fundamentos → Herramientas → Certificaciones → Proyectos
 */
const roadmaps: Record<ITCategory, RoadmapData> = {
  soporte: {
    category: "soporte",
    roleName: "IT Support & Soporte Técnico",
    roleEmoji: "🔧",
    motivationalMessage:
      "Tenés esa capacidad natural de resolver problemas y ayudar a los demás. El mundo IT necesita personas como vos que hagan que todo funcione.",
    phases: [
      {
        id: "soporte-f1",
        phase: 1,
        title: "Fundamentos",
        emoji: "📚",
        nodes: [
          {
            id: "soporte-f1-n1",
            title: "Cómo funciona una computadora",
            description: "Hardware, software y sistemas operativos básicos.",
            xp: 25,
            resources: [
              { title: "CS50 - Intro a Computación (español)", url: "https://cs50.harvard.edu/x/", type: "curso" },
              { title: "¿Cómo funciona un PC?", url: "https://www.youtube.com/results?search_query=como+funciona+una+computadora", type: "video" },
            ],
          },
          {
            id: "soporte-f1-n2",
            title: "Redes básicas",
            description: "IP, DNS, Wi-Fi y cómo se conecta todo en internet.",
            xp: 30,
            resources: [
              { title: "Redes desde cero", url: "https://www.youtube.com/results?search_query=redes+informaticas+basico", type: "video" },
              { title: "Modelo OSI explicado fácil", url: "https://www.cloudflare.com/es-es/learning/ddos/glossary/open-systems-interconnection-model-osi/", type: "artículo" },
            ],
          },
        ],
      },
      {
        id: "soporte-f2",
        phase: 2,
        title: "Herramientas",
        emoji: "🛠️",
        nodes: [
          {
            id: "soporte-f2-n1",
            title: "Sistemas operativos: Windows y Linux",
            description: "Instalación, configuración y resolución de problemas comunes.",
            xp: 35,
            resources: [
              { title: "Linux desde cero", url: "https://www.youtube.com/results?search_query=linux+para+principiantes", type: "video" },
              { title: "Comandos esenciales de terminal", url: "https://www.freecodecamp.org/news/the-linux-commands-handbook/", type: "artículo" },
            ],
          },
          {
            id: "soporte-f2-n2",
            title: "Herramientas de soporte remoto",
            description: "TeamViewer, AnyDesk, sistemas de tickets.",
            xp: 25,
            resources: [
              { title: "Herramientas de Help Desk", url: "https://www.youtube.com/results?search_query=herramientas+help+desk", type: "video" },
            ],
          },
        ],
      },
      {
        id: "soporte-f3",
        phase: 3,
        title: "Certificaciones sugeridas",
        emoji: "🎓",
        nodes: [
          {
            id: "soporte-f3-n1",
            title: "Google IT Support Professional",
            description: "Certificación gratuita de Google que cubre todo lo básico de soporte IT.",
            xp: 50,
            resources: [
              { title: "Google IT Support en Coursera", url: "https://www.coursera.org/professional-certificates/google-it-support", type: "curso" },
            ],
          },
          {
            id: "soporte-f3-n2",
            title: "CompTIA A+",
            description: "La certificación más reconocida para iniciar en soporte técnico.",
            xp: 50,
            resources: [
              { title: "Guía CompTIA A+", url: "https://www.comptia.org/certifications/a", type: "artículo" },
            ],
          },
        ],
      },
      {
        id: "soporte-f4",
        phase: 4,
        title: "Proyectos",
        emoji: "🚀",
        nodes: [
          {
            id: "soporte-f4-n1",
            title: "Armar tu propio laboratorio",
            description: "Configurá una red virtual con VirtualBox o Hyper-V para practicar.",
            xp: 60,
            resources: [
              { title: "Crear lab con VirtualBox", url: "https://www.youtube.com/results?search_query=laboratorio+virtual+virtualbox", type: "video" },
            ],
          },
        ],
      },
    ],
  },

  cloud: {
    category: "cloud",
    roleName: "Cloud & Infrastructure Explorer",
    roleEmoji: "☁️",
    motivationalMessage:
      "Pensás en sistemas, en automatización, en que las cosas funcionen bien a escala. La nube es tu playground natural.",
    phases: [
      {
        id: "cloud-f1",
        phase: 1,
        title: "Fundamentos",
        emoji: "📚",
        nodes: [
          {
            id: "cloud-f1-n1",
            title: "¿Qué es la nube?",
            description: "Conceptos de cloud computing, IaaS, PaaS, SaaS.",
            xp: 25,
            resources: [
              { title: "Cloud Computing explicado", url: "https://www.youtube.com/results?search_query=cloud+computing+explicado", type: "video" },
              { title: "Intro AWS Cloud", url: "https://aws.amazon.com/es/what-is-cloud-computing/", type: "artículo" },
            ],
          },
          {
            id: "cloud-f1-n2",
            title: "Linux y línea de comandos",
            description: "Base fundamental para trabajar con servidores.",
            xp: 30,
            resources: [
              { title: "Linux Journey", url: "https://linuxjourney.com/", type: "curso" },
            ],
          },
        ],
      },
      {
        id: "cloud-f2",
        phase: 2,
        title: "Herramientas",
        emoji: "🛠️",
        nodes: [
          {
            id: "cloud-f2-n1",
            title: "Docker y contenedores",
            description: "Aprende a empaquetar aplicaciones para que funcionen en cualquier lugar.",
            xp: 40,
            resources: [
              { title: "Docker para principiantes", url: "https://www.youtube.com/results?search_query=docker+para+principiantes+español", type: "video" },
              { title: "Docker Docs", url: "https://docs.docker.com/get-started/", type: "artículo" },
            ],
          },
          {
            id: "cloud-f2-n2",
            title: "Terraform o Ansible (infraestructura como código)",
            description: "Automatizá la creación de servidores y servicios.",
            xp: 35,
            resources: [
              { title: "Terraform desde cero", url: "https://www.youtube.com/results?search_query=terraform+desde+cero", type: "video" },
            ],
          },
        ],
      },
      {
        id: "cloud-f3",
        phase: 3,
        title: "Certificaciones sugeridas",
        emoji: "🎓",
        nodes: [
          {
            id: "cloud-f3-n1",
            title: "AWS Cloud Practitioner",
            description: "Certificación de entrada al mundo cloud de Amazon.",
            xp: 50,
            resources: [
              { title: "AWS Cloud Practitioner prep", url: "https://aws.amazon.com/es/certification/certified-cloud-practitioner/", type: "curso" },
            ],
          },
          {
            id: "cloud-f3-n2",
            title: "Azure Fundamentals (AZ-900)",
            description: "Intro al ecosistema cloud de Microsoft.",
            xp: 50,
            resources: [
              { title: "AZ-900 gratuito en Microsoft Learn", url: "https://learn.microsoft.com/es-es/certifications/azure-fundamentals/", type: "curso" },
            ],
          },
        ],
      },
      {
        id: "cloud-f4",
        phase: 4,
        title: "Proyectos",
        emoji: "🚀",
        nodes: [
          {
            id: "cloud-f4-n1",
            title: "Desplegar una app en AWS o Azure",
            description: "Publica tu primera aplicación en la nube usando el free tier.",
            xp: 60,
            resources: [
              { title: "Deploy app en AWS", url: "https://www.youtube.com/results?search_query=deploy+app+aws+free+tier", type: "video" },
            ],
          },
        ],
      },
    ],
  },

  ciberseguridad: {
    category: "ciberseguridad",
    roleName: "Ciberseguridad & Ethical Hacker",
    roleEmoji: "🛡️",
    motivationalMessage:
      "Tu instinto de proteger y detectar cosas fuera de lugar es exactamente lo que el mundo digital necesita. La seguridad es un campo apasionante.",
    phases: [
      {
        id: "ciber-f1",
        phase: 1,
        title: "Fundamentos",
        emoji: "📚",
        nodes: [
          {
            id: "ciber-f1-n1",
            title: "Conceptos de seguridad informática",
            description: "Confidencialidad, integridad, disponibilidad (CIA Triad).",
            xp: 25,
            resources: [
              { title: "Intro a ciberseguridad", url: "https://www.youtube.com/results?search_query=introduccion+ciberseguridad", type: "video" },
            ],
          },
          {
            id: "ciber-f1-n2",
            title: "Tipos de ataques comunes",
            description: "Phishing, malware, ransomware, ingeniería social.",
            xp: 30,
            resources: [
              { title: "Ataques informáticos explicados", url: "https://www.youtube.com/results?search_query=tipos+ataques+informaticos", type: "video" },
              { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "artículo" },
            ],
          },
        ],
      },
      {
        id: "ciber-f2",
        phase: 2,
        title: "Herramientas",
        emoji: "🛠️",
        nodes: [
          {
            id: "ciber-f2-n1",
            title: "Kali Linux y herramientas de pentesting",
            description: "El sistema operativo de los hackers éticos.",
            xp: 40,
            resources: [
              { title: "Kali Linux para principiantes", url: "https://www.youtube.com/results?search_query=kali+linux+principiantes", type: "video" },
            ],
          },
          {
            id: "ciber-f2-n2",
            title: "Wireshark y análisis de tráfico",
            description: "Aprende a ver qué pasa en una red en tiempo real.",
            xp: 35,
            resources: [
              { title: "Wireshark tutorial", url: "https://www.youtube.com/results?search_query=wireshark+tutorial+español", type: "video" },
            ],
          },
        ],
      },
      {
        id: "ciber-f3",
        phase: 3,
        title: "Certificaciones sugeridas",
        emoji: "🎓",
        nodes: [
          {
            id: "ciber-f3-n1",
            title: "Google Cybersecurity Certificate",
            description: "Certificación gratuita de entrada al mundo de la ciberseguridad.",
            xp: 50,
            resources: [
              { title: "Google Cybersecurity en Coursera", url: "https://www.coursera.org/professional-certificates/google-cybersecurity", type: "curso" },
            ],
          },
          {
            id: "ciber-f3-n2",
            title: "CompTIA Security+",
            description: "Certificación reconocida mundialmente en seguridad.",
            xp: 50,
            resources: [
              { title: "CompTIA Security+", url: "https://www.comptia.org/certifications/security", type: "artículo" },
            ],
          },
        ],
      },
      {
        id: "ciber-f4",
        phase: 4,
        title: "Proyectos",
        emoji: "🚀",
        nodes: [
          {
            id: "ciber-f4-n1",
            title: "Practicar en TryHackMe o HackTheBox",
            description: "Plataformas gamificadas para aprender hacking ético.",
            xp: 60,
            resources: [
              { title: "TryHackMe", url: "https://tryhackme.com/", type: "herramienta" },
              { title: "HackTheBox", url: "https://www.hackthebox.com/", type: "herramienta" },
            ],
          },
        ],
      },
    ],
  },

  "ux-ui": {
    category: "ux-ui",
    roleName: "Diseñador/a UX/UI",
    roleEmoji: "🎨",
    motivationalMessage:
      "Tenés un ojo especial para los detalles y te importa cómo se sienten las personas usando las cosas. El diseño UX/UI combina creatividad con empatía.",
    phases: [
      {
        id: "ux-f1",
        phase: 1,
        title: "Fundamentos",
        emoji: "📚",
        nodes: [
          {
            id: "ux-f1-n1",
            title: "¿Qué es UX y UI?",
            description: "Diferencias entre experiencia de usuario e interfaz de usuario.",
            xp: 25,
            resources: [
              { title: "UX vs UI explicado", url: "https://www.youtube.com/results?search_query=diferencia+ux+ui+español", type: "video" },
            ],
          },
          {
            id: "ux-f1-n2",
            title: "Principios de diseño",
            description: "Jerarquía visual, contraste, tipografía, color.",
            xp: 30,
            resources: [
              { title: "Principios de diseño visual", url: "https://www.youtube.com/results?search_query=principios+diseño+visual", type: "video" },
              { title: "Laws of UX", url: "https://lawsofux.com/", type: "artículo" },
            ],
          },
        ],
      },
      {
        id: "ux-f2",
        phase: 2,
        title: "Herramientas",
        emoji: "🛠️",
        nodes: [
          {
            id: "ux-f2-n1",
            title: "Figma desde cero",
            description: "La herramienta más usada para diseñar interfaces.",
            xp: 40,
            resources: [
              { title: "Figma para principiantes", url: "https://www.youtube.com/results?search_query=figma+tutorial+español+principiantes", type: "video" },
              { title: "Figma oficial", url: "https://www.figma.com/", type: "herramienta" },
            ],
          },
          {
            id: "ux-f2-n2",
            title: "Prototipado y user flows",
            description: "Cómo crear prototipos interactivos y flujos de usuario.",
            xp: 35,
            resources: [
              { title: "Prototipado en Figma", url: "https://www.youtube.com/results?search_query=prototipado+figma+tutorial", type: "video" },
            ],
          },
        ],
      },
      {
        id: "ux-f3",
        phase: 3,
        title: "Certificaciones sugeridas",
        emoji: "🎓",
        nodes: [
          {
            id: "ux-f3-n1",
            title: "Google UX Design Professional Certificate",
            description: "Certificación completa de Google sobre diseño UX.",
            xp: 50,
            resources: [
              { title: "Google UX Design en Coursera", url: "https://www.coursera.org/professional-certificates/google-ux-design", type: "curso" },
            ],
          },
        ],
      },
      {
        id: "ux-f4",
        phase: 4,
        title: "Proyectos",
        emoji: "🚀",
        nodes: [
          {
            id: "ux-f4-n1",
            title: "Rediseñar una app existente",
            description: "Elegí una app que te parezca confusa y proponé un rediseño en Figma.",
            xp: 60,
            resources: [
              { title: "UX Case Study guide", url: "https://www.youtube.com/results?search_query=ux+case+study+portfolio", type: "video" },
            ],
          },
        ],
      },
    ],
  },

  desarrollo: {
    category: "desarrollo",
    roleName: "Desarrollador/a de Software",
    roleEmoji: "💻",
    motivationalMessage:
      "Querés construir cosas, resolver problemas y ver tus ideas transformadas en software real. Programar es tu superpoder en construcción.",
    phases: [
      {
        id: "dev-f1",
        phase: 1,
        title: "Fundamentos",
        emoji: "📚",
        nodes: [
          {
            id: "dev-f1-n1",
            title: "Pensamiento lógico y algoritmos",
            description: "Aprende a pensar como un programador antes de escribir código.",
            xp: 25,
            resources: [
              { title: "Pensamiento computacional", url: "https://www.youtube.com/results?search_query=pensamiento+computacional+principiantes", type: "video" },
            ],
          },
          {
            id: "dev-f1-n2",
            title: "HTML, CSS y JavaScript básico",
            description: "Los tres pilares de la web. Tu primer contacto con el código.",
            xp: 35,
            resources: [
              { title: "FreeCodeCamp en español", url: "https://www.freecodecamp.org/espanol/", type: "curso" },
              { title: "MDN Web Docs", url: "https://developer.mozilla.org/es/", type: "artículo" },
            ],
          },
        ],
      },
      {
        id: "dev-f2",
        phase: 2,
        title: "Herramientas",
        emoji: "🛠️",
        nodes: [
          {
            id: "dev-f2-n1",
            title: "Git y GitHub",
            description: "Control de versiones — tu máquina del tiempo para el código.",
            xp: 35,
            resources: [
              { title: "Git y GitHub desde cero", url: "https://www.youtube.com/results?search_query=git+github+desde+cero+español", type: "video" },
            ],
          },
          {
            id: "dev-f2-n2",
            title: "VS Code y extensiones útiles",
            description: "Configurá tu editor para ser más productivo.",
            xp: 25,
            resources: [
              { title: "VS Code setup", url: "https://www.youtube.com/results?search_query=visual+studio+code+configuracion", type: "video" },
            ],
          },
        ],
      },
      {
        id: "dev-f3",
        phase: 3,
        title: "Certificaciones sugeridas",
        emoji: "🎓",
        nodes: [
          {
            id: "dev-f3-n1",
            title: "FreeCodeCamp Responsive Web Design",
            description: "Certificación gratuita de desarrollo web front-end.",
            xp: 50,
            resources: [
              { title: "FreeCodeCamp", url: "https://www.freecodecamp.org/", type: "curso" },
            ],
          },
          {
            id: "dev-f3-n2",
            title: "Meta Front-End Developer",
            description: "Programa profesional de Meta en Coursera.",
            xp: 50,
            resources: [
              { title: "Meta Front-End en Coursera", url: "https://www.coursera.org/professional-certificates/meta-front-end-developer", type: "curso" },
            ],
          },
        ],
      },
      {
        id: "dev-f4",
        phase: 4,
        title: "Proyectos",
        emoji: "🚀",
        nodes: [
          {
            id: "dev-f4-n1",
            title: "Crear tu portafolio web",
            description: "Construí tu propia web personal con HTML, CSS y JavaScript.",
            xp: 60,
            resources: [
              { title: "Portafolio web desde cero", url: "https://www.youtube.com/results?search_query=portafolio+web+desde+cero", type: "video" },
            ],
          },
        ],
      },
    ],
  },
};

export function getRoadmapForCategory(category: ITCategory): RoadmapData {
  return roadmaps[category];
}
