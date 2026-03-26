FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./
COPY backend/prisma ./prisma
COPY backend/prisma.config.ts ./
RUN npm ci
RUN npx prisma generate

COPY backend/ .
RUN npm run build

EXPOSE 3333

CMD ["npm", "start"]
