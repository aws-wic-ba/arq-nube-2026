const express = require('express');
const path = require('path');
const session = require('express-session');
const solicitudesRouter = require('./routes/solicitudes');
const trabajadorRouter = require('./routes/trabajador');
const authRouter = require('./routes/auth');
const panelRouter = require('./routes/panel');

const app = express();

if (!process.env.SESSION_SECRET) {
    throw new Error('Falta SESSION_SECRET en el entorno');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static('/app/uploads'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));

app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

app.use('/', authRouter);
app.use('/', panelRouter);
app.use('/', solicitudesRouter);
app.use('/', trabajadorRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Becas Hunucmá corriendo -> http://localhost:${PORT}`);
});
