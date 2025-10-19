import { db } from '../../db';
import { categories } from '../../db/schema';

/**
 * CategoryService - Business logic for category operations
 * Decoupled from HTTP requests and Elysia context
 */
export abstract class CategoryService {
  
  /**
   * Get all categories
   */
  static async getAllCategories() {
    const allCategories = await db.select().from(categories);
    
    // Convert BigInt to numbers for JSON serialization
    return allCategories.map(category => ({
      ...category,
      id: Number(category.id)
    }));
  }
}