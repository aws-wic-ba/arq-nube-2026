// Lógica nutricional determinística (sin backend): cálculo de requerimientos,
// proporciones del plato, orden de ingesta y matching de recetas por ingredientes.

export type Objetivo = "bajar" | "mantener" | "musculo";
export type Sexo = "f" | "m";
export type Actividad = "sedentaria" | "ligera" | "moderada" | "alta";

export interface Perfil {
  sexo: Sexo;
  edad: number;
  peso: number; // kg
  altura: number; // cm
  actividad: Actividad;
  objetivo: Objetivo;
}

export const ACTIVIDAD_FACTOR: Record<Actividad, number> = {
  sedentaria: 1.2,
  ligera: 1.375,
  moderada: 1.55,
  alta: 1.725,
};

export const OBJETIVO_LABEL: Record<Objetivo, string> = {
  bajar: "Bajar de peso",
  mantener: "Mantener",
  musculo: "Ganar músculo",
};

export interface Resultado {
  imc: number;
  imcCategoria: string;
  tmb: number;
  mantenimiento: number;
  calorias: number;
  proteinas: number;
  carbos: number;
  grasas: number;
  agua: number; // litros
  plato: { verduras: number; proteina: number; carbos: number; grasas: number };
}

export function calcular(p: Perfil): Resultado {
  const s = p.sexo === "m" ? 5 : -161;
  const tmb = 10 * p.peso + 6.25 * p.altura - 5 * p.edad + s;
  const mantenimiento = tmb * ACTIVIDAD_FACTOR[p.actividad];

  const ajuste = p.objetivo === "bajar" ? 0.8 : p.objetivo === "musculo" ? 1.12 : 1;
  const calorias = mantenimiento * ajuste;

  const gProteinaPorKg = p.objetivo === "musculo" ? 1.9 : p.objetivo === "bajar" ? 1.7 : 1.4;
  const proteinas = p.peso * gProteinaPorKg;
  const grasas = (calorias * 0.27) / 9;
  const carbos = Math.max(0, (calorias - proteinas * 4 - grasas * 9) / 4);

  const imc = p.peso / Math.pow(p.altura / 100, 2);
  const imcCategoria =
    imc < 18.5 ? "Bajo peso" : imc < 25 ? "Peso saludable" : imc < 30 ? "Sobrepeso" : "Obesidad";

  const plato =
    p.objetivo === "bajar"
      ? { verduras: 50, proteina: 30, carbos: 15, grasas: 5 }
      : p.objetivo === "musculo"
        ? { verduras: 30, proteina: 35, carbos: 30, grasas: 5 }
        : { verduras: 40, proteina: 30, carbos: 25, grasas: 5 };

  return {
    imc: round(imc, 1),
    imcCategoria,
    tmb: Math.round(tmb),
    mantenimiento: Math.round(mantenimiento),
    calorias: Math.round(calorias),
    proteinas: Math.round(proteinas),
    carbos: Math.round(carbos),
    grasas: Math.round(grasas),
    agua: round(p.peso * 0.035, 1),
    plato,
  };
}

export function round(n: number, d = 0) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

export const ORDEN_INGESTA = [
  {
    paso: 1,
    titulo: "Verduras y fibra",
    detalle:
      "Arrancá por la ensalada o las verduras cocidas. La fibra forma una malla en el intestino que enlentece la absorción de los azúcares que vienen después.",
  },
  {
    paso: 2,
    titulo: "Proteína y grasas buenas",
    detalle:
      "Seguí con la carne, el huevo, las legumbres o el queso. La proteína dispara las señales de saciedad y sostiene la masa muscular.",
  },
  {
    paso: 3,
    titulo: "Carbohidratos",
    detalle:
      "Dejá el arroz, la papa, la pasta o el pan para el final. Comidos al último, el pico de glucemia es bastante más bajo.",
  },
  {
    paso: 4,
    titulo: "Movete 10 minutos",
    detalle:
      "Una caminata corta después de comer ayuda al músculo a usar esa glucosa en vez de almacenarla.",
  },
];

// ---------------------------------------------------------------- recetas

export interface Receta {
  id: string;
  nombre: string;
  objetivos: Objetivo[];
  minutos: number;
  kcal: number;
  proteina: number;
  ingredientes: string[];
  pasos: string;
  tip: string;
}

