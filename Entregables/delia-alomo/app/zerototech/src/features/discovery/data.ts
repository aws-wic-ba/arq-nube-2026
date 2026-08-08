import type { QuizQuestion, ITCategory } from "./types";

/**
 * Preguntas situacionales del test "Cero-a-Tech".
 *
 * Diseñadas para ser intuitivas, sin jerga técnica ni matemáticas.
 * Cada opción mapea a una categoría IT basada en comportamientos cotidianos.
 */
export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Un amigo tiene un problema con su computadora. ¿Qué hacés primero?",
    hint: "No hay respuesta incorrecta, elegí la que más se parezca a vos.",
    options: [
      {
        id: "1a",
        text: "Le pregunto qué hizo antes de que fallara y pruebo soluciones paso a paso",
        icon: "Wrench",
        category: "soporte",
      },
      {
        id: "1b",
        text: "Pienso si el problema es algo que se puede automatizar para que no vuelva a pasar",
        icon: "Cloud",
        category: "cloud",
      },
      {
        id: "1c",
        text: "Me fijo si alguien pudo haber accedido sin permiso o si hay algo raro",
        icon: "Shield",
        category: "ciberseguridad",
      },
      {
        id: "1d",
        text: "Pienso que el problema quizás es que la app es confusa de usar",
        icon: "Palette",
        category: "ux-ui",
      },
      {
        id: "1e",
        text: "Me dan ganas de crear una herramienta que resuelva ese problema para siempre",
        icon: "Code",
        category: "desarrollo",
      },
    ],
  },
  {
    id: 2,
    question: "Estás organizando un evento con amigos. ¿Qué rol tomás naturalmente?",
    hint: "Pensá en lo que te sale más natural, no lo que 'deberías' hacer.",
    options: [
      {
        id: "2a",
        text: "Me encargo de que todo funcione: el sonido, las luces, que nada falle",
        icon: "Wrench",
        category: "soporte",
      },
      {
        id: "2b",
        text: "Armo un sistema para coordinar las tareas y que cada uno sepa qué hacer",
        icon: "Cloud",
        category: "cloud",
      },
      {
        id: "2c",
        text: "Me aseguro de que la entrada sea segura y que no se cuele nadie",
        icon: "Shield",
        category: "ciberseguridad",
      },
      {
        id: "2d",
        text: "Diseño la decoración, la invitación y cómo se va a sentir la experiencia",
        icon: "Palette",
        category: "ux-ui",
      },
      {
        id: "2e",
        text: "Creo una app o un grupo para organizar todo de forma más eficiente",
        icon: "Code",
        category: "desarrollo",
      },
    ],
  },
  {
    id: 3,
    question: "¿Qué tipo de contenido te atrapa más cuando navegás por internet?",
    hint: "Eso que te hace perder la noción del tiempo.",
    options: [
      {
        id: "3a",
        text: "Tutoriales de cómo arreglar o configurar cosas",
        icon: "Wrench",
        category: "soporte",
      },
      {
        id: "3b",
        text: "Videos sobre cómo funcionan los servidores o la infraestructura de internet",
        icon: "Cloud",
        category: "cloud",
      },
      {
        id: "3c",
        text: "Historias de hackers, estafas digitales o cómo protegerse online",
        icon: "Shield",
        category: "ciberseguridad",
      },
      {
        id: "3d",
        text: "Diseños creativos, apps bien hechas o interfaces que me sorprenden",
        icon: "Palette",
        category: "ux-ui",
      },
      {
        id: "3e",
        text: "Proyectos de programación, robots, o cómo se construyen las apps",
        icon: "Code",
        category: "desarrollo",
      },
    ],
  },
  {
    id: 4,
    question: "Si pudieras tener un superpoder digital, ¿cuál elegirías?",
    hint: "¡Vale soñar! Elegí el que más te emocione.",
    options: [
      {
        id: "4a",
        text: "Poder arreglar cualquier dispositivo con solo tocarlo",
        icon: "Wrench",
        category: "soporte",
      },
      {
        id: "4b",
        text: "Controlar todos los servidores del mundo desde una sola pantalla",
        icon: "Cloud",
        category: "cloud",
      },
      {
        id: "4c",
        text: "Ser invisible en internet y detectar cualquier amenaza al instante",
        icon: "Shield",
        category: "ciberseguridad",
      },
      {
        id: "4d",
        text: "Crear interfaces que hagan feliz a cualquier persona que las use",
        icon: "Palette",
        category: "ux-ui",
      },
      {
        id: "4e",
        text: "Escribir código que se convierte en cualquier app que imagines",
        icon: "Code",
        category: "desarrollo",
      },
    ],
  },
];

/**
 * Información descriptiva de cada categoría para mostrar en resultados.
 */
export const categoryInfo: Record<ITCategory, { name: string; emoji: string }> = {
  soporte: { name: "Soporte Técnico", emoji: "🔧" },
  cloud: { name: "Cloud & Infraestructura", emoji: "☁️" },
  ciberseguridad: { name: "Ciberseguridad", emoji: "🛡️" },
  "ux-ui": { name: "Diseño UX/UI", emoji: "🎨" },
  desarrollo: { name: "Desarrollo de Software", emoji: "💻" },
};
