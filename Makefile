.PHONY: dev dev-docker dev-watch build test stop logs clean

# Local development (without Docker)
dev:
	@echo "Starting client and server in parallel..."
	# start client and server in separate terminals if you prefer; this runs in background
	cd client && npm run start &
	cd server && bun run --watch src/index.ts &
	@echo "Dev servers started (check their logs above)."

# Docker development with hot reload (recommended)
dev-docker:
	@echo "Starting Docker development environment with hot reload..."
	docker compose watch

# Fast development using existing node_modules (fastest startup)
dev-fast:
	@echo "Starting fast Docker development environment..."
	@echo "Note: Make sure you have run 'npm install' in client/ first"
	docker compose -f docker-compose.yml -f docker-compose.fast.yml watch

# Start development services and then watch for changes
dev-watch:
	@echo "Starting services in detached mode..."
	docker compose up -d
	@echo "Starting watch mode for hot reload..."
	docker compose watch server client

# Start only backend services (MySQL + Server)
dev-backend:
	@echo "Starting backend services for local frontend development..."
	docker compose up mysql server -d

# Build production containers
build:
	@echo "Building production containers..."
	docker compose build
	@echo "Building client locally..."
	cd client && npm run build

# Run tests
test:
	@echo "Running client tests..."
	cd client && npm test

# Stop all services
stop:
	@echo "Stopping all Docker services..."
	docker compose down

# View logs
logs:
	@echo "Showing logs from all services..."
	docker compose logs -f

# Clean up Docker resources
clean:
	@echo "Cleaning up Docker resources..."
	docker compose down -v
	docker system prune -f