export const INGREDIENTES = [
  "huevo",
  "pollo",
  "carne picada",
  "atún",
  "lentejas",
  "garbanzos",
  "arroz",
  "avena",
  "fideos",
  "papa",
  "batata",
  "tomate",
  "cebolla",
  "zanahoria",
  "zapallo",
  "brócoli",
  "espinaca",
  "morrón",
  "palta",
  "banana",
  "manzana",
  "yogur",
  "queso",
  "leche",
  "pan integral",
  "aceite de oliva",
  "frutos secos",
];

export const RECETAS: Receta[] = [
  {
    id: "wok-pollo",
    nombre: "Wok de pollo con verduras y arroz",
    objetivos: ["musculo", "mantener"],
    minutos: 25,
    kcal: 610,
    proteina: 48,
    ingredientes: ["pollo", "brócoli", "zanahoria", "morrón", "cebolla", "arroz", "aceite de oliva"],
    pasos:
      "Sellá el pollo en tiras, reservá. Salteá las verduras a fuego fuerte 5 minutos, volvé a sumar el pollo y serví sobre el arroz.",
    tip: "Comé primero las verduras del wok y dejá el arroz para el final del plato.",
  },
  {
    id: "tortilla-espinaca",
    nombre: "Tortilla de espinaca y queso",
    objetivos: ["bajar", "mantener", "musculo"],
    minutos: 15,
    kcal: 330,
    proteina: 26,
    ingredientes: ["huevo", "espinaca", "cebolla", "queso", "aceite de oliva"],
    pasos:
      "Salteá la cebolla y la espinaca, mezclá con los huevos batidos y el queso, y cociná a fuego bajo tapada 6 minutos por lado.",
    tip: "Acompañala con ensalada grande para llegar al 50% de verduras del plato.",
  },
  {
    id: "guiso-lentejas",
    nombre: "Guiso liviano de lentejas",
    objetivos: ["bajar", "mantener"],
    minutos: 40,
    kcal: 480,
    proteina: 24,
    ingredientes: ["lentejas", "zanahoria", "cebolla", "morrón", "tomate", "papa"],
    pasos:
      "Rehogá las verduras, sumá las lentejas remojadas y el tomate, cubrí con agua y cociná 30 minutos.",
    tip: "Las lentejas suman fibra y proteína vegetal: saciedad barata y de bajo índice glucémico.",
  },
  {
    id: "bowl-atun",
    nombre: "Bowl de atún, garbanzos y palta",
    objetivos: ["bajar", "mantener"],
    minutos: 10,
    kcal: 420,
    proteina: 32,
    ingredientes: ["atún", "garbanzos", "palta", "tomate", "cebolla", "aceite de oliva"],
    pasos: "Escurrí el atún y los garbanzos, mezclá con el tomate y la cebolla, coroná con palta.",
    tip: "Ideal para el almuerzo de oficina: se arma la noche anterior y no necesita microondas.",
  },
  {
    id: "avena-nocturna",
    nombre: "Avena nocturna con yogur y banana",
    objetivos: ["musculo", "mantener"],
    minutos: 5,
    kcal: 450,
    proteina: 22,
    ingredientes: ["avena", "yogur", "banana", "frutos secos", "leche"],
    pasos:
      "Mezclá la avena con el yogur y la leche, dejá en la heladera toda la noche y sumá banana y nueces al servir.",
    tip: "Buen desayuno post-entrenamiento por la combinación de carbohidrato + proteína.",
  },
  {
    id: "zapallo-relleno",
    nombre: "Zapallo relleno con carne y verduras",
    objetivos: ["mantener", "musculo"],
    minutos: 50,
    kcal: 520,
    proteina: 34,
    ingredientes: ["zapallo", "carne picada", "cebolla", "morrón", "tomate", "queso"],
    pasos:
      "Horneá el zapallo 30 minutos, rellenalo con la carne salteada con verduras, gratiná con queso 10 minutos.",
    tip: "El zapallo aporta volumen con pocas calorías: llena el plato sin subir el total.",
  },
  {
    id: "ensalada-tibia",
    nombre: "Ensalada tibia de garbanzos y batata",
    objetivos: ["bajar", "mantener"],
    minutos: 35,
    kcal: 400,
    proteina: 16,
    ingredientes: ["garbanzos", "batata", "espinaca", "cebolla", "aceite de oliva", "frutos secos"],
    pasos:
      "Asá la batata en cubos, mezclá tibia con los garbanzos, la espinaca cruda y las nueces.",
    tip: "Enfriar y recalentar la batata aumenta el almidón resistente, que impacta menos en la glucemia.",
  },
  {
    id: "pollo-papas",
    nombre: "Pollo al horno con papas y ensalada",
    objetivos: ["musculo", "mantener"],
    minutos: 45,
    kcal: 650,
    proteina: 52,
    ingredientes: ["pollo", "papa", "cebolla", "tomate", "aceite de oliva"],
    pasos:
      "Horneá el pollo con las papas en rodajas y la cebolla 40 minutos. Serví con ensalada de tomate.",
    tip: "Clásico de domingo: empezá por la ensalada y comé las papas al final.",
  },
  {
    id: "revuelto-avena",
    nombre: "Panqueques de avena y huevo",
    objetivos: ["musculo"],
    minutos: 12,
    kcal: 480,
    proteina: 28,
    ingredientes: ["avena", "huevo", "banana", "leche", "manzana"],
    pasos:
      "Licuá la avena con los huevos, la banana y la leche. Cociná en sartén antiadherente como panqueques.",
    tip: "Sumá una fruta arriba para el desayuno antes de entrenar.",
  },
  {
    id: "sopa-verduras",
    nombre: "Sopa crema de zapallo y brócoli",
    objetivos: ["bajar"],
    minutos: 30,
    kcal: 240,
    proteina: 10,
    ingredientes: ["zapallo", "brócoli", "cebolla", "zanahoria", "leche"],
    pasos: "Herví las verduras, procesá con un poco de leche y ajustá la sal y la pimienta.",
    tip: "Tomala como entrada: baja mucho las calorías totales de la comida siguiente.",
  },
  {
    id: "tostadas-palta",
    nombre: "Tostadas de pan integral con palta y huevo",
    objetivos: ["bajar", "mantener", "musculo"],
    minutos: 10,
    kcal: 390,
    proteina: 20,
    ingredientes: ["pan integral", "palta", "huevo", "tomate", "aceite de oliva"],
    pasos: "Tostá el pan, pisá la palta con limón, sumá el huevo poché o revuelto y el tomate.",
    tip: "Desayuno con grasa buena y proteína: llega mejor al mediodía sin picoteo.",
  },
  {
    id: "fideos-atun",
    nombre: "Fideos integrales con atún y tomate",
    objetivos: ["mantener", "musculo"],
    minutos: 20,
    kcal: 560,
    proteina: 34,
    ingredientes: ["fideos", "atún", "tomate", "cebolla", "aceite de oliva", "queso"],
    pasos: "Hacé una salsa rápida de tomate y cebolla, sumá el atún y mezclá con los fideos.",
    tip: "Sumá un plato de verduras crudas antes para no comer solo hidratos.",
  },
];

