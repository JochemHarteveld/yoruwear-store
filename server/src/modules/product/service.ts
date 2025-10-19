import { db } from '../../db';
import { products } from '../../db/schema';

/**
 * ProductService - Business logic for product operations
 * Decoupled from HTTP requests and Elysia context
 */
export abstract class ProductService {
  
  /**
   * Get all products
   */
  static async getAllProducts() {
    const allProducts = await db.select().from(products);
    
    // Convert BigInt to numbers for JSON serialization
    return allProducts.map(product => ({
      ...product,
      id: Number(product.id),
      categoryId: Number(product.categoryId),
      stock: Number(product.stock)
    }));
  }
}