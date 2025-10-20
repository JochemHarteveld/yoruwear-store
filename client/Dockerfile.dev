# Development Dockerfile for Angular with hot reload
FROM node:20-alpine

WORKDIR /app

# Set environment for development
ENV NODE_ENV=development

# Install build dependencies for better performance
RUN apk add --no-cache python3 make g++

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies with optimizations for development
# Use npm ci with cache mount for faster builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev --prefer-offline --no-audit --no-fund

# Copy source code
COPY . .

# Expose Angular dev server port
EXPOSE 4200

# Start Angular development server with hot reload
# Bind to all interfaces so it's accessible from outside container
CMD ["npm", "start", "--", "--host=0.0.0.0", "--poll=2000"]