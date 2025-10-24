import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { config } from './config';
import { runMigrations } from './db/migrate';
import { resetAndSeedDatabase } from './db/seed';

// Import modules following feature-based structure
import { auth } from './modules/auth';
import { user } from './modules/user';
import { product } from './modules/product';
import { category } from './modules/category';
import { OrderController } from './modules/order';
import { admin } from './modules/admin';

/**
 * Database initialization service
 * Decoupled from HTTP server concerns
 */
async function initializeDatabase(): Promise<boolean> {
  try {
    console.log('🗄️ Initializing database...');
    
    const migrationsRan = await runMigrations();
    if (!migrationsRan) {
      console.error('❌ Failed to run migrations');
      return false;
    }
    
    // Reset and seed the database on startup
    await resetAndSeedDatabase();
    
    console.log('✅ Database initialization complete!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

/**
 * Main application setup following Elysia best practices
 * Each module is a separate Elysia instance (controller)
 */
const app = new Elysia()
  // Global middleware
  .use(cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  
   // Health check endpoint
  .get('/', () => ({
    message: 'YoruWear API is running!',
    version: '2.0.3',
    environment: config.environment,
    timestamp: new Date().toISOString()
  }), {
    detail: {
      summary: 'Health check endpoint',
      tags: ['System']
    }
  })
  // Health check endpoints for Railway
  .get('/health', () => {
    return { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      port: config.port,
      environment: config.environment
    };
  })
  .get('/api/health', () => {
    return { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      port: config.port,
      environment: config.environment,
      service: 'yoruwear-api'
    };
  })
  
  // Global error handling
  .onError({ as: 'global' }, ({ code, error, set }) => {
    console.error(`Global error [${code}]:`, error);
    
    if (code === 'VALIDATION') {
      set.status = 400;
      return { error: 'Validation failed', details: error.message };
    }
    
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Route not found' };
    }
    
    set.status = 500;
    return { error: 'Internal server error' };
  })
  
 
  
  // API modules - each as a separate controller
  .group('/api', (app) => 
    app
      .use(auth)      // /api/auth/*
      .use(user)      // /api/users/*  
      .use(product)   // /api/products/*
      .use(category)  // /api/categories/*
      .use(admin)     // /api/admin/*
  )
  
  // Order module - separate endpoint (already has prefix)
  .use(OrderController) // /api/orders/*
  

// Initialize database and start server
console.log('🚀 Starting YoruWear API Server...');
initializeDatabase().then(async (dbInitialized) => {
  if (!dbInitialized) {
    console.error('❌ Failed to initialize database. Exiting...');
    process.exit(1);
  }
  
  // Log CORS configuration
  const corsOrigins = Array.isArray(config.cors.origin) 
    ? config.cors.origin 
    : [config.cors.origin];
  console.log('CORS origins:', corsOrigins);
  
  console.log(`🦊 Elysia app initialized for port ${config.port}`);
  console.log(`📱 Environment: ${config.environment}`);
  console.log(`📋 API Documentation will be available at http://localhost:${config.port}/swagger`);
  
  // Start the HTTP server with better error handling and retry logic
  console.log('🚀 Starting server...');
  
  const startServer = async (retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        const server = app.listen({
          port: config.port,
          hostname: '0.0.0.0'
        });
        
        console.log(`🚀 Server started successfully on http://0.0.0.0:${config.port}`);
        return server;
      } catch (error: any) {
        console.warn(`⚠️  Server start attempt ${i + 1} failed:`, error.message);
        if (i < retries - 1) {
          console.log(`🔄 Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw error;
        }
      }
    }
  };
  
  try {
    const server = await startServer();
    
    console.log(`✅ YoruWear API Server is ready!`);
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Received SIGTERM, shutting down gracefully...');
      server.stop();
    });
    
  } catch (serverError) {
    console.error('❌ Failed to start server:', serverError);
    process.exit(1);
  }
}).catch((error) => {
  console.error('❌ Failed to initialize database:', error);
  process.exit(1);
});

export default app;

// Export type for testing and other uses
export type App = typeof app;