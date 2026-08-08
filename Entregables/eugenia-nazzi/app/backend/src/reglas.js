/**
 * Catálogo de vacunas y controles médicos recomendados para mayores de 18 años.
 *
 * Cada ítem define:
 * - sexoAplica: 'ambos' | 'mujer' | 'varon'
 * - edadMinima / edadMaxima: rango de edad en que aplica (edadMaxima es opcional)
 * - frecuenciaMeses: cada cuántos meses se repite (null = no es periódico, se
 *   acredita una vez / esquema único)
 * - nota: aclaraciones del protocolo que no se pueden reducir a un número
 *   (ej. "3 dosis si no hay esquema previo", "según factores de riesgo")
 */
const CATALOGO = [
  // --- Vacunas ---
  {
    id: "dt",
    categoria: "vacuna",
    nombre: "Antitetánica y antidiftérica (Doble bacteriana / dT)",
    sexoAplica: "ambos",
    edadMinima: 18,
    frecuenciaMeses: 120,
    nota: "Refuerzo cada 10 años. Si no hay esquema previo, se aplican 3 dosis (0, 1 y 6 meses).",
  },
  {
    id: "hepatitis-b",
    categoria: "vacuna",
    nombre: "Hepatitis B",
    sexoAplica: "ambos",
    edadMinima: 18,
    frecuenciaMeses: null,
    nota: "Esquema completo de 3 dosis (0, 1 y 6 meses) si no se recibió en la infancia.",
  },
  {
    id: "triple-doble-viral",
    categoria: "vacuna",
    nombre: "Triple o Doble Viral (Sarampión y Rubéola)",
    sexoAplica: "ambos",
    edadMinima: 18,
    frecuenciaMeses: null,
    nota: "Nacidos después de 1965: acreditar 2 dosis aplicadas después del año de vida.",
  },
  {
    id: "antigripal",
    categoria: "vacuna",
    nombre: "Antigripal (Influenza)",
    sexoAplica: "ambos",
    edadMinima: 18,
    frecuenciaMeses: 12,
    nota: "Obligatoria y gratuita para mayores de 65 años, personas gestantes y grupos de riesgo.",
  },
  {
    id: "neumococo",
    categoria: "vacuna",
    nombre: "Neumococo",
    sexoAplica: "ambos",
    edadMinima: 65,
    frecuenciaMeses: null,
    nota: "Dosis secuencial. Desde los 18 años si existen factores de riesgo (enfermedades crónicas, inmunocompromiso).",
  },
  {
    id: "fiebre-hemorragica",
    categoria: "vacuna",
    nombre: "Fiebre Hemorrágica Argentina",
    sexoAplica: "ambos",
    edadMinima: 15,
    frecuenciaMeses: null,
    nota: "Dosis única para quienes residan o trabajen en zonas endémicas (incluye sectores de Santa Fe).",
  },

  // --- Controles generales ---
  {
    id: "presion-arterial",
    categoria: "control",
    nombre: "Presión arterial",
    sexoAplica: "ambos",
    edadMinima: 18,
    frecuenciaMeses: 12,
    nota: "Al menos una vez al año para detectar hipertensión.",
  },
  {
    id: "laboratorio-cardiovascular",
    categoria: "control",
    nombre: "Riesgo cardiovascular y laboratorio (glucemia, colesterol, triglicéridos, función renal)",
    sexoAplica: "ambos",
    edadMinima: 18,
    frecuenciaMeses: 24,
    nota: "Cada 1 a 3 años según factores de riesgo (sedentarismo, obesidad, tabaquismo).",
  },
  {
    id: "salud-mental",
    categoria: "control",
    nombre: "Salud mental y estilos de vida",
    sexoAplica: "ambos",
    edadMinima: 18,
    frecuenciaMeses: 12,
    nota: "Evaluación anual de hábitos, consumo de alcohol/tabaco y bienestar general.",
  },

  // --- Específicos mujeres / personas con útero y mamas ---
  {
    id: "pap-vph",
    categoria: "control",
    nombre: "Papanicolau (PAP) y VPH",
    sexoAplica: "mujer",
    edadMinima: 25,
    frecuenciaMeses: 36,
    nota: "Cada 3 años tras dos resultados negativos anuales consecutivos. Test de VPH según protocolo local.",
  },
  {
    id: "mamografia",
    categoria: "control",
    nombre: "Mamografía",
    sexoAplica: "mujer",
    edadMinima: 40,
    frecuenciaMeses: 12,
    nota: "Anual o bianual a partir de los 40-50 años, según antecedentes familiares y criterio médico.",
  },

  // --- Específicos varones / personas con próstata ---
  {
    id: "psa-tacto-rectal",
    categoria: "control",
    nombre: "Antígeno Prostático Específico (PSA) y tacto rectal",
    sexoAplica: "varon",
    edadMinima: 50,
    frecuenciaMeses: 12,
    nota: "Desde los 45 años si existen antecedentes familiares directos de cáncer de próstata.",
  },
];

/**
 * Calcula la edad en años a partir de una fecha de nacimiento (YYYY-MM-DD).
 */
function calcularEdad(fechaNacimiento) {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const noCumplioAnioTodavia =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (noCumplioAnioTodavia) edad--;
  return edad;
}

/**
 * Devuelve el subconjunto del catálogo que aplica según edad y sexo.
 * sexo: 'mujer' | 'varon' (los ítems 'ambos' siempre se incluyen)
 */
function generarPlanilla(fechaNacimiento, sexo) {
  const edad = calcularEdad(fechaNacimiento);

  const items = CATALOGO.filter((item) => {
    const aplicaPorSexo = item.sexoAplica === "ambos" || item.sexoAplica === sexo;
    const aplicaPorEdadMinima = edad >= item.edadMinima;
    const aplicaPorEdadMaxima = !item.edadMaxima || edad <= item.edadMaxima;
    return aplicaPorSexo && aplicaPorEdadMinima && aplicaPorEdadMaxima;
  });

  return { edad, items };
}

module.exports = { CATALOGO, calcularEdad, generarPlanilla };
