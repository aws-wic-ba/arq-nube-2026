# 1. Usamos una imagen oficial de Node.js liviana (Alpine Linux)
FROM node:20-alpine

# 2. Creamos la carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos los archivos de dependencias
COPY package*.json ./

# 4. Instalamos las dependencias dentro de la imagen
RUN npm install

# 5. Copiamos el resto del código del proyecto
COPY . .

# 6. Exponemos el puerto 4000
EXPOSE 4000

# 7. Comando para iniciar la aplicación
CMD ["npm", "start"]