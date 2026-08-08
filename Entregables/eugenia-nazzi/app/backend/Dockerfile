FROM node:20-alpine

WORKDIR /app

# Instala dependencias primero (aprovecha cache de Docker)
COPY package*.json ./
RUN npm install

# Copia el resto del código
COPY . .

EXPOSE 4000

# En desarrollo usamos nodemon para hot reload;
# el código real se monta como bind mount desde docker-compose.yml
CMD ["npm", "run", "dev"]
