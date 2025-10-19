import { Elysia } from 'elysia';
import { ProductService } from './service';
import { ProductModelPlugin } from './model';

/**
 * Product Controller - HTTP routing and request validation
 */
export const product = new Elysia({ prefix: '/products' })
  .use(ProductModelPlugin)
  
  .get('/', async ({ set }) => {
    try {
      return await ProductService.getAllProducts();
    } catch (error) {
      set.status = 500;
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch products' 
      };
    }
  }, {
    detail: {
      summary: 'Get all products',
      tags: ['Products']
    }
  });