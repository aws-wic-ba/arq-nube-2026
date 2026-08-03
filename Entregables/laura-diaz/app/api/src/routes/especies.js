import express from 'express';
import prisma from '../db.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const especies = await prisma.especie.findMany({ orderBy: { nombre: 'asc' } });
    res.json(especies);
  } catch (err) {
    next(err);
  }
});

export default router;
