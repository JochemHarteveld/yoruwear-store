import mysql from 'mysql2/promise';
import { config } from './config';

async function resetDatabase() {
  console.log('🗑️ Clearing existing data...');
  
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(config.database.url);
    console.log('✅ Database connection established');
    
    // Disable foreign key checks temporarily
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clear all product and category data
    await connection.execute('DELETE FROM products');
    await connection.execute('DELETE FROM categories');
    
    // Reset auto-increment values
    await connection.execute('ALTER TABLE products AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE categories AUTO_INCREMENT = 1');
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Database cleared successfully');
    
    // Import and run the table setup to reseed
    const { ensureTablesExist } = await import('./ensure-tables');
    await ensureTablesExist();
    
    console.log('🌱 Database reseeded with new product catalog');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if this file is executed directly
if (import.meta.main) {
  resetDatabase();
}

export { resetDatabase };