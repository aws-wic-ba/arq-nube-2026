FROM node:20-alpine

WORKDIR /usr/src/app

# Se copia primero el manifiesto para aprovechar la cache de capas de Docker:
# si no cambian las dependencias, no se reinstalan en cada build.
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# No correr como root dentro del contenedor.
USER node

EXPOSE 3000
CMD ["node", "src/server.js"]
