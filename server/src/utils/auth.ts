import jwt, { JwtPayload as BaseJwtPayload, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';

export interface JwtPayload extends BaseJwtPayload {
  userId: number;
  email: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthUtils {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate access token
  static generateAccessToken(payload: JwtPayload): string {
    // Create a clean payload object without undefined values
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      name: payload.name
    };
    
    const options: SignOptions = {
      expiresIn: config.jwt.accessExpiresIn,
      issuer: 'yoruwear-api',
      audience: 'yoruwear-client'
    } as SignOptions;
    
    return jwt.sign(tokenPayload, config.jwt.accessSecret, options);
  }

  // Generate refresh token
  static generateRefreshToken(payload: JwtPayload): string {
    // Create a clean payload object without undefined values
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      name: payload.name
    };
    
    const options: SignOptions = {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'yoruwear-api',
      audience: 'yoruwear-client'
    } as SignOptions;
    
    return jwt.sign(tokenPayload, config.jwt.refreshSecret, options);
  }

  // Generate both tokens
  static generateTokens(payload: JwtPayload): AuthTokens {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }

  // Verify access token
  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.accessSecret, {
        issuer: 'yoruwear-api',
        audience: 'yoruwear-client'
      }) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'yoruwear-api',
        audience: 'yoruwear-client'
      }) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authorization: string | undefined): string | null {
    if (!authorization) return null;
    
    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  static isValidPassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    return { isValid: true };
  }
}