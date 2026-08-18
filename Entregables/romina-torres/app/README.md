# 🛡️ Roversec

Tienda online de cursos de ciberseguridad. Catálogo + carrito + compra, con base de datos PostgreSQL. Todo en Docker.

## Cómo levantarla

Desde esta carpeta (`app/`):

```bash
docker compose up --build
```

Cuando veas `Roversec escuchando en http://localhost:3000`, abrí:

- http://localhost:3000 → catálogo de cursos
- http://localhost:3000/carrito.html → carrito y compra

Para frenarla: `Ctrl + C`. Para borrar también la base: `docker compose down -v`.

## Servicios (docker-compose)

| Servicio | Imagen            | Puerto  | Rol                              |
| -------- | ----------------- | ------- | -------------------------------- |
| `web`    | Node 20 + Express | 3000    | Sirve las páginas y la API       |
| `db`     | Postgres 16       | interno | Guarda cursos y compras          |

## API

| Método | Ruta                    | Descripción                    |
| ------ | ----------------------- | ------------------------------ |
| GET    | `/api/cursos`           | Lista el catálogo              |
| GET    | `/api/cursos?nivel=`    | Filtra por nivel               |
| POST   | `/api/compras`          | Registra una compra            |
| GET    | `/api/health`           | Estado de la app y la base     |
