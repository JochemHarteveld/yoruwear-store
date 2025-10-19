import { Elysia } from 'elysia';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { products, categories, users } from './db/schema';

const app = new Elysia()
  .get('/', () => 'Hello Yoruwear Store API')
  .get('/health', () => ({ status: 'ok' }))
  
  // Products endpoints
  .get('/api/products', async () => {
    const allProducts = await db.select().from(products);
    return allProducts;
  })
  
  .get('/api/products/:id', async ({ params }) => {
    const product = await db.select().from(products).where(eq(products.id, parseInt(params.id)));
    return product[0] || null;
  })
  
  // Categories endpoints
  .get('/api/categories', async () => {
    const allCategories = await db.select().from(categories);
    return allCategories;
  })
  
  // Users endpoints
  .get('/api/users', async () => {
    const allUsers = await db.select().from(users);
    return allUsers;
  })
  
  // Bind to 0.0.0.0 so the service is reachable from outside the container
  .listen({ port: 3000, hostname: '0.0.0.0' });

console.log(`🦊 Elysia is running at ${app.server?.hostname ?? '0.0.0.0'}:${app.server?.port}`);
