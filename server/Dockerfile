# Use official bun image if available, else use node and run with node
FROM oven/bun:latest AS bun
WORKDIR /app

COPY package.json bun.lock* ./
COPY src ./src

RUN bun install --production || true

EXPOSE 3000
# Ensure curl is available for the container healthcheck. Works with Alpine (apk) or Debian (apt).
RUN if command -v apk >/dev/null 2>&1; then \
			apk add --no-cache curl; \
		elif command -v apt-get >/dev/null 2>&1; then \
			apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*; \
		fi

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
		CMD curl -fsS http://127.0.0.1:3000/health || exit 1

CMD ["bun", "run", "src/index.ts"]
