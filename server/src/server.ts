import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { config } from './config';
import { ensureTablesExist } from './ensure-tables';

// Import modules following feature-based structure
import { auth } from './modules/auth';
import { user } from './modules/user';
import { product } from './modules/product';
import { category } from './modules/category';
import { OrderController } from './modules/order';

/**
 * Database initialization service
 * Decoupled from HTTP server concerns
 */
async function initializeDatabase(): Promise<boolean> {
  try {
    console.log('🗄️ Initializing database...');
    
    const tablesCreated = await ensureTablesExist();
    if (!tablesCreated) {
      console.error('❌ Failed to ensure tables exist');
      return false;
    }
    
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
  
  // API modules - each as a separate controller
  .group('/api', (app) => 
    app
      .use(auth)      // /api/auth/*
      .use(user)      // /api/users/*  
      .use(product)   // /api/products/*
      .use(category)  // /api/categories/*
  )
  
  // Order module - separate endpoint (already has prefix)
  .use(OrderController) // /api/orders/*
  

// Initialize database and start server
console.log('🚀 Starting YoruWear API Server...');
initializeDatabase().then((dbInitialized) => {
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
  
  // Start the HTTP server
  app.listen({
    port: config.port,
    hostname: '0.0.0.0'
  });
  
  console.log(`🚀 Server started successfully on http://0.0.0.0:${config.port}`);
}).catch((error) => {
  console.error('❌ Failed to initialize database:', error);
  process.exit(1);
});

export default app;

// Export type for testing and other uses
export type App = typeof app;