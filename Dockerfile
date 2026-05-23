# Build Stage
FROM node:20-slim AS builder
WORKDIR /app

# Copy root configs
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build Client
RUN npm run build -w client

# Build Server
RUN npm run build -w server

# Final Stage
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/server/package*.json ./
RUN npm install --production
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/client/dist ./public

EXPOSE 3001
CMD ["node", "dist/index.js"]
