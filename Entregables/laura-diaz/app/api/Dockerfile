FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# prisma.config.js necesita poder resolver DATABASE_URL para cargar; en build time
# todavía no existe la variable real que inyecta docker-compose en runtime, así que
# usamos un valor de relleno solo para que "prisma generate" (que no se conecta a la
# base) pueda cargar la config. docker-compose pisa este valor en runtime.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
