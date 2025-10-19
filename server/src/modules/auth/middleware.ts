import { Elysia } from 'elysia';
import { AuthUtils, type JwtPayload } from '../../utils/auth';

/**
 * Authentication middleware as an Elysia plugin
 * Following Elysia best practices for request-dependent services
 */
export const AuthMiddleware = new Elysia({ name: 'Auth.Middleware' })
  .derive(({ headers, set }) => {
    return {
      auth: {
        requireUser: (): JwtPayload => {
          const authorization = headers.authorization;
          
          if (!authorization || !authorization.startsWith('Bearer ')) {
            set.status = 401;
            throw new Error('Authorization token required');
          }
          
          const token = authorization.slice(7);
          
          try {
            return AuthUtils.verifyAccessToken(token);
          } catch (error) {
            set.status = 401;
            throw new Error('Invalid or expired token');
          }
        },
        
        getUser: (): JwtPayload | null => {
          const authorization = headers.authorization;
          
          if (!authorization || !authorization.startsWith('Bearer ')) {
            return null;
          }
          
          const token = authorization.slice(7);
          
          try {
            return AuthUtils.verifyAccessToken(token);
          } catch (error) {
            return null;
          }
        }
      }
    };
  });