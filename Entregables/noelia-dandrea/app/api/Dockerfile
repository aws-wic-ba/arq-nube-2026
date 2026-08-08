FROM node:20-alpine
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

ENV NODE_ENV=production
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://localhost:3001/health || exit 1

CMD ["node", "server.js"]
