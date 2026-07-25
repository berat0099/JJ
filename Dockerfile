# Multi-stage Dockerfile for Railway / Cloud Run deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build production bundle (Vite + esbuild server.ts)
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package and built files
COPY package.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
