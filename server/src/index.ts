import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { products, categories, users } from './db/schema';
import { config } from './config';
import { ensureTablesExist } from './ensure-tables';

// Helper function to convert BigInt values to numbers for JSON serialization
const convertBigIntToNumber = (obj: any): any => {
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }
  if (obj && typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }
  return obj;
};

// Initialize database tables on startup
async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing database...');
    
    // First ensure tables exist using raw SQL
    const tablesCreated = await ensureTablesExist();
    if (!tablesCreated) {
      console.error('❌ Failed to ensure tables exist');
      return false;
    }
    
    // Test connection with Drizzle
    const testResult = await db.select().from(categories).limit(1);
    console.log('✅ Database connection and tables verified');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

const app = new Elysia()
  .use(cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .onError(({ error, set }) => {
    console.error('Server error:', error);
    set.status = 500;
    return { error: 'Internal server error', details: String(error) };
  })
  .get('/', () => 'Hello Yoruwear Store API')
  .get('/health', async ({ set }) => {
    try {
      // Test database connection in health check
      await db.select().from(categories).limit(1);
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      set.status = 500;
      return { status: 'error', database: 'disconnected', error: String(error) };
    }
  })
  
  // Products endpoints
  .get('/api/products', async ({ set }) => {
    try {
      console.log('Fetching products...');
      const allProducts = await db.select().from(products);
      console.log(`Found ${allProducts.length} products`);
      return convertBigIntToNumber(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      set.status = 500;
      return { error: 'Failed to fetch products', details: String(error) };
    }
  })
  
  .get('/api/products/:id', async ({ params, set }) => {
    try {
      const product = await db.select().from(products).where(eq(products.id, parseInt(params.id)));
      return convertBigIntToNumber(product[0] || null);
    } catch (error) {
      console.error('Error fetching product:', error);
      set.status = 500;
      return { error: 'Failed to fetch product', details: String(error) };
    }
  })
  
  // Categories endpoints
  .get('/api/categories', async ({ set }) => {
    try {
      console.log('Fetching categories...');
      const allCategories = await db.select().from(categories);
      console.log(`Found ${allCategories.length} categories`);
      return convertBigIntToNumber(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      set.status = 500;
      return { error: 'Failed to fetch categories', details: String(error) };
    }
  })
  
  // Users endpoints
  .get('/api/users', async ({ set }) => {
    try {
      const allUsers = await db.select().from(users);
      return convertBigIntToNumber(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      set.status = 500;
      return { error: 'Failed to fetch users', details: String(error) };
    }
  })
  
  // Bind to 0.0.0.0 so the service is reachable from outside the container
  .listen({ port: config.port, hostname: '0.0.0.0' });

// Initialize database and start server
async function startServer() {
  console.log(`Environment: ${config.environment}`);
  console.log(`CORS origins: ${JSON.stringify(config.cors.origin)}`);
  
  // Initialize database
  const dbInitialized = await initializeDatabase();
  if (!dbInitialized) {
    console.error('❌ Failed to initialize database. Server starting anyway...');
  }
  
  console.log(`🦊 Elysia is running at ${app.server?.hostname ?? '0.0.0.0'}:${config.port}`);
}

startServer().catch(console.error);
