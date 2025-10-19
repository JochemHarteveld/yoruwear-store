# 👕 Yoruwear Store

Modern e-commerce application built with Angular frontend and Bun backend, featuring dark theme UI and automated CI/CD deployment.

## 🚀 Live Demo
- **Frontend**: [GitHub Pages](https://jochemharteveld.github.io/yoruwear-store/)
- **Backend API**: [Railway Production](https://yoruwear-api-production.up.railway.app/)
- **API Health**: [Health Check](https://yoruwear-api-production.up.railway.app/health)
- **API Products**: [Products Endpoint](https://yoruwear-api-production.up.railway.app/api/products)

## 🏗️ Architecture
- **Frontend**: Angular 20+ with standalone components and dark theme
- **Backend**: Bun runtime with Elysia framework
- **Database**: Railway MySQL with Drizzle ORM
- **Deployment**: GitHub Actions → GitHub Pages + Railway
- **CI/CD**: Automated deployment on push to main branch

## 📋 Prerequisites

- **Node.js 20+** and npm (for Angular frontend)
- **Bun** (for backend development)
- **Docker** (optional, for containerized development)

## 🏃 Quick Start

### 🐳 Docker Development (Recommended)
```bash
# Start both services
docker compose up --build

# Run in background
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### 💻 Local Development
```bash
# Install dependencies
cd client && npm ci
cd ../server && bun install

# Start frontend (http://localhost:4200)
cd client && npm run dev

# Start backend (http://localhost:3000)
cd server && bun run dev
```

## 🤖 CI/CD Pipeline

**Workflow**: `.github/workflows/deploy.yml`
- ✅ **Build & Test**: Frontend (Angular) + Backend (Bun)
- ✅ **Deploy Frontend**: Automatic deployment to GitHub Pages
- ✅ **Deploy Backend**: Railway deployment ready
- 🔄 **Triggers**: Push to `main` branch

## ✨ Features

### 🛍️ E-commerce Functionality
- Product catalog with categories
- Product details and pricing
- Stock management
- User account system
- Order management

### 🎨 Frontend (Angular)
- Dark theme UI design
- Responsive layout
- TypeScript with standalone components
- Angular 20+ with modern architecture
- GitHub Pages deployment

### ⚡ Backend (Bun + Elysia)
- High-performance Bun runtime
- Elysia web framework
- TypeScript throughout
- RESTful API design
- CORS configured for production

### 🗄️ Database (MySQL + Drizzle)
- Type-safe database operations
- Automated schema migrations
- Foreign key relationships
- Seeded with sample data
- Railway hosting

### 🚀 DevOps
- Docker containerization
- GitHub Actions CI/CD
- Automated testing and deployment
- Production environment configuration

## 🐳 Docker Development

### Local Development Stack
```bash
# Full stack with hot reload
docker compose up --build

# Services available at:
# - Frontend: http://localhost:4200/
# - Backend:  http://localhost:3000/
# - Health:   http://localhost:3000/health
```

### Docker Commands
```bash
# Background mode
docker compose up -d --build

# View logs
docker compose logs -f [service-name]

# Stop services
docker compose down

# Rebuild specific service
docker compose up --build [client|server]
```

## 🔮 Future Improvements

- [ ] Add ESLint, Prettier and Husky hooks
- [ ] Implement comprehensive test suites (unit + e2e)
- [ ] Add VS Code devcontainer configuration
- [ ] Shopping cart functionality
- [ ] User authentication and authorization
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Product search and filtering

## 🚢 Production Deployment

### ✅ Current Status
- **Frontend**: ✅ Deployed to GitHub Pages
- **Backend**: ✅ Deployed to Railway  
- **Database**: ✅ MySQL on Railway with full schema
- **CI/CD**: ✅ Automated deployment pipeline

### 🔗 Production URLs
```bash
# Frontend
https://jochemharteveld.github.io/yoruwear-store/

# Backend API
https://yoruwear-api-production.up.railway.app/

# API Endpoints
GET /health              # Health check
GET /api/products        # All products
GET /api/categories      # All categories  
GET /api/users          # All users
GET /api/products/:id   # Product by ID
```

### 🚀 Deploy New Changes
```bash
# Automatic deployment on push
git add .
git commit -m "Your changes"
git push origin main

# GitHub Actions will automatically:
# 1. Build and deploy frontend to GitHub Pages
# 2. Build and deploy backend to Railway
```

## 🗄️ Database Schema

**Platform**: Railway MySQL  
**ORM**: Drizzle ORM with TypeScript

**Tables**:
- `categories` - Product categories (T-Shirts, Hoodies, etc.)
- `products` - Product catalog with prices and stock
- `users` - User accounts
- `orders` - Customer orders
- `order_items` - Order line items

## 🔧 Environment Configuration

### Backend (Railway)
```env
DATABASE_URL=mysql://user:pass@mysql.railway.internal:3306/railway
NODE_ENV=production
PORT=8080
```

### Frontend (GitHub Pages)
- Production API URL configured in `client/src/environments/environment.prod.ts`
- Build configuration in `client/angular.json` with GitHub Pages settings
```

## 🧪 Testing the Application

### 🔍 Quick Health Checks
```bash
# Test production API
curl https://yoruwear-api-production.up.railway.app/health

# Get products from production
curl https://yoruwear-api-production.up.railway.app/api/products

# Test local development
curl http://localhost:3000/health        # Local backend
curl http://localhost:3000/api/products  # Local products
```

### 🌐 Frontend Testing
- **Production**: Visit [https://jochemharteveld.github.io/yoruwear-store/](https://jochemharteveld.github.io/yoruwear-store/)
- **Local**: Visit [http://localhost:4200/](http://localhost:4200/) after running `docker compose up`

## 📝 Notes

- Stop any local dev servers on ports 3000/4200 before running Docker
- The server exposes a `/health` endpoint for monitoring
- GitHub Actions automatically deploys on every push to `main`
- Database is pre-seeded with sample products and categories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

**Built with ❤️ using Angular, Bun, and modern web technologies**