export interface RecetaScoreada extends Receta {
  tenes: string[];
  faltan: string[];
  match: number;
}

export function buscarRecetas(
  seleccionados: string[],
  objetivo: Objetivo,
  soloConLoQueTengo: boolean,
): RecetaScoreada[] {
  const set = new Set(seleccionados);
  return RECETAS.map((r) => {
    const tenes = r.ingredientes.filter((i) => set.has(i));
    const faltan = r.ingredientes.filter((i) => !set.has(i));
    const match = Math.round((tenes.length / r.ingredientes.length) * 100);
    return { ...r, tenes, faltan, match };
  })
    .filter((r) => (soloConLoQueTengo ? r.faltan.length === 0 : r.match > 0))
    .sort((a, b) => {
      const objA = a.objetivos.includes(objetivo) ? 1 : 0;
      const objB = b.objetivos.includes(objetivo) ? 1 : 0;
      if (objA !== objB) return objB - objA;
      return b.match - a.match;
    });
}

// ---------------------------------------------------------------- ejercicios

export interface Ejercicio {
  nombre: string;
  zona: "Abdomen" | "Piernas y glúteos" | "Tren superior" | "Cardio";
  series: string;
  como: string;
}

export type FranjaEdad = "18-29" | "30-44" | "45-59" | "60+";

export function franjaEdad(edad: number): FranjaEdad {
  if (edad < 30) return "18-29";
  if (edad < 45) return "30-44";
  if (edad < 60) return "45-59";
  return "60+";
}

const AJUSTE_EDAD: Record<FranjaEdad, string> = {
  "18-29":
    "Podés entrenar con mayor volumen e intensidad: 4 a 5 días por semana y series cerca del fallo.",
  "30-44":
    "Priorizá calidad sobre cantidad: 3 a 4 días, entrada en calor completa y una sesión de movilidad.",
  "45-59":
    "Sumá trabajo de fuerza sí o sí (previene sarcopenia) y bajá el impacto: nada de saltos repetidos.",
  "60+": "Fuerza suave, equilibrio y caminata diaria. Progresá de a poco y sin ejercicios de impacto.",
};

