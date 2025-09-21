FROM node:18-bookworm-slim
RUN apt-get update && apt-get install -y curl --no-install-recommends && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm install
COPY prisma ./prisma
COPY tsconfig.json ./tsconfig.json
COPY src ./src
COPY public ./public
RUN npm run build
RUN npm prune --omit=dev
ENV NODE_ENV=production TZ=Europe/London PORT=3000
ENV DATABASE_URL=file:/app/data/rec.db
EXPOSE 3000
CMD bash -lc "npx prisma generate && npx prisma db push --accept-data-loss && node dist/index.js"
