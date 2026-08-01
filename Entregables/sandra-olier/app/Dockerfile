# Imagen base liviana de Node.js
FROM node:20-alpine

# Instalar herramientas necesarias para el healthcheck y la app
RUN apk add --no-cache curl

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de la app
EXPOSE 3000

# Comando de inicio
CMD ["node", "index.js"]
