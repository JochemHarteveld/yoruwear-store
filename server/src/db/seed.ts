import { db } from './index';
import { users, categories, products, orders, orderItems } from './schema';
import { categories as categoriesData, products as productsData, getUsersData } from './data';

/**
 * Clear all data from the database
 */
async function clearDatabase() {
  console.log('🗑️ Clearing database...');
  
  try {
    // Delete in correct order due to foreign key constraints
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(users);
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

/**
 * Seed the database with initial data
 */
async function seedDatabase() {
  console.log('🌱 Seeding database...');
  
  try {
    // Seed users first
    console.log('👤 Seeding users...');
    const usersData = await getUsersData();
    await db.insert(users).values(usersData);
    console.log(`✅ Inserted ${usersData.length} users`);

    // Seed categories
    console.log('📂 Seeding categories...');
    await db.insert(categories).values(categoriesData);
    console.log(`✅ Inserted ${categoriesData.length} categories`);

    // Seed products
    console.log('🎽 Seeding products...');
    await db.insert(products).values(productsData);
    console.log(`✅ Inserted ${productsData.length} products`);

    console.log('🌱 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Reset and seed the database
 */
export async function resetAndSeedDatabase() {
  console.log('🔄 Resetting and seeding database...');
  
  try {
    await clearDatabase();
    await seedDatabase();
    console.log('🚀 Database reset and seeding completed!');
  } catch (error) {
    console.error('❌ Database reset and seeding failed:', error);
    throw error;
  }
}