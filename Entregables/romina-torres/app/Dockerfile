FROM node:20-alpine

WORKDIR /usr/src/app

# Instalamos dependencias primero para aprovechar la cache de capas
COPY package*.json ./
RUN npm install --omit=dev

# Copiamos el resto del código
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
