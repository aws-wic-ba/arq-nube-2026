const express = require('express');
const router = express.Router();
const { 
  obtenerDestinos, 
  crearDestino, 
  actualizarDestino, 
  eliminarDestino 
} = require('../controllers/destinosController');

router.get('/', obtenerDestinos);       // READ
router.post('/', crearDestino);         // CREATE
router.put('/:id', actualizarDestino);  // UPDATE
router.delete('/:id', eliminarDestino); // DELETE

module.exports = router;