const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/trabajador', async (req, res) => {
    const estadoFiltro = req.query.estado;
    let query = `SELECT *, nombre || ' ' || apellido AS nombre_completo FROM solicitudes`;
    const params = [];
    if (estadoFiltro) {
        query += ' WHERE estado = $1';
        params.push(estadoFiltro);
    }
    query += ' ORDER BY created_at DESC';

    const { rows: solicitudes } = await pool.query(query, params);
    res.render('trabajador', { solicitudes, estadoFiltro: estadoFiltro || '' });
});

router.get('/trabajador/solicitudes/:id', async (req, res) => {
    const { rows: [solicitud] } = await pool.query(
        `SELECT s.*, s.nombre || ' ' || s.apellido AS nombre_completo, u.email
         FROM solicitudes s JOIN usuarios u ON u.id = s.usuario_id
         WHERE s.id = $1`,
        [req.params.id]
    );
    const { rows: documentos } = await pool.query(
        'SELECT * FROM documentos WHERE solicitud_id = $1',
        [req.params.id]
    );
    res.render('detalle', { solicitud, documentos });
});

router.post('/trabajador/solicitudes/:id/estado', async (req, res) => {
    const { estado } = req.body;
    await pool.query('UPDATE solicitudes SET estado = $1 WHERE id = $2', [estado, req.params.id]);
    res.redirect(`/trabajador/solicitudes/${req.params.id}`);
});

module.exports = router;
