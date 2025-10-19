#!/bin/bash

# Railway Environment Setup Script
echo "🚀 Setting up Railway environment variables..."

# Set environment to production
echo "Setting NODE_ENV to production..."
railway variables --set NODE_env=production

# Set frontend URL for CORS
echo "Setting FRONTEND_URL..."
railway variables --set FRONTEND_URL=https://jochemharteveld.github.io/yoruwear-store

# Deploy with new environment
echo "Deploying with new environment..."
railway up --detach

echo "✅ Railway setup complete!"
echo "🌐 Your API is available at: https://yoruwear-api-production.up.railway.app"
echo ""
echo "Next steps:"
echo "1. Go to Railway dashboard: https://railway.com/project/309d9465-ec26-44c4-a3ac-50f3947adbf1"
echo "2. Verify DATABASE_URL environment variable is set automatically"
echo "3. Update frontend environment file with your API URL"
echo "4. Test your API endpoints"