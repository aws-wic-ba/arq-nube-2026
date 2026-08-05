const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { REQUIRED_DOCS } = require('../documentos');
const { requireAuth } = require('../auth');

const router = express.Router();

async function cargarMiSolicitud(req, res, next) {
    const { rows: [solicitud] } = await pool.query(
        'SELECT * FROM solicitudes WHERE usuario_id = $1 ORDER BY created_at DESC LIMIT 1',
        [req.session.usuario.id]
    );
    if (!solicitud) {
        return res.status(404).send('Solicitud no encontrada');
    }
    req.solicitud = solicitud;
    next();
}

router.use('/panel', requireAuth, cargarMiSolicitud);

router.get('/panel', (req, res) => res.redirect('/panel/datos'));

router.get('/panel/datos', (req, res) => {
    res.render('panel-datos', { solicitud: req.solicitud, saved: req.query.saved === '1' });
});

router.post('/panel/datos', async (req, res) => {
    const {
        nombre, apellido, fecha_nacimiento, sexo, estado_civil, curp, telefono, domicilio,
        escuela, carrera, semestre, matricula, modalidad, promedio, ya_graduo, acepta_actividades
    } = req.body;
    await pool.query(
        `UPDATE solicitudes
         SET nombre = $1, apellido = $2, fecha_nacimiento = $3, sexo = $4, estado_civil = $5,
             curp = $6, telefono = $7, domicilio = $8, escuela = $9, carrera = $10,
             semestre = $11, matricula = $12, modalidad = $13, promedio = $14, ya_graduo = $15,
             acepta_actividades = $16
         WHERE id = $17`,
        [
            nombre, apellido, fecha_nacimiento || null, sexo, estado_civil,
            curp, telefono, domicilio, escuela, carrera,
            semestre, matricula, modalidad, promedio, ya_graduo === 'on',
            acepta_actividades === 'on',
            req.solicitud.id
        ]
    );
    res.redirect('/panel/datos?saved=1');
});

router.get('/panel/documentos', async (req, res) => {
    const { rows: documentos } = await pool.query(
        'SELECT tipo FROM documentos WHERE solicitud_id = $1',
        [req.solicitud.id]
    );
    const subidos = new Set(documentos.map(d => d.tipo));
    const checklist = REQUIRED_DOCS.map(d => ({ ...d, subido: subidos.has(d.tipo) }));
    const todosSubidos = checklist.every(d => d.subido);

    res.render('panel-documentos', { solicitud: req.solicitud, checklist, todosSubidos });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join('/app/uploads', String(req.solicitud.id));
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const tipo = req.body.tipo;
        const ext = path.extname(file.originalname);
        cb(null, `${tipo}${ext}`);
    }
});
const upload = multer({ storage });

router.post('/panel/documentos', upload.single('archivo'), async (req, res) => {
    if (req.solicitud.estado !== 'incompleta') {
        return res.redirect('/panel/documentos');
    }
    await pool.query(
        `INSERT INTO documentos (solicitud_id, tipo, filename)
         VALUES ($1, $2, $3)
         ON CONFLICT (solicitud_id, tipo) DO UPDATE SET filename = EXCLUDED.filename, uploaded_at = now()`,
        [req.solicitud.id, req.body.tipo, req.file.filename]
    );
    res.redirect('/panel/documentos');
});

router.post('/panel/documentos/enviar', async (req, res) => {
    if (req.solicitud.estado !== 'incompleta') {
        return res.redirect('/panel/documentos');
    }
    const { rows: documentos } = await pool.query(
        'SELECT tipo FROM documentos WHERE solicitud_id = $1',
        [req.solicitud.id]
    );
    const tiposSubidos = new Set(documentos.map(d => d.tipo));
    const completa = REQUIRED_DOCS.every(d => tiposSubidos.has(d.tipo));
    if (completa) {
        await pool.query('UPDATE solicitudes SET estado = $1 WHERE id = $2', ['completa', req.solicitud.id]);
    }
    res.redirect('/panel/documentos');
});

module.exports = router;
