import { Elysia } from 'elysia';
import { CategoryService } from './service';
import { CategoryModelPlugin } from './model';

/**
 * Category Controller - HTTP routing and request validation
 */
export const category = new Elysia({ prefix: '/categories' })
  .use(CategoryModelPlugin)
  
  .get('/', async ({ set }) => {
    try {
      return await CategoryService.getAllCategories();
    } catch (error) {
      set.status = 500;
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch categories' 
      };
    }
  }, {
    detail: {
      summary: 'Get all categories',
      tags: ['Categories']
    }
  });