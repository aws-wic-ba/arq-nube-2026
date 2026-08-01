# 02 — Arquitectura local

## Componentes de la solución local

La aplicación se levanta con tres servicios Docker coordinados entre sí:

| Servicio | Rol | Puerto |
|----------|-----|--------|
| `app` | API en Node.js + Express | 3000 |
| `db` | Base de datos MySQL 8 | 3306 |
| `proxy` | Nginx como punto de entrada | 80 |

## Flujo de ejecución local

1. El navegador accede a `http://localhost`.
2. Nginx recibe el tráfico y lo reenvía al servicio `app` en el puerto 3000.
3. La app consulta la base de datos MySQL para leer o crear reservas.
4. Los datos persisten en un volumen Docker llamado `mysql_data`.

## Diagrama local

El diagrama correspondiente se encuentra en el archivo draw.io:

- diagrams/arquitectura-local.drawio

```text
Cliente -> Nginx -> Node.js app -> MySQL
                ^                     |
                |                     |
                +----- volumen MySQL ----+
```

## Cómo levantar la app

```bash
cd app/
cp .env.example .env
docker compose up --build
```

La app queda disponible en `http://localhost`.

Para detenerla:

```bash
docker compose down
```

Para detenerla y borrar los datos:

```bash
docker compose down -v
```

## Consideraciones de diseño

- La app expone rutas como `/` y `/reservas` para validar el flujo de negocio.
- La base de datos se inicializa automáticamente con `init.sql`.
- Se usan variables de entorno para separar configuración de código y mantener la solución más segura.
