import express from 'express';
import prisma from '../db.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { origen, destino, especie } = req.query;

    const where = {};
    if (origen) where.paisOrigenId = Number(origen);
    if (destino) where.paisDestinoId = Number(destino);
    if (especie) where.especieId = Number(especie);

    const tips = await prisma.tip.findMany({
      where,
      include: { paisOrigen: true, paisDestino: true, especie: true },
      orderBy: { fecha: 'desc' },
    });

    res.json(tips);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { autor, texto, calificacionDificultad, paisOrigenId, paisDestinoId, especieId } = req.body;

    if (!autor || !texto || !calificacionDificultad || !paisOrigenId || !paisDestinoId || !especieId) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    const tip = await prisma.tip.create({
      data: {
        autor,
        texto,
        calificacionDificultad: Number(calificacionDificultad),
        paisOrigenId: Number(paisOrigenId),
        paisDestinoId: Number(paisDestinoId),
        especieId: Number(especieId),
      },
    });

    res.status(201).json(tip);
  } catch (err) {
    next(err);
  }
});

export default router;
