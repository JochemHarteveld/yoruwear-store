# Yoruwear Store

Minimal monorepo containing an Angular `client/` and a Bun-based `server/`.

This repo includes convenience scripts and CI to improve developer experience.

Prerequisites

- Node.js 18+ and npm (for the Angular client)
- Bun (optional, for the server)

Quickstart (developer)

From the repository root you can use the Makefile or the root npm scripts.

Makefile:

make dev # starts client and server concurrently
make build # builds the client
make test # runs client tests

npm scripts:

npm run dev
npm run build
npm test

Run services individually

# client

cd client
npm ci
npm run start

# server (if you use bun)

cd server
bun install
bun run --watch src/index.ts

CI

There is a GitHub Actions workflow at `.github/workflows/ci.yml` that builds the Angular client and installs server dependencies.

Next improvements

- Add ESLint, Prettier and Husky hooks
- Add server unit tests and a client e2e test
- Add a VS Code devcontainer

## Docker

You can build and run both services with Docker Compose.

Build and start in the foreground:

```
docker compose up --build
```

This maps:

- client -> http://localhost:4200/
- server -> http://localhost:3000/
