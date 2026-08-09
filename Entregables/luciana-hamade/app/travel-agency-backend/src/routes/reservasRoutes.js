const express = require('express');
const router = express.Router();
const { 
  obtenerReservas, 
  crearReserva, 
  actualizarReserva, 
  eliminarReserva 
} = require('../controllers/reservasController');

router.get('/', obtenerReservas); 
router.post('/', crearReserva);
router.put('/:id', actualizarReserva);
router.delete('/:id', eliminarReserva);

module.exports = router;