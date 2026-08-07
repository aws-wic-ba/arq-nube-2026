# Infraestructura AWS-emulada (MiniStack + OpenTofu)

Aprovisiona el build **AWS-emulado** de Gentle Task Companion: corre el **mismo** código
del backend (Hono) que el self-host, pero contra servicios AWS emulados por
[MiniStack](https://ministack.org) (compat LocalStack) en un solo contenedor. Demuestra
portabilidad / anti-lock-in: solo cambia contra qué apunta, no la lógica.

Recursos (vía módulos `terraform-aws-modules` donde conviene, recursos crudos donde es más
simple): DynamoDB (tabla única, PITR, SSE) · S3 (versioning, lifecycle, SSE) · SQS + DLQ ·
Lambda (el backend, con rol IAM de mínimo privilegio) · API Gateway HTTP (v2).

## ⚠️ Seguridad de credenciales (leer primero)

Para que **nada de acá pueda tocar AWS real por accidente**, el proyecto se aísla
con un **triple candado**, sin tocar nunca `~/.aws`:

1. **Archivo de credenciales local** (`.aws/` dentro de esta carpeta), no `~/.aws`.
2. **Perfil dummy** `ministack` (credenciales `test`/`test`; MiniStack no las valida).
3. **Endpoint forzado** a `http://localhost:4566` vía `AWS_ENDPOINT_URL`.

Además, el provider de OpenTofu (`versions.tf`) con `emulated = true` (default) fuerza todos
los endpoints a localhost y usa creds dummy — así que `tofu` es seguro por config, aparte del env.

### Setup (una vez)

Estos archivos están **gitignoreados** (entorno local). Recrealos así:

```bash
# 1) .envrc  (plantilla versionada: .envrc.example)
cp .envrc.example .envrc
direnv allow          # requiere direnv

# 2) archivo de credenciales local con el perfil dummy
mkdir -p .aws
cat > .aws/credentials <<'EOF'
[ministack]
aws_access_key_id = test
aws_secret_access_key = test
EOF
cat > .aws/config <<'EOF'
[profile ministack]
region = us-east-1
output = json
EOF
```

Verificá el aislamiento (debe devolver la cuenta dummy `000000000000`, **no** una cuenta real):

```bash
aws sts get-caller-identity     # → Account: 000000000000
```

Si tu shell de tool/CI no carga direnv, exportá el env a mano (ver `.envrc.example`).

## Prerequisitos

- Docker (MiniStack corre en contenedor; la Lambda se ejecuta vía Docker RIE, necesita `/var/run/docker.sock`)
- OpenTofu ≥ 1.6 (`tofu`)
- AWS CLI v2 (para smoke)
- Node 20 + npm (para buildear el bundle de la Lambda)

## Uso

### 1. Levantar MiniStack

```bash
docker run -d --name ministack -p 4566:4566 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ministackorg/ministack:latest
curl -s localhost:4566/_localstack/health   # debe responder con los servicios
```

### 2. Buildear el paquete de la Lambda

El backend Hono se empaqueta en un solo archivo con esbuild (el código fuente vive en
`../../backend/src/lambda.ts` → `handle(createAppFromEnv())`):

```bash
cd ../../backend && npm run build:lambda      # → dist/lambda/index.js
cd -            && rm -f lambda.zip && (cd ../../backend/dist/lambda && zip -qr "$OLDPWD/lambda.zip" .)
```

`dist/lambda/` y `lambda.zip` son artefactos de build (gitignoreados); el **código** es
`backend/src/lambda.ts` + `appFactory.ts` + `app.ts` (versionados).

### 3. Aprovisionar

```bash
tofu init
tofu plan            # revisar SIEMPRE antes de aplicar
tofu apply           # crea todo contra MiniStack
tofu output          # api_url, table_name, bucket_name, ...
```

### 4. Smoke

```bash
API=$(tofu output -raw api_url)
curl "${API}companion?species=nope"   # → 400 (ruta pública por API GW → Lambda)
curl "${API}media"                     # → lista media (Lambda → DynamoDB)
```

## Archivos

| Archivo | Rol |
|---|---|
| `versions.tf` | provider AWS (emulado vs real) + required_providers |
| `variables.tf` | endpoints, nombres, id de API |
| `data.tf` | DynamoDB + S3 (módulos; PITR/versioning/lifecycle/SSE) |
| `queue.tf` | SQS + DLQ (módulo) |
| `compute.tf` | Lambda + rol IAM de mínimo privilegio (módulo) |
| `apigw.tf` | API Gateway HTTP v2 (recursos crudos) |
| `outputs.tf` | api_url, ids, nombres |
| `.envrc.example` | plantilla del aislamiento de credenciales (el `.envrc` real es local) |
