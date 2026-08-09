/**
 * Catalogs — component definitions, properties, and form metadata.
 * Single source of truth for the frontend wizard.
 * Derived from the engine's domain model.
 */

const SOLUTION_TYPES = [
  { id: "web_application", label: "Web Application" },
  { id: "api", label: "API" },
  { id: "serverless", label: "Serverless" },
  { id: "integration", label: "Integration" },
  { id: "data_pipeline", label: "Data Pipeline" },
  { id: "other", label: "Other" },
];

const CRITICALITY_LEVELS = [
  { id: "low", label: "Baja", description: "Impacto limitado si no está disponible." },
  { id: "medium", label: "Media", description: "Afecta operaciones pero hay alternativas." },
  { id: "high", label: "Alta", description: "Impacta directamente al negocio o usuarios." },
  { id: "critical", label: "Crítica", description: "Pérdida grave si falla; sin alternativa inmediata." },
];

const COMPONENT_CATALOG = {
  frontend:       { label: "Frontend",              icon: "⚏", description: "Interfaz web o móvil accesible por usuarios." },
  api:            { label: "API",                   icon: "⇄", description: "Endpoints REST, GraphQL o servicios backend." },
  database:       { label: "Database",              icon: "⛃", description: "Base de datos relacional o NoSQL." },
  files_storage:  { label: "Files / Object Storage",icon: "☰", description: "Almacenamiento de archivos, blobs u objetos." },
  queue_messaging:{ label: "Queue / Messaging",     icon: "⇵", description: "Colas de mensajes o event streaming." },
  external_system:{ label: "External System",       icon: "☁", description: "Integración con sistema o servicio de terceros." },
};

const COMPONENT_PROPERTIES = {
  frontend: [
    { id: "internet_exposed", label: "¿Es accesible desde Internet?" },
    { id: "has_authentication", label: "¿Requiere autenticación?" },
    { id: "has_encryption_in_transit", label: "¿Utiliza HTTPS?" },
  ],
  api: [
    { id: "internet_exposed", label: "¿Es pública (accesible desde Internet)?" },
    { id: "has_authentication", label: "¿Requiere autenticación?" },
    { id: "has_authorization", label: "¿Tiene autorización por roles/scopes?" },
    { id: "has_rate_limiting", label: "¿Tiene rate limiting?" },
    { id: "has_input_validation", label: "¿Valida inputs/payloads?" },
    { id: "has_encryption_in_transit", label: "¿Utiliza HTTPS/TLS?" },
  ],
  database: [
    { id: "handles_sensitive_data", label: "¿Contiene datos sensibles?" },
    { id: "has_encryption_at_rest", label: "¿Está cifrada en reposo?" },
    { id: "internet_exposed", label: "¿Es accesible públicamente?" },
    { id: "has_backups", label: "¿Tiene backups configurados?" },
  ],
  files_storage: [
    { id: "handles_sensitive_data", label: "¿Contiene datos sensibles?" },
    { id: "has_encryption_at_rest", label: "¿Está cifrado en reposo?" },
    { id: "internet_exposed", label: "¿Permite acceso público?" },
    { id: "has_backups", label: "¿Tiene versionado o respaldo?" },
  ],
  queue_messaging: [
    { id: "handles_sensitive_data", label: "¿Transporta datos sensibles?" },
    { id: "has_encryption_in_transit", label: "¿Está cifrada?" },
    { id: "has_authentication", label: "¿Productores/consumidores se autentican?" },
  ],
  external_system: [
    { id: "has_encryption_in_transit", label: "¿La comunicación utiliza TLS?" },
    { id: "has_authentication", label: "¿El sistema externo se autentica?" },
    { id: "has_secrets", label: "¿La integración utiliza secretos o credenciales?" },
    { id: "has_managed_secrets", label: "Si usa secretos: ¿se gestionan mediante un mecanismo centralizado?" },
  ],
};

const GENERAL_CONTROLS = [
  { id: "has_security_logs", label: "¿Existen logs de seguridad?" },
  { id: "has_audit_trail", label: "¿Las acciones administrativas son trazables?" },
  { id: "has_shared_credentials", label: "¿Existen cuentas o credenciales compartidas?" },
  { id: "has_least_privilege", label: "¿Se aplican permisos de mínimo privilegio?" },
  { id: "has_rto", label: "¿Existe RTO definido?" },
  { id: "has_rpo", label: "¿Existe RPO definido?" },
];
