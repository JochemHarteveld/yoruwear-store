import { Elysia } from 'elysia';
import { UserService } from './service';
import { UserModelPlugin } from './model';

/**
 * User Controller - HTTP routing and request validation
 */
export const user = new Elysia({ prefix: '/users' })
  .use(UserModelPlugin)
  
  .get('/', async ({ set }) => {
    try {
      return await UserService.getAllUsers();
    } catch (error) {
      set.status = 500;
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch users' 
      };
    }
  }, {
    detail: {
      summary: 'Get all users',
      tags: ['Users']
    }
  });