export function ajustePorEdad(edad: number) {
  return AJUSTE_EDAD[franjaEdad(edad)];
}

const BASE: Record<Objetivo, Ejercicio[]> = {
  bajar: [
    {
      nombre: "Caminata rápida o bici",
      zona: "Cardio",
      series: "30-40 min, 4 veces por semana",
      como: "Ritmo en el que podés hablar pero no cantar. Es el mayor gasto calórico sostenible.",
    },
    {
      nombre: "Plancha frontal",
      zona: "Abdomen",
      series: "3 x 30-45 seg",
      como: "Codos bajo los hombros, glúteos apretados, sin hundir la cintura.",
    },
    {
      nombre: "Bicicleta abdominal",
      zona: "Abdomen",
      series: "3 x 20 (10 por lado)",
      como: "Movimiento lento, llevando el codo a la rodilla contraria sin tirar del cuello.",
    },
    {
      nombre: "Sentadilla con peso corporal",
      zona: "Piernas y glúteos",
      series: "3 x 15",
      como: "Pies al ancho de cadera, bajás como si te sentaras en una silla.",
    },
    {
      nombre: "Remo con banda elástica",
      zona: "Tren superior",
      series: "3 x 15",
      como: "Codos pegados al cuerpo, apretando los omóplatos al final del recorrido.",
    },
  ],
  mantener: [
    {
      nombre: "Caminata diaria",
      zona: "Cardio",
      series: "8.000 a 10.000 pasos",
      como: "El piso mínimo de actividad. Repartila en tres salidas si no tenés tiempo seguido.",
    },
    {
      nombre: "Plancha lateral",
      zona: "Abdomen",
      series: "3 x 30 seg por lado",
      como: "Cuerpo en línea, cadera bien arriba, respiración continua.",
    },
    {
      nombre: "Zancadas alternadas",
      zona: "Piernas y glúteos",
      series: "3 x 12 por pierna",
      como: "Rodilla de atrás cerca del piso, tronco erguido.",
    },
    {
      nombre: "Flexiones (inclinadas si hace falta)",
      zona: "Tren superior",
      series: "3 x 10",
      como: "Apoyá las manos en una mesa para bajar la dificultad y sumar repeticiones limpias.",
    },
  ],
  musculo: [
    {
      nombre: "Sentadilla con carga",
      zona: "Piernas y glúteos",
      series: "4 x 8 progresando peso",
      como: "El ejercicio con mejor retorno para piernas y glúteos. Subí el peso cuando llegues cómoda a 8.",
    },
    {
      nombre: "Peso muerto rumano",
      zona: "Piernas y glúteos",
      series: "4 x 10",
      como: "Cadera hacia atrás, espalda neutra, sentís el estiramiento en la parte de atrás del muslo.",
    },
    {
      nombre: "Hip thrust",
      zona: "Piernas y glúteos",
      series: "4 x 12",
      como: "Espalda alta apoyada en un banco, empujás con los talones y apretás arriba.",
    },
    {
      nombre: "Remo con mancuerna",
      zona: "Tren superior",
      series: "4 x 10 por brazo",
      como: "Tirás con la espalda, no con el brazo. Torso paralelo al piso.",
    },
    {
      nombre: "Press de hombros",
      zona: "Tren superior",
      series: "3 x 10",
      como: "Sin arquear la zona lumbar; abdomen activo durante todo el empuje.",
    },
    {
      nombre: "Rueda abdominal o plancha con apoyo",
      zona: "Abdomen",
      series: "3 x 8-12",
      como: "El abdomen también necesita carga progresiva, no solo repeticiones infinitas.",
    },
  ],
};

export function rutina(objetivo: Objetivo, edad: number): Ejercicio[] {
  const lista = BASE[objetivo];
  if (franjaEdad(edad) === "60+" || franjaEdad(edad) === "45-59") {
    return lista.map((e) =>
      e.nombre === "Bicicleta abdominal"
        ? {
            ...e,
            nombre: "Elevación de rodillas sentada",
            series: "3 x 12",
            como: "Sentada en una silla firme, llevás las rodillas al pecho sin impacto en la columna.",
          }
        : e,
    );
  }
  return lista;
}
