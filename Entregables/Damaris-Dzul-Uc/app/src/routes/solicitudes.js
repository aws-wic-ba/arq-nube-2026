const express = require('express');
const { REQUIRED_DOCS } = require('../documentos');
const { DOC_ICONS } = require('../icons');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('form', { REQUIRED_DOCS, DOC_ICONS });
});

module.exports = router;
