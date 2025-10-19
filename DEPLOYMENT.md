# 🚀 CI/CD Deployment Guide

This document outlines the complete CI/CD setup for the YoruWear Store application using GitHub Actions.

## 📋 Overview

- **Frontend**: Deployed to GitHub Pages (Static hosting)
- **Backend**: Multiple deployment options (see recommendations below)
- **Database**: Managed database service recommendations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  GitHub Pages   │    │   Backend API   │    │    Database     │
│   (Frontend)    │───▶│  (Your Choice)  │───▶│ (Managed Service)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Frontend Deployment (GitHub Pages)

### ✅ Already Configured
- GitHub Actions workflow in `.github/workflows/deploy.yml`
- Angular build configuration for GitHub Pages
- Environment configuration for API endpoints

### 📝 Setup Steps

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Source: "GitHub Actions"

2. **Update API URL**:
   - Edit `client/src/environments/environment.prod.ts`
   - Replace `your-backend-api-url.com` with your actual backend URL

3. **Configure Repository Secrets** (if needed):
   - Go to Settings > Secrets and Variables > Actions
   - Add any required environment variables

## 🛠️ Backend Deployment Options

### 🟢 **Recommended: Railway** 
**Best for: Ease of use + Database included**

**Pros:**
- Automatic deployments from GitHub
- Built-in PostgreSQL/MySQL database
- Zero-config deployment
- Generous free tier
- Bun runtime supported

**Setup:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and create project
railway login
cd server
railway init  # Creates new project

# 3. Add database
railway add --database postgres  # or mysql

# 4. Set environment variables
railway variables --set NODE_ENV=production
railway variables --set FRONTEND_URL=https://jochemharteveld.github.io/yoruwear-store

# 5. Deploy
railway up
```

**GitHub Secrets needed:**
- `RAILWAY_TOKEN`
- `RAILWAY_PROJECT_ID`
- `RAILWAY_SERVICE_NAME`

---

### 🟡 **Alternative: Render**
**Best for: Simple Node.js/Bun hosting**

**Pros:**
- Free tier available
- Easy GitHub integration
- Built-in database options
- Automatic SSL

**Setup:**
1. Connect GitHub repository to Render
2. Configure build/start commands
3. Add environment variables

**GitHub Secrets needed:**
- `RENDER_DEPLOY_HOOK`

---

### 🟡 **Alternative: DigitalOcean App Platform**
**Best for: Scalability + Control**

**Pros:**
- Good performance
- Managed database options
- Competitive pricing
- Container support

**Setup:**
1. Create DO App Platform app
2. Connect to GitHub repository
3. Configure build settings

**GitHub Secrets needed:**
- `DO_TOKEN`
- `DO_APP_NAME`

---

### 🔴 **Advanced: Vercel (Serverless)**
**Best for: Serverless functions**

**Pros:**
- Excellent performance
- Global CDN
- Easy deployment

**Cons:**
- Requires serverless architecture changes
- Function execution limits
- More complex for persistent connections

## 🗄️ Database Options

### 🟢 **Recommended: Railway PostgreSQL**
```bash
# Automatic with Railway deployment
# Provides: DATABASE_URL environment variable
```

### 🟡 **Alternative: PlanetScale (MySQL)**
```bash
# Serverless MySQL platform
# Provides: DATABASE_URL with connection pooling
```

### 🟡 **Alternative: Neon (PostgreSQL)**
```bash
# Serverless PostgreSQL
# Great free tier
# Automatic scaling
```

### 🟡 **Alternative: Supabase**
```bash
# PostgreSQL + Real-time + Auth
# Great for future features
# Generous free tier
```

## 🔧 Required Configuration Changes

### 1. Update Server for Production

Create `server/src/config.ts`:
```typescript
export const config = {
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL || 'mysql://localhost:3306/yoruwear'
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200'
  }
};
```

### 2. Update Database Connection

Update `server/drizzle.config.ts`:
```typescript
import { config } from 'dotenv';
config();

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
};
```

### 3. Environment Variables

**Backend (Railway/Render/DO):**
```env
DATABASE_URL=mysql://user:password@host:port/database
FRONTEND_URL=https://yourusername.github.io/yoruwear-store
NODE_ENV=production
```

**Frontend:**
```typescript
// client/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.railway.app/api'
};
```

## 🚀 Deployment Steps

### 1. **Choose Your Backend Platform**
   - Railway (recommended for beginners)
   - Render (good middle ground)
   - DigitalOcean (more control)

### 2. **Set Up Database**
   - Use platform's managed database
   - Or external service (PlanetScale, Neon, Supabase)

### 3. **Configure Secrets**
   ```bash
   # GitHub repository > Settings > Secrets and Variables > Actions
   # Add required secrets for your chosen platform
   ```

### 4. **Update Environment URLs**
   ```bash
   # Update client/src/environments/environment.prod.ts
   # Update server CORS configuration
   ```

### 5. **Deploy**
   ```bash
   git add .
   git commit -m "Add CI/CD pipeline"
   git push origin main
   ```

## 📊 Cost Estimation

| Platform | Frontend | Backend | Database | Total/Month |
|----------|----------|---------|----------|-------------|
| **Railway** | Free (GitHub) | Free tier | Free tier | $0 |
| **Render** | Free (GitHub) | Free tier | $7 (DB) | $7 |
| **DigitalOcean** | Free (GitHub) | $5 (App) | $15 (DB) | $20 |

## 🔍 Monitoring & Logs

### Railway:
- Built-in monitoring dashboard
- Real-time logs
- Performance metrics

### Render:
- Service logs
- Health checks
- Performance monitoring

### GitHub Pages:
- Deployment status in Actions tab
- Usage analytics in repository insights

## 🛡️ Security Considerations

1. **Environment Variables**: Never commit secrets to repository
2. **CORS Configuration**: Restrict to your frontend domain
3. **Database Security**: Use connection pooling and SSL
4. **API Rate Limiting**: Implement in production
5. **HTTPS**: Ensure all connections are encrypted

## 📈 Next Steps

1. **Choose your backend platform** (Railway recommended)
2. **Uncomment the appropriate deployment steps** in `.github/workflows/deploy.yml`
3. **Add required GitHub secrets**
4. **Update environment configurations**
5. **Push to main branch to trigger deployment**

## 🆘 Troubleshooting

### Common Issues:

1. **Build Fails**: Check Node.js/Bun versions match local development
2. **CORS Errors**: Verify FRONTEND_URL environment variable
3. **Database Connection**: Check DATABASE_URL format and credentials
4. **404 on GitHub Pages**: Ensure `baseHref` is set correctly

### Debug Commands:
```bash
# Local build test
cd client && npm run build -- --configuration github-pages

# Check environment
echo $DATABASE_URL

# Railway logs
railway logs

# GitHub Actions logs
# Check the Actions tab in your repository
```

## 📞 Support

- **Railway**: [Railway Documentation](https://docs.railway.app)
- **Render**: [Render Documentation](https://render.com/docs)
- **GitHub Actions**: [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **Angular**: [Angular Deployment Guide](https://angular.io/guide/deployment)