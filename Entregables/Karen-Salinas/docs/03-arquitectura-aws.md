03 — Propuesta de infraestructura AWS
Diagrama
Ver: diagrams/arquitectura-aws.jpg

Flujo de tráfico

Usuario
  │
  ▼
CloudFront (CDN + TLS)
  │
  ├──────────────► Amazon S3 (Frontend Estático)
  │
  ▼
AWS Lambda ──(Registro / Auth / Consultas)────────────────────┐
  │                                                           │
  │ (1) Enviar Orden                                          │
  ▼                                                           ▼
Amazon SQS (Cola de Pagos)                             Neon (Base de Datos)
  │                                                           ▲
  ▼                                                           │
AWS Lambda (Procesa Pago) ─────(2) Actualizar Pago / QR ──────┘
  │
  ▼
Amazon SNS
  │
  ▼
[ Correo con QR al Usuario ]


Servicios y justificación

| Servicio | Rol | Por qué |
|----------|-----|---------|
| Amazon S3 | Guardar información | Para guardar imagenes de los perfiles o de los eventos, archivo html |
| AWS Lambda | Cómputo | Es serverless, es bueno si la página tiene momentos de inactividad y es cómodo si la página necesita escalar |
| Neon | Base de datos | Es una base serverless compatible con PostgreSQL |
| Amazon SQS | Procesamiento de pagos | Recibe y almacena de forma ordenada las órdenes de compra para procesarlas de manera asíncrona |
| Amazon SNS | Notificaciones | Envía el correo electrónico con el código QR directamente a la persona que compra una entrada |
| CloudFront | CDN  | Reduce latencia |
| ACM | Certificados TLS | Gratis, renovación automática |
+----

