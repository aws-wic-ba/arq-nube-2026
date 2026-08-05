const REQUIRED_DOCS = [
    { tipo: 'ine', label: 'INE', hint: 'Identificación oficial vigente' },
    { tipo: 'acta_nacimiento', label: 'Acta de nacimiento', hint: 'PDF o foto legible' },
    { tipo: 'comprobante_estudios', label: 'Comprobante de estudios', hint: 'Constancia de inscripción vigente' },
    { tipo: 'comprobante_domicilio', label: 'Comprobante de domicilio', hint: 'No mayor a 3 meses' },
    { tipo: 'carta_socioeconomica', label: 'Carta de estatus socioeconómico', hint: 'Emitida por autoridad local' },
    { tipo: 'carta_motivos', label: 'Carta de motivos', hint: 'Breve escrito personal' }
];

module.exports = { REQUIRED_DOCS };
