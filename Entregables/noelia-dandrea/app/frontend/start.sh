#!/bin/sh
set -e

# Arranca el servidor Node (SSR) en background, en el puerto interno $PORT
node /app/server/index.mjs &

# Espera brevemente a que Node levante antes de arrancar nginx
sleep 1

# Arranca nginx en primer plano (mantiene el contenedor vivo)
nginx -g "daemon off;"
