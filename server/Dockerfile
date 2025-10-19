# Railway-optimized Dockerfile for YoruWear Store
# Single-stage build to avoid Registry transfer issues
FROM oven/bun:latest

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV BUN_ENV=production

# Install system dependencies efficiently
RUN apt-get update && \
	DEBIAN_FRONTEND=noninteractive apt-get install -y \
	curl \
	ca-certificates && \
	rm -rf /var/lib/apt/lists/* && \
	apt-get clean

# Copy package files for dependency caching
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Build for production (non-binary for Railway compatibility)
RUN bun build \
	--target bun \
	--outdir dist \
	--minify \
	--sourcemap=none \
	src/index.ts

# Expose port (Railway will assign via $PORT)
EXPOSE 3000

# Health check with Railway port support
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
	CMD curl -f http://localhost:${PORT:-3000}/ || exit 1

# Use bun runtime for better Railway compatibility  
CMD ["bun", "run", "dist/index.js"]
