# ---------- Frontend: Cocina & Objetivo ----------
# Build del frontend (React + Vite + TanStack Start) corriendo con Node,
# con nginx delante como reverse proxy (sirve /api/ y estaticos con gzip).
# Contexto de build: ./frontend  (ver docker-compose.yml)

# Etapa 1 - build
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* bun.lock* ./
RUN npm install --no-audit --no-fund

COPY . .
# Forzar a Nitro a generar un servidor Node estandar (no el preset de Cloudflare
# que usa por defecto @lovable.dev/vite-tanstack-config). NITRO_PRESET tiene
# prioridad sobre la config del proyecto.
ENV NITRO_PRESET=node-server
RUN npm run build

# Etapa 2 - runtime (Node + nginx en el mismo contenedor)
FROM node:20-alpine AS runtime
RUN apk add --no-cache nginx

WORKDIR /app
# El build con NITRO_PRESET=node-server deja un servidor Node corrible en .output/server
COPY --from=build /app/.output/server ./server
# Estaticos (CSS/JS/imagenes) que nginx sirve directo, sin pasar por Node
COPY --from=build /app/.output/public /usr/share/nginx/html
# El paquete de nginx de Alpine usa /etc/nginx/http.d/, no /etc/nginx/conf.d/
COPY --from=build /app/nginx.conf /etc/nginx/http.d/default.conf

COPY start.sh /start.sh
RUN chmod +x /start.sh

ENV PORT=3000
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://localhost/health || exit 1

CMD ["/start.sh"]
