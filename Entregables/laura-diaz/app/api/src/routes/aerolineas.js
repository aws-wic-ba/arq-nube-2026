import express from 'express';
import prisma from '../db.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { origen, destino } = req.query;

    if (!origen || !destino) {
      return res.status(400).json({ error: 'Se requieren los parámetros origen y destino.' });
    }

    const rutas = await prisma.aerolineaRuta.findMany({
      where: { paisOrigenId: Number(origen), paisDestinoId: Number(destino) },
      include: { aerolinea: true },
    });

    res.json(rutas.map((r) => r.aerolinea));
  } catch (err) {
    next(err);
  }
});

export default router;
