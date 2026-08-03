import 'dotenv/config';
import prisma from '../src/db.js';

async function main() {
  const [argentina, emiratos, espana, usa, brasil] = await Promise.all(
    [
      { nombre: 'Argentina', codigo: 'AR' },
      { nombre: 'Emiratos Árabes Unidos', codigo: 'AE' },
      { nombre: 'España', codigo: 'ES' },
      { nombre: 'Estados Unidos', codigo: 'US' },
      { nombre: 'Brasil', codigo: 'BR' },
    ].map((data) =>
      prisma.pais.upsert({ where: { codigo: data.codigo }, update: {}, create: data })
    )
  );

  const [perro, gato] = await Promise.all(
    ['Perro', 'Gato'].map((nombre) =>
      prisma.especie.upsert({ where: { nombre }, update: {}, create: { nombre } })
    )
  );

  const requisitos = [
    // Salida de Emiratos Árabes Unidos
    { paisId: emiratos.id, especieId: perro.id, tipo: 'SALIDA', orden: 1,
      descripcion: 'Microchip ISO 11784/11785 implantado antes de cualquier vacuna.' },
    { paisId: emiratos.id, especieId: gato.id, tipo: 'SALIDA', orden: 1,
      descripcion: 'Microchip ISO 11784/11785 implantado antes de cualquier vacuna.' },
    { paisId: emiratos.id, especieId: perro.id, tipo: 'SALIDA', orden: 2, plazoDiasAntes: 21,
      descripcion: 'Vacuna antirrábica vigente.' },
    { paisId: emiratos.id, especieId: gato.id, tipo: 'SALIDA', orden: 2, plazoDiasAntes: 21,
      descripcion: 'Vacuna antirrábica vigente.' },
    { paisId: emiratos.id, especieId: perro.id, tipo: 'SALIDA', orden: 3, plazoDiasAntes: 5,
      descripcion: 'Certificado de salud emitido por un veterinario habilitado por el MOCCAE (Ministerio de Cambio Climático y Medio Ambiente).' },
    { paisId: emiratos.id, especieId: gato.id, tipo: 'SALIDA', orden: 3, plazoDiasAntes: 5,
      descripcion: 'Certificado de salud emitido por un veterinario habilitado por el MOCCAE (Ministerio de Cambio Climático y Medio Ambiente).' },
    { paisId: emiratos.id, especieId: perro.id, tipo: 'SALIDA', orden: 4,
      descripcion: 'Permiso de exportación (Export Permit) emitido por el MOCCAE.' },
    { paisId: emiratos.id, especieId: gato.id, tipo: 'SALIDA', orden: 4,
      descripcion: 'Permiso de exportación (Export Permit) emitido por el MOCCAE.' },

    // Entrada a Argentina (requisitos SENASA)
    { paisId: argentina.id, especieId: perro.id, tipo: 'ENTRADA', orden: 1,
      descripcion: 'Certificado veterinario internacional con vacunas antirrábica y polivalente al día.' },
    { paisId: argentina.id, especieId: gato.id, tipo: 'ENTRADA', orden: 1,
      descripcion: 'Certificado veterinario internacional con vacuna antirrábica al día.' },
    { paisId: argentina.id, especieId: perro.id, tipo: 'ENTRADA', orden: 2,
      descripcion: 'Certificado sanitario oficial del país de origen, endosado por la autoridad competente.' },
    { paisId: argentina.id, especieId: gato.id, tipo: 'ENTRADA', orden: 2,
      descripcion: 'Certificado sanitario oficial del país de origen, endosado por la autoridad competente.' },
    { paisId: argentina.id, especieId: perro.id, tipo: 'ENTRADA', orden: 3,
      descripcion: 'No se exige cuarentena si se cumplen los requisitos sanitarios (a diferencia de otros países).' },
    { paisId: argentina.id, especieId: gato.id, tipo: 'ENTRADA', orden: 3,
      descripcion: 'No se exige cuarentena si se cumplen los requisitos sanitarios (a diferencia de otros países).' },

    // Salida de Argentina
    { paisId: argentina.id, especieId: perro.id, tipo: 'SALIDA', orden: 1,
      descripcion: 'Certificado veterinario oficial de exportación emitido por SENASA.' },
    { paisId: argentina.id, especieId: gato.id, tipo: 'SALIDA', orden: 1,
      descripcion: 'Certificado veterinario oficial de exportación emitido por SENASA.' },

    // Entrada a España (estilo pasaporte europeo para mascotas)
    { paisId: espana.id, especieId: perro.id, tipo: 'ENTRADA', orden: 1,
      descripcion: 'Microchip ISO implantado y registrado antes de la vacuna antirrábica.' },
    { paisId: espana.id, especieId: gato.id, tipo: 'ENTRADA', orden: 1,
      descripcion: 'Microchip ISO implantado y registrado antes de la vacuna antirrábica.' },
    { paisId: espana.id, especieId: perro.id, tipo: 'ENTRADA', orden: 2, plazoDiasAntes: 21,
      descripcion: 'Vacuna antirrábica vigente, aplicada al menos 21 días antes del viaje.' },
    { paisId: espana.id, especieId: gato.id, tipo: 'ENTRADA', orden: 2, plazoDiasAntes: 21,
      descripcion: 'Vacuna antirrábica vigente, aplicada al menos 21 días antes del viaje.' },
    { paisId: espana.id, especieId: perro.id, tipo: 'ENTRADA', orden: 3, plazoDiasAntes: 1,
      descripcion: 'Tratamiento antiparasitario contra equinococosis, obligatorio solo para perros que ingresan desde fuera de la UE.' },

    // Entrada a Estados Unidos
    { paisId: usa.id, especieId: perro.id, tipo: 'ENTRADA', orden: 1,
      descripcion: 'Certificado de vacunación antirrábica vigente (exigencias adicionales de CDC según el país de origen).' },
    { paisId: usa.id, especieId: gato.id, tipo: 'ENTRADA', orden: 1,
      descripcion: 'Los gatos no requieren certificado de rabia para ingresar, pero sí deben lucir sanos en la inspección.' },
  ];

  await prisma.requisito.deleteMany({});
  await prisma.requisito.createMany({ data: requisitos });

  const emirates = await prisma.aerolinea.upsert({
    where: { nombre: 'Emirates' },
    update: {},
    create: {
      nombre: 'Emirates',
      permiteCabina: false,
      permiteBodega: true,
      restriccionRaza: 'No admite razas braquicéfalas (bulldog, pug, persa) en bodega por normativa de bienestar animal.',
      notas: 'Las mascotas viajan en bodega climatizada como carga manifestada (courier), no como equipaje acompañado.',
    },
  });

  const qatar = await prisma.aerolinea.upsert({
    where: { nombre: 'Qatar Airways' },
    update: {},
    create: {
      nombre: 'Qatar Airways',
      permiteCabina: false,
      permiteBodega: true,
      restriccionRaza: 'No admite razas braquicéfalas en bodega.',
      notas: 'Requiere reserva de espacio de carga con antelación, sujeto a temporada.',
    },
  });

  const aerolineasArgentinas = await prisma.aerolinea.upsert({
    where: { nombre: 'Aerolíneas Argentinas' },
    update: {},
    create: {
      nombre: 'Aerolíneas Argentinas',
      permiteCabina: true,
      permiteBodega: true,
      restriccionRaza: null,
      notas: 'Permite mascotas pequeñas en cabina dentro de transportadora bajo el asiento delantero.',
    },
  });

  const rutas = [
    { aerolineaId: emirates.id, paisOrigenId: emiratos.id, paisDestinoId: argentina.id },
    { aerolineaId: qatar.id, paisOrigenId: emiratos.id, paisDestinoId: argentina.id },
    { aerolineaId: aerolineasArgentinas.id, paisOrigenId: espana.id, paisDestinoId: argentina.id },
    { aerolineaId: aerolineasArgentinas.id, paisOrigenId: usa.id, paisDestinoId: argentina.id },
  ];

  for (const ruta of rutas) {
    await prisma.aerolineaRuta.upsert({
      where: {
        aerolineaId_paisOrigenId_paisDestinoId: ruta,
      },
      update: {},
      create: ruta,
    });
  }

  await prisma.tip.createMany({
    data: [
      {
        paisOrigenId: emiratos.id,
        paisDestinoId: argentina.id,
        especieId: gato.id,
        autor: 'Laura',
        calificacionDificultad: 4,
        texto: 'Lo hice yo misma sin agencia porque me resultaba muy caro contratar una. Lo más difícil fue encontrar toda la información junta: terminé buscando en foros, grupos de Facebook y llamando al MOCCAE directamente. Arranquen con el microchip y la vacuna antirrábica apenas decidan la fecha de mudanza, los plazos de espera son el cuello de botella real.',
      },
      {
        paisOrigenId: espana.id,
        paisDestinoId: argentina.id,
        especieId: perro.id,
        autor: 'Marina',
        calificacionDificultad: 2,
        texto: 'Entre España y Argentina el trámite fue bastante directo. SENASA pide el certificado sanitario endosado por el país de origen, así que conviene ir al veterinario con tiempo para que quede bien sellado antes del viaje.',
      },
      {
        paisOrigenId: usa.id,
        paisDestinoId: argentina.id,
        especieId: perro.id,
        autor: 'Diego',
        calificacionDificultad: 3,
        texto: 'La aerolínea nos pidió reservar el espacio para la mascota con más de un mes de anticipación, más que la documentación en sí. Reserven el vuelo pensando en eso.',
      },
    ],
  });

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
