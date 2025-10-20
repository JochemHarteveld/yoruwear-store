import { Elysia } from 'elysia';
import { ProductService } from './service';
import { ProductModelPlugin } from './model';

/**
 * Product Controller - HTTP routing and request validation
 */
export const product = new Elysia({ prefix: '/products' })
  .use(ProductModelPlugin)
  
  .get('/', async ({ set }) => {
    console.log("In getProducts() handler");
    try {
      return await ProductService.getAllProducts();
    } catch (error) {
      console.log("Error", error);
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
  })

  .get('/:id', async ({ params, set }) => {
    console.log("In getProduct() handler for ID:", params.id);
    try {
      const productId = parseInt(params.id);
      if (isNaN(productId)) {
        set.status = 400;
        return { error: 'Invalid product ID' };
      }
      
      const product = await ProductService.getProductById(productId);
      if (!product) {
        set.status = 404;
        return { error: 'Product not found' };
      }
      
      return product;
    } catch (error) {
      console.log("Error", error);
      set.status = 500;
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch product' 
      };
    }
  }, {
    detail: {
      summary: 'Get product by ID',
      tags: ['Products']
    }
  });