import mysql from 'mysql2/promise';
import { config } from './config';
import { AuthUtils } from './utils/auth';

export async function ensureTablesExist() {
  console.log('🗄️ Ensuring database tables exist...');
  
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(config.database.url);
    console.log('✅ Database connection established');
    
    // Create categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`description\` text,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      );
    `);
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
        \`email\` varchar(255) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`refresh_token\` varchar(500),
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`users_email_unique\` (\`email\`)
      );
    `);
    
    // Create products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`description\` text,
        \`price\` decimal(10,2) NOT NULL,
        \`stock\` int NOT NULL DEFAULT 0,
        \`category_id\` bigint unsigned,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      );
    `);
    
    // Create orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
        \`user_id\` bigint unsigned,
        \`total\` decimal(10,2) NOT NULL,
        \`status\` varchar(50) NOT NULL DEFAULT 'pending',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      );
    `);
    
    // Create order_items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`order_items\` (
        \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
        \`order_id\` bigint unsigned,
        \`product_id\` bigint unsigned,
        \`quantity\` int NOT NULL,
        \`price\` decimal(10,2) NOT NULL,
        PRIMARY KEY (\`id\`)
      );
    `);
    
    console.log('✅ All tables created successfully');
    
    // Add new columns to users table if they don't exist (for existing databases)
    console.log('🔧 Updating users table schema...');
    try {
      // First try to add columns without IF NOT EXISTS (MySQL compatibility)
      try {
        await connection.execute(`ALTER TABLE \`users\` ADD COLUMN \`password_hash\` varchar(255)`);
        console.log('✅ Added password_hash column');
      } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('ℹ️ password_hash column already exists');
        } else {
          console.log('⚠️ Could not add password_hash column:', error.message);
        }
      }
      
      try {
        await connection.execute(`ALTER TABLE \`users\` ADD COLUMN \`refresh_token\` varchar(500)`);
        console.log('✅ Added refresh_token column');
      } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('ℹ️ refresh_token column already exists');
        } else {
          console.log('⚠️ Could not add refresh_token column:', error.message);
        }
      }
      
    } catch (error: any) {
      console.log('⚠️ Error updating users table:', error.message);
    }
    
    // Add foreign key constraints (only if they don't exist)
    console.log('🔗 Adding foreign key constraints...');
    
    const constraints = [
      {
        name: 'order_items_order_id_fk',
        sql: `ALTER TABLE \`order_items\` ADD CONSTRAINT \`order_items_order_id_fk\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE`
      },
      {
        name: 'order_items_product_id_fk', 
        sql: `ALTER TABLE \`order_items\` ADD CONSTRAINT \`order_items_product_id_fk\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE`
      },
      {
        name: 'orders_user_id_fk',
        sql: `ALTER TABLE \`orders\` ADD CONSTRAINT \`orders_user_id_fk\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE`
      },
      {
        name: 'products_category_id_fk',
        sql: `ALTER TABLE \`products\` ADD CONSTRAINT \`products_category_id_fk\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL`
      }
    ];
    
    for (const constraint of constraints) {
      try {
        await connection.execute(constraint.sql);
        console.log(`✅ Added constraint: ${constraint.name}`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`ℹ️ Constraint ${constraint.name} already exists`);
        } else {
          console.log(`⚠️ Could not add constraint ${constraint.name}:`, error.message);
        }
      }
    }
    
    // Seed data if tables are empty
    console.log('🌱 Checking if seeding is needed...');
    
    const [categoriesResult] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    const categoriesCount = (categoriesResult as any[])[0].count;
    
    if (categoriesCount === 0) {
      console.log('📝 Seeding categories...');
      await connection.execute(`
        INSERT INTO categories (name, description) VALUES
        ('T-Shirts', 'Comfortable cotton t-shirts'),
        ('Hoodies', 'Warm and cozy hoodies'),
        ('Accessories', 'Various accessories'),
        ('Shoes', 'Stylish footwear')
      `);
      
      console.log('� Seeding products...');
      await connection.execute(`
        INSERT INTO products (name, description, price, stock, category_id) VALUES
        ('Classic White T-Shirt', 'A comfortable cotton t-shirt perfect for everyday wear', 29.99, 50, 1),
        ('Black Hoodie', 'Warm and cozy hoodie for cold days', 49.99, 30, 2),
        ('Baseball Cap', 'Stylish cap to complete your outfit', 19.99, 75, 3),
        ('Running Sneakers', 'Comfortable sneakers for your daily run', 79.99, 25, 4)
      `);
      
      console.log('✅ Basic seeding completed');
    } else {
      console.log(`ℹ️ Database already has ${categoriesCount} categories, skipping basic seeding`);
    }
    
    // Handle user seeding/migration separately
    console.log('👤 Handling users with authentication...');
    
    // Check if users exist without passwords and update them
    const [existingUsersResult] = await connection.execute('SELECT id, email, name, password_hash FROM users WHERE password_hash IS NULL OR password_hash = ""');
    const existingUsers = existingUsersResult as any[];
    
    if (existingUsers.length > 0) {
      console.log(`🔧 Found ${existingUsers.length} users without passwords, updating...`);
      
      for (const user of existingUsers) {
        let password = 'DefaultPassword123!';
        if (user.email === 'admin@yoruwear.com') {
          password = 'Admin123!';
        } else if (user.email === 'customer@example.com') {
          password = 'Customer123!';
        }
        
        const passwordHash = await AuthUtils.hashPassword(password);
        await connection.execute(
          'UPDATE users SET password_hash = ? WHERE id = ?',
          [passwordHash, user.id]
        );
      }
      console.log('✅ Updated existing users with password hashes');
    } else {
      // Create default users if none exist
      // Check if there are any users at all
      const [allUsersResult] = await connection.execute('SELECT COUNT(*) as count FROM users');
      const allUsersCount = (allUsersResult as any[])[0].count;
      
      if (allUsersCount === 0) {
        console.log('👤 Creating default users...');
        
        const adminPasswordHash = await AuthUtils.hashPassword('Admin123!');
        const customerPasswordHash = await AuthUtils.hashPassword('Customer123!');
        
        await connection.execute(`
          INSERT INTO users (email, name, password_hash) VALUES
          ('admin@yoruwear.com', 'Admin User', ?),
          ('customer@example.com', 'John Doe', ?)
        `, [adminPasswordHash, customerPasswordHash]);
        
        console.log('✅ Created default users with authentication');
      } else {
        console.log('ℹ️ Users already have authentication configured');
      }
    }
    
    console.log('✅ Database initialization complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}