# 02 — Arquitectura Local

##  Despliegue Local con Docker

Para garantizar que la aplicación corra de manera idéntica en cualquier entorno de desarrollo , **Ghirba Travel** se encuentra completamente containerizada utilizando **Docker** y orquestada mediante **Docker Compose**.

---

##  Servicios, Puertos y Entorno Local

La arquitectura local se compone de dos contenedores principales que interactúan entre sí y se conectan a un servicio externo de base de datos gestionada:

1. **Frontend (`travel-agency-frontend`):**
   * **Tecnología:** React + Vite.
   * **Puerto expuesto:** `5173:5173`.
   * **Función:** Interfaz gráfica web que consume la API del backend para renderizar el catálogo de destinos y desplegar los modales de reserva y administración.

2. **Backend (`travel-agency-backend`):**
   * **Tecnología:** Node.js + Express.
   * **Puerto expuesto:** `4000:4000`.
   * **Función:** REST API que expone los endpoints de consulta/creación de destinos (`/api/destinos`) y registro de reservas (`/api/reservas`).
   * **Conexión a BD:** Se conecta de forma segura a PostgreSQL (hospedado en Neon Tech) mediante variables de entorno en tiempo de ejecución.

3. **Base de Datos Externa (Neon PostgreSQL):**
   * **Instancia:** PostgreSQL en la nube (Neon Tech).
   * **Función:** Persistencia relacional de los destinos y las reservas.

---

## Instrucciones para Levantar la App

Para ejecutar la aplicación localmente, solo se requiere tener instalado **Docker Desktop**.

### 1. Clonar el repositorio y ubicarse en la carpeta raíz de la app:
```bash
git clone <URL_DEL_REPOSITORIO>
cd app/