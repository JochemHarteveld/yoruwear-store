import { Elysia, t } from 'elysia';
import { AuthService } from './service';
import { AuthModelPlugin } from './model';
import { AuthMiddleware } from './middleware';
import { AuthUtils } from '../../utils/auth';
import type { RegisterBody, LoginBody, RefreshBody } from './model';

/**
 * Auth Controller - HTTP routing and request validation
 * Each Elysia instance acts as a controller following best practices
 */
export const auth = new Elysia({ prefix: '/auth' })
  .use(AuthModelPlugin)
  .use(AuthMiddleware)
  
  .post('/register', async ({ body, set }) => {
    try {
      const result = await AuthService.register(body as RegisterBody);
      return result;
    } catch (error) {
      set.status = 400;
      return { 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }, {
    body: 'auth.register',
    detail: {
      summary: 'Register a new user',
      tags: ['Authentication']
    }
  })
  
  .post('/login', async ({ body, set }) => {
    try {
      const result = await AuthService.login(body as LoginBody);
      return result;
    } catch (error) {
      set.status = 400;
      return { 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }, {
    body: 'auth.login',
    detail: {
      summary: 'Login with email and password',
      tags: ['Authentication']
    }
  })
  
  .post('/refresh', async ({ body, set }) => {
    try {
      const refreshBody = body as RefreshBody;
      const tokens = await AuthService.refreshToken(refreshBody.refreshToken);
      return { 
        message: 'Token refreshed successfully',
        tokens 
      };
    } catch (error) {
      set.status = 401;
      return { 
        error: error instanceof Error ? error.message : 'Token refresh failed' 
      };
    }
  }, {
    body: 'auth.refresh',
    detail: {
      summary: 'Refresh access token',
      tags: ['Authentication']
    }
  })
  
  .get('/me', async ({ headers, set }) => {
    try {
      const authorization = headers.authorization;
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        set.status = 401;
        return { error: 'Authorization token required' };
      }
      
      const token = authorization.slice(7);
      const userPayload = AuthUtils.verifyAccessToken(token);
      const user = await AuthService.getUserById(userPayload.userId);
      return { user };
    } catch (error) {
      set.status = 401;
      return { 
        error: error instanceof Error ? error.message : 'Failed to get user info' 
      };
    }
  }, {
    detail: {
      summary: 'Get current user information',
      tags: ['Authentication']
    }
  })

  .put('/profile', async ({ body, headers, set }) => {
    try {
      const authorization = headers.authorization;
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        set.status = 401;
        return { error: 'Authorization token required' };
      }
      
      const token = authorization.slice(7);
      const userPayload = AuthUtils.verifyAccessToken(token);
      const updatedUser = await AuthService.updateUserProfile(userPayload.userId, body);
      return { user: updatedUser };
    } catch (error) {
      set.status = 400;
      return { 
        error: error instanceof Error ? error.message : 'Failed to update profile' 
      };
    }
  }, {
    body: t.Object({
      fullName: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      streetAddress: t.Optional(t.String()),
      city: t.Optional(t.String()),
      postalCode: t.Optional(t.String()),
      country: t.Optional(t.String())
    }),
    detail: {
      summary: 'Update user profile',
      tags: ['Authentication']
    }
  })
  
  .post('/logout', async ({ headers, set }) => {
    try {
      const authorization = headers.authorization;
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        set.status = 401;
        return { error: 'Authorization token required' };
      }
      
      const token = authorization.slice(7);
      const userPayload = AuthUtils.verifyAccessToken(token);
      return await AuthService.logout(userPayload.userId);
    } catch (error) {
      set.status = 401;
      return { 
        error: error instanceof Error ? error.message : 'Logout failed' 
      };
    }
  }, {
    detail: {
      summary: 'Logout user and invalidate refresh token',
      tags: ['Authentication']
    }
  });