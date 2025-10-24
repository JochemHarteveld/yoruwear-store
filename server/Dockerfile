# Development Dockerfile for Elysia server with hot reload
FROM oven/bun:latest

WORKDIR /app

# Set environment for development
ENV NODE_ENV=development
ENV BUN_ENV=development

# Install system dependencies
RUN apt-get update && \
	DEBIAN_FRONTEND=noninteractive apt-get install -y \
	curl \
	ca-certificates && \
	rm -rf /var/lib/apt/lists/* && \
	apt-get clean

# Copy package files for dependency installation
COPY package.json bun.lock* ./

# Install dependencies with development packages
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose the development port
EXPOSE 3000

# Start the server with hot reload using bun --watch
CMD ["bun", "--watch", "src/server.ts"]