FROM node:20-alpine

WORKDIR /app

# Instala dependencias primero (aprovecha cache de Docker)
COPY package*.json ./
RUN npm install

# Copia el resto del código
COPY . .

EXPOSE 3000

# En desarrollo usamos el servidor de desarrollo de React;
# el código real se monta como bind mount desde docker-compose.yml
CMD ["npm", "start"]
