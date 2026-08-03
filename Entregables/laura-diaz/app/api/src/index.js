import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import paisesRouter from './routes/paises.js';
import especiesRouter from './routes/especies.js';
import requisitosRouter from './routes/requisitos.js';
import aerolineasRouter from './routes/aerolineas.js';
import tipsRouter from './routes/tips.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/paises', paisesRouter);
app.use('/api/especies', especiesRouter);
app.use('/api/requisitos', requisitosRouter);
app.use('/api/aerolineas', aerolineasRouter);
app.use('/api/tips', tipsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`RelocaPet API escuchando en el puerto ${PORT}`);
});
