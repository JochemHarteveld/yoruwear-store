import { eq, desc } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema';
import { AuthUtils } from '../../utils/auth';
import type { RegisterBody, LoginBody, UserResponse, TokensResponse, AuthSuccessResponse } from './model';

/**
 * AuthService - Business logic for authentication operations
 * Decoupled from HTTP requests and Elysia context
 */
export abstract class AuthService {
  
  /**
   * Register a new user
   */
  static async register(data: RegisterBody): Promise<AuthSuccessResponse> {
    const { 
      name, 
      email, 
      password, 
      fullName, 
      phone, 
      streetAddress, 
      city, 
      postalCode, 
      country 
    } = data;
    
    // Validate password strength
    const passwordValidation = AuthUtils.isValidPassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message || 'Password does not meet security requirements');
    }
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
      
    if (existingUser.length > 0) {
      throw new Error('User already exists with this email');
    }
    
    // Hash password
    const passwordHash = await AuthUtils.hashPassword(password);
    
    // Create user
    const result = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        fullName,
        phone,
        streetAddress,
        city,
        postalCode,
        country,
        isFirstPurchase: true // New users get first-time buyer discount
      });
    
    // Get the created user by email since we just created it
    const [newUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .orderBy(desc(users.id))
      .limit(1);
    
    // Generate tokens
    const tokens = AuthUtils.generateTokens({
      userId: Number(newUser.id),
      email: newUser.email,
      name: newUser.name
    });
    
    // Store refresh token
    await db
      .update(users)
      .set({ refreshToken: tokens.refreshToken })
      .where(eq(users.id, newUser.id));
    
    return {
      message: 'User registered successfully',
      user: {
        id: Number(newUser.id),
        email: newUser.email,
        name: newUser.name,
        fullName: newUser.fullName || undefined,
        phone: newUser.phone || undefined,
        streetAddress: newUser.streetAddress || undefined,
        city: newUser.city || undefined,
        postalCode: newUser.postalCode || undefined,
        country: newUser.country || undefined,
        isFirstPurchase: newUser.isFirstPurchase ?? undefined
      },
      tokens
    };
  }
  
  /**
   * Login user with email and password
   */
  static async login(data: LoginBody): Promise<AuthSuccessResponse> {
    const { email, password } = data;
    
    // Find user
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
      
    if (!userData) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    if (!userData.passwordHash || !(await AuthUtils.verifyPassword(password, userData.passwordHash))) {
      throw new Error('Invalid credentials');
    }
    
    // Generate tokens
    const tokens = AuthUtils.generateTokens({
      userId: Number(userData.id),
      email: userData.email,
      name: userData.name
    });
    
    // Update refresh token in database
    await db
      .update(users)
      .set({ refreshToken: tokens.refreshToken })
      .where(eq(users.id, userData.id));
    
    return {
      message: 'Login successful',
      user: {
        id: Number(userData.id),
        email: userData.email,
        name: userData.name,
        fullName: userData.fullName || undefined,
        phone: userData.phone || undefined,
        streetAddress: userData.streetAddress || undefined,
        city: userData.city || undefined,
        postalCode: userData.postalCode || undefined,
        country: userData.country || undefined,
        isFirstPurchase: userData.isFirstPurchase ?? undefined
      },
      tokens
    };
  }
  
  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<TokensResponse> {
    // Verify refresh token
    const payload = AuthUtils.verifyRefreshToken(refreshToken);
    
    // Check if refresh token exists in database
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);
      
    if (!userData || userData.refreshToken !== refreshToken) {
      throw new Error('Invalid or expired refresh token');
    }
    
    // Generate new tokens
    const tokens = AuthUtils.generateTokens({
      userId: payload.userId,
      email: payload.email,
      name: payload.name
    });
    
    // Update refresh token in database
    await db
      .update(users)
      .set({ refreshToken: tokens.refreshToken })
      .where(eq(users.id, payload.userId));
    
    return tokens;
  }
  
  /**
   * Get user by ID
   */
  static async getUserById(userId: number): Promise<UserResponse> {
    const [userData] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        fullName: users.fullName,
        phone: users.phone,
        streetAddress: users.streetAddress,
        city: users.city,
        postalCode: users.postalCode,
        country: users.country,
        isFirstPurchase: users.isFirstPurchase,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
      
    if (!userData) {
      throw new Error('User not found');
    }
    
    return {
      id: Number(userData.id),
      email: userData.email,
      name: userData.name,
      fullName: userData.fullName || undefined,
      phone: userData.phone || undefined,
      streetAddress: userData.streetAddress || undefined,
      city: userData.city || undefined,
      postalCode: userData.postalCode || undefined,
      country: userData.country || undefined,
      isFirstPurchase: userData.isFirstPurchase ?? undefined,
      createdAt: userData.createdAt?.toISOString(),
      updatedAt: userData.updatedAt?.toISOString()
    };
  }
  
  /**
   * Update user profile
   */
  static async updateUserProfile(userId: number, profileData: Partial<{
    fullName?: string;
    phone?: string;
    streetAddress?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  }>): Promise<UserResponse> {
    // Update user in database
    await db
      .update(users)
      .set({
        fullName: profileData.fullName,
        phone: profileData.phone,
        streetAddress: profileData.streetAddress,
        city: profileData.city,
        postalCode: profileData.postalCode,
        country: profileData.country,
      })
      .where(eq(users.id, userId));

    // Return updated user data
    return await this.getUserById(userId);
  }

  /**
   * Logout user by clearing refresh token
   */
  static async logout(userId: number): Promise<{ message: string }> {
    await db
      .update(users)
      .set({ refreshToken: null })
      .where(eq(users.id, userId));
      
    return { message: 'Logged out successfully' };
  }
}