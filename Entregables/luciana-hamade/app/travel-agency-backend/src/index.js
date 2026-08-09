// 1. Importamos librerías
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 2. Importamos el archivo de rutas
const destinosRoutes = require('./routes/destinosRoutes');
const reservasRoutes = require('./routes/reservasRoutes');
const crearTablas = require('./config/initDb');

// 3. Inicializamos la app
const app = express();
const PORT = process.env.PORT || 4000;

// 4. Middlewares
app.use(cors());
app.use(express.json());

// 5.  Ejecutamos la creación de tablas en Neon
crearTablas();

// 6. Registramos el endpoint
app.use('/api/destinos', destinosRoutes);
app.use('/api/reservas', reservasRoutes);

// 7. Ruta de prueba (Health check)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '¡Despliegue exitoso, a disfrutar de la próxima aventura!'
  });
});


// 8. Iniciar servidor
app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});