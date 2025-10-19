import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { config } from './config';
import { users, categories, products } from './db/schema';

async function setupDatabase() {
  console.log('🗄️ Setting up Railway MySQL database...');
  
  try {
    // Create connection
    const connection = mysql.createPool(config.database.url);
    const db = drizzle(connection);
    
    console.log('✅ Connected to database');
    
    // Create tables using raw SQL (since Drizzle migrations might be complex)
    console.log('📋 Creating tables...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id serial PRIMARY KEY,
        name varchar(256) NOT NULL,
        description text,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id serial PRIMARY KEY,
        email varchar(256) UNIQUE NOT NULL,
        name varchar(256) NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id serial PRIMARY KEY,
        name varchar(256) NOT NULL,
        description text,
        price varchar(256) NOT NULL,
        stock int NOT NULL DEFAULT 0,
        category_id bigint,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('📝 Inserting categories...');
    await connection.execute(`
      INSERT IGNORE INTO categories (id, name, description) VALUES 
      (1, 'T-Shirts', 'Comfortable cotton t-shirts'),
      (2, 'Hoodies', 'Warm and cozy hoodies'),
      (3, 'Accessories', 'Various accessories'),
      (4, 'Shoes', 'Stylish footwear')
    `);
    
    console.log('👤 Inserting users...');
    await connection.execute(`
      INSERT IGNORE INTO users (id, email, name) VALUES 
      (1, 'admin@yoruwear.com', 'Admin User'),
      (2, 'customer@example.com', 'John Doe')
    `);
    
    console.log('👕 Inserting products...');
    await connection.execute(`
      INSERT IGNORE INTO products (id, name, description, price, stock, category_id) VALUES 
      (1, 'Classic White T-Shirt', 'A comfortable cotton t-shirt perfect for everyday wear', '29.99', 50, 1),
      (2, 'Black Hoodie', 'Warm and cozy hoodie for cold days', '49.99', 30, 2),
      (3, 'Baseball Cap', 'Stylish cap to complete your outfit', '19.99', 75, 3),
      (4, 'Running Sneakers', 'Comfortable sneakers for your daily run', '79.99', 25, 4)
    `);
    
    console.log('✅ Database setup complete!');
    
    // Test query
    console.log('🧪 Testing products query...');
    const testProducts = await db.select().from(products);
    console.log(`Found ${testProducts.length} products`);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupDatabase();