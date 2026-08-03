import express from 'express';
import prisma from '../db.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { origen, destino, especie } = req.query;

    if (!origen || !destino || !especie) {
      return res.status(400).json({ error: 'Se requieren los parámetros origen, destino y especie.' });
    }

    const [salida, entrada] = await Promise.all([
      prisma.requisito.findMany({
        where: { paisId: Number(origen), especieId: Number(especie), tipo: 'SALIDA' },
        orderBy: { orden: 'asc' },
      }),
      prisma.requisito.findMany({
        where: { paisId: Number(destino), especieId: Number(especie), tipo: 'ENTRADA' },
        orderBy: { orden: 'asc' },
      }),
    ]);

    res.json({ salida, entrada });
  } catch (err) {
    next(err);
  }
});

export default router;
