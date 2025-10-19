# Production Dockerfile using binary compilation
FROM oven/bun AS build

WORKDIR /app

# Cache packages installation
COPY package.json bun.lock* ./
RUN bun install

# Copy source code
COPY ./src ./src

# Set production environment
ENV NODE_ENV=production

# Build production binary
RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun-linux-x64 \
	--outfile server \
	src/index.ts

# Make binary executable
RUN chmod +x ./server

# Use Ubuntu slim for easier health checks
FROM ubuntu:22.04

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the compiled binary
COPY --from=build /app/server server

# Set production environment
ENV NODE_ENV=production

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
	CMD curl -fsS http://127.0.0.1:3000/ || exit 1

CMD ["./server"]
