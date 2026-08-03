import express from 'express';
import prisma from '../db.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const paises = await prisma.pais.findMany({ orderBy: { nombre: 'asc' } });
    res.json(paises);
  } catch (err) {
    next(err);
  }
});

export default router;
