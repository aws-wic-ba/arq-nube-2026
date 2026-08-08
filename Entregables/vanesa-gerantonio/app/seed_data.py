ORGANIZATION = [
    ("Consejo Directivo", [
        ("Departamento de Auditoría Interna", ["Auditoría Operativa", "Auditoría Financiera", "Auditoría de Sistemas"]),
        ("Comisión de Auditoría", []),
        ("Unidad de Integridad y Ética", []),
        ("Coordinación Administrativa", []),
        ("Comité de Supervisión", ["Subcomité de Control Interno", "Subcomité de Riesgos", "Subcomité de Ética y Transparencia"]),
        ("Secretaría Ejecutiva", ["Coordinación de Actas y Documentación", "Coordinación de Gobierno Corporativo"]),
        ("Responsable de Cumplimiento", ["Unidad de Monitoreo Regulatorio", "Unidad de Debida Diligencia", "Unidad de Reportes Regulatorios"]),
        ("Unidad de Prevención", ["Análisis Transaccional", "Monitoreo y Alertas", "Investigaciones Especiales"]),
    ]),
    ("Dirección General Ejecutiva", [
        ("Gerencia de Gestión de Riesgos y Control", ["Riesgo Operacional", "Gestión Antifraude", "Continuidad del Negocio", "Control Interno"]),
        ("Gerencia de Gobierno Corporativo y Procesos", ["Gestión por Procesos", "Calidad y Mejora Continua", "Normativa Interna", "Gestión Documental"]),
        ("Consultoría Estratégica", ["Planeamiento Estratégico", "Inteligencia de Negocios", "Estudios de Mercado"]),
        ("Gerencia Jurídica y Técnica", ["Asuntos Legales", "Contratos y Licitaciones", "Protección de Datos"]),
        ("Gerencia de Vinculación Institucional", ["Relaciones Institucionales", "Relaciones con Organismos Públicos", "Comunicación Corporativa"]),
        ("Gerencia de Innovación y Mejora Continua", ["Transformación Digital", "Gestión de Proyectos", "Innovación y Nuevos Servicios"]),
        ("Oficina de Gestión Estratégica de Proyectos (PMO)", ["Proyectos Tecnológicos", "Proyectos Operativos", "Seguimiento de Portafolio", "Metodología y Calidad de Proyectos"]),
    ]),
    ("Dirección Comercial", [
        ("Gerencia de Logística", ["Operaciones Logísticas", "Gestión de Flota", "Planificación Logística"]),
        ("Gerencia de Desarrollo Comercial e Innovación", ["Nuevos Negocios", "Alianzas Estratégicas", "Marketing Comercial"]),
        ("Gerencia de Experiencia del Cliente", ["Atención al Cliente", "Fidelización", "Calidad de Servicio"]),
    ]),
    ("Dirección de Tecnología y Sistemas", [
        ("Gerencia de Arquitectura Tecnológica", ["Arquitectura Empresarial", "Desarrollo de Plataformas", "Integraciones"]),
        ("Unidad de Ingeniería de Software", ["Front-End", "Back-End", "QA Testing"]),
        ("Unidad de Soluciones Digitales", ["Aplicaciones Móviles", "Canales Digitales", "Automatización"]),
        ("Gerencia de Seguridad Informática", ["Seguridad Ofensiva", "Seguridad Defensiva", "Gestión de Identidades"]),
        ("Gerencia de Inteligencia de Datos", ["Ciencia de Datos", "Analítica de Negocios", "Gobierno de Datos"]),
    ]),
    ("Dirección de Administración y Gestión Corporativa", [
        ("Gerencia de Planificación Estratégica", ["Gestión Presupuestaria", "Planeamiento Corporativo", "Indicadores de Gestión"]),
        ("Gerencia de Infraestructura Tecnológica", ["Redes y Telecomunicaciones", "Mesa de Ayuda", "Datacenter y Cloud"]),
        ("Gerencia Financiera y Administrativa", ["Contabilidad", "Tesorería", "Control de Gestión"]),
        ("Gerencia de Abastecimiento", ["Compras", "Contrataciones", "Gestión de Proveedores"]),
        ("Gerencia de Talento y Cultura", ["Selección", "Capacitación", "Desarrollo Organizacional", "Compensaciones"]),
        ("Gerencia de Gestión de Personas", ["Administración de Personal", "Relaciones Laborales", "Bienestar Organizacional"]),
    ]),
    ("Dirección Operativa", [
        ("Gerencia de Operaciones Integradas", ["Procesamiento Operativo", "Control Operativo", "Gestión de Incidencias"]),
        ("Gerencia de Medios de Pago", ["Emisión y Administración", "Adquirencia", "Redes de Pago"]),
        ("Gerencia de Servicios Especiales", ["Servicios Corporativos", "Soluciones a Medida", "Gestión de Convenios"]),
    ]),
]


def infer_type(name):
    for prefix, unit_type in [
        ("Consejo", "Órgano de gobierno"), ("Dirección", "Dirección"),
        ("Gerencia", "Gerencia"), ("Departamento", "Departamento"),
        ("Unidad", "Unidad"), ("Comisión", "Comisión"),
        ("Comité", "Comité"), ("Subcomité", "Subcomité"),
        ("Coordinación", "Coordinación"), ("Secretaría", "Secretaría"),
        ("Responsable", "Función de control"), ("Oficina", "Oficina"),
        ("Consultoría", "Consultoría"),
    ]:
        if name.startswith(prefix):
            return unit_type
    return "Equipo"


def default_mission(name):
    return f"Planificar, coordinar y supervisar las actividades correspondientes a {name}, asegurando su alineación con los objetivos institucionales y la normativa vigente."


def default_functions(name):
    return [
        f"Planificar y ejecutar las actividades propias de {name}.",
        "Mantener actualizados los procedimientos, registros e indicadores del área.",
        "Coordinar con las unidades relacionadas y reportar avances a la autoridad correspondiente.",
    ]
