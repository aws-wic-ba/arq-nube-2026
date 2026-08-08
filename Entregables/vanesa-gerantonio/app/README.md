# Aplicación OrganiCloud

## Con Docker

```powershell
docker compose up --build
```

Abrir `http://localhost:8000`. La primera ejecución carga la estructura organizativa de ejemplo. El endpoint `http://localhost:8000/health` comprueba la aplicación y la base.

## Pruebas

```powershell
pip install -r requirements-dev.txt
pytest -q
```

## Nota de seguridad

Las credenciales de Compose sirven únicamente para desarrollo local. En AWS deben reemplazarse por Secrets Manager, Cognito y roles IAM de mínimo privilegio.
