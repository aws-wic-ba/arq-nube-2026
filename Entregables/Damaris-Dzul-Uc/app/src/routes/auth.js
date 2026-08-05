const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

router.get('/registro', (req, res) => {
    res.render('registro', { error: null });
});

router.post('/registro', async (req, res) => {
    const { email, password } = req.body;

    if (!password || password.length < 6) {
        return res.render('registro', { error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const password_hash = await bcrypt.hash(password, 10);
        const { rows: [usuario] } = await client.query(
            'INSERT INTO usuarios (email, password_hash) VALUES ($1, $2) RETURNING id, email',
            [email, password_hash]
        );
        await client.query(
            'INSERT INTO solicitudes (usuario_id) VALUES ($1)',
            [usuario.id]
        );
        await client.query('COMMIT');

        req.session.usuario = { id: usuario.id, email: usuario.email };
        res.redirect('/panel/datos');
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') {
            return res.render('registro', { error: 'Ya existe una cuenta con ese correo.' });
        }
        throw err;
    } finally {
        client.release();
    }
});

router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { rows: [usuario] } = await pool.query(
        'SELECT id, email, password_hash FROM usuarios WHERE email = $1',
        [email]
    );

    if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
        return res.render('login', { error: 'Correo o contraseña incorrectos.' });
    }

    req.session.usuario = { id: usuario.id, email: usuario.email };
    res.redirect('/panel/datos');
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
