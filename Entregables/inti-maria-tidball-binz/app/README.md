# Gentle Task Companion

PWA de autocuidado para personas neurodivergentes (ánimo, tareas, gratitud, herramientas de crisis, animalitos). El backend está escrito contra APIs portables (DynamoDB, S3, OIDC), así que el **mismo código** corre en dos builds:

- **Self-host** (`docker-compose.yml`): ScyllaDB + MinIO + mock-oidc + backend en contenedor.
- **AWS-emulado** (`docker-compose.aws.yml` + OpenTofu): Cognito + DynamoDB + S3 + SQS + Lambda + API Gateway sobre MiniStack.

Lo único que cambia entre los dos es contra qué servicios apunta el backend, no su lógica. Se corren de a uno por vez (ambos usan el puerto 3000).

## Requisitos

- Docker y Docker Compose.
- Solo para el build AWS-emulado: OpenTofu (`tofu`), AWS CLI v2 y Node 20 (para empaquetar la Lambda).

## Build 1 — Self-host (el más simple)

```bash
cd app
docker compose up --build
```

Puntos de acceso:

- Frontend (PWA): http://localhost:3000
- Backend (API): http://localhost:8080
- OIDC de desarrollo (mock-oidc): http://localhost:8081
- Consola de MinIO: http://localhost:9001 (usuario `minioadmin`, clave `minioadmin`)

Login: mock-oidc es interactivo, entrás con cualquier usuario. Los jobs `create-table` y `create-bucket` crean la tabla y el bucket al arrancar.

Para frenar:

```bash
docker compose down
```

## Build 2 — AWS-emulado (MiniStack + OpenTofu)

Corre el mismo backend contra AWS emulado. Las instrucciones detalladas (incluido el aislamiento de credenciales para no tocar credenciales AWS reales) están en [`infra/aws/README.md`](./infra/aws/README.md). En resumen:

```bash
cd app
docker compose -f docker-compose.aws.yml up -d ministack        # emulador AWS en :4566

cd infra/aws
direnv allow                                                    # carga el entorno aislado (perfil dummy)
npm --prefix ../../backend run build:lambda \
  && rm -f lambda.zip && (cd ../../backend/dist/lambda && zip -qr "$OLDPWD/lambda.zip" .)
tofu init && tofu apply                                         # aprovisiona todo en MiniStack
./smoke.sh                                                      # verifica el backend end-to-end

eval "$(./frontend-env.sh)"                                     # toma pool/client id del tofu output
docker compose -f ../../docker-compose.aws.yml --profile frontend up -d --build frontend
```

Después abrís http://localhost:3000 y entrás por el Hosted UI de Cognito (usuario `admin`, clave `Passw0rd!`, creado por el smoke).

Nota: MiniStack es in-memory (solo S3 persiste). Si se recrea el contenedor, hay que volver a correr `tofu apply` y el smoke.

## Tests

```bash
cd backend
npm test
```
