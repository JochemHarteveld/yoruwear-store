.PHONY: dev build test

dev:
	@echo "Starting client and server in parallel..."
	# start client and server in separate terminals if you prefer; this runs in background
	cd client && npm run start &
	cd server && bun run --watch src/index.ts &
	@echo "Dev servers started (check their logs above)."

build:
	@echo "Building client..."
	cd client && npm run build

test:
	@echo "Running client tests..."
	cd client && npm test
