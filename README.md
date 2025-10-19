# 👕 Yoruwear Store

Modern e-commerce application built with Angular frontend and Bun backend, featuring dark theme UI and automated CI/CD deployment.

## 🚀 Live Demo
- **Frontend**: [GitHub Pages](https://jochemharteveld.github.io/yoruwear-store/)
- **API**: Backend deployment (see deployment guide)

## 🏗️ Architecture
- **Frontend**: Angular 20+ with standalone components, dark theme
- **Backend**: Bun runtime with Elysia framework
- **Database**: MySQL with Drizzle ORM
- **Deployment**: GitHub Actions → GitHub Pages + Railway/Render

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

Run the Docker development environment (recommended):

```
# start (build if needed) in background
docker compose up -d --build

# show status
docker compose ps

# tail logs
docker compose logs -f

# stop and remove containers
docker compose down

## 🚢 Deployment

### Quick Deploy
1. **Frontend** → GitHub Pages (automatic)
2. **Backend** → Railway (recommended)

```bash
# 1. Set up Railway backend
npm install -g @railway/cli
railway login
cd server
railway up

# 2. Update frontend API URL
# Edit client/src/environments/environment.prod.ts
# Replace 'your-backend-api-url.com' with Railway URL

# 3. Push to trigger deployment
git push origin main
```

### Complete Guide
📖 **[Full Deployment Guide](./DEPLOYMENT.md)** - Detailed instructions for multiple platforms

### Recommended Stack
- **Frontend**: GitHub Pages (Free)
- **Backend**: Railway (Free tier)  
- **Database**: Railway PostgreSQL (Free tier)
- **Total Cost**: $0/month

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=mysql://user:pass@host:port/db
FRONTEND_URL=https://yourusername.github.io/yoruwear-store  
NODE_ENV=production
PORT=3000
```

### Frontend
Environment files handle API endpoints automatically based on build configuration.
```

Notes:

- If you have a local dev server running on the same ports (e.g. `ng serve`), stop it first; otherwise Docker will fail to bind the host port.
- The server exposes a `/health` endpoint used by Docker healthchecks.
