import { db } from '../../db';
import { users } from '../../db/schema';

/**
 * UserService - Business logic for user operations
 * Decoupled from HTTP requests and Elysia context
 */
export abstract class UserService {
  
  /**
   * Get all users
   */
  static async getAllUsers() {
    const allUsers = await db.select().from(users);
    
    // Convert BigInt to numbers for JSON serialization
    return allUsers.map(user => ({
      ...user,
      id: Number(user.id)
    }));
  }
}