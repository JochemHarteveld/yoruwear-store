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
        ('T-Shirts', 'Comfortable cotton t-shirts and graphic tees'),
        ('Hoodies & Sweatshirts', 'Warm and cozy hoodies and sweatshirts'),
        ('Accessories', 'Fashion accessories to complete your look'),
        ('Shoes', 'Stylish footwear for every occasion'),
        ('Jackets', 'Outerwear for all seasons'),
        ('Pants & Jeans', 'Comfortable bottoms and denim'),
        ('Dresses & Skirts', 'Elegant dresses and stylish skirts'),
        ('Bags', 'Handbags, backpacks, and carry accessories')
      `);
      
      console.log('🛍️ Seeding products with European pricing...');
      await connection.execute(`
        INSERT INTO products (name, description, price, stock, category_id) VALUES
        -- T-Shirts
        ('Classic White Cotton Tee', 'Premium 100% cotton t-shirt with perfect fit for everyday wear', 24.99, 75, 1),
        ('Vintage Black Band Tee', 'Retro-style band t-shirt with distressed graphics', 29.99, 45, 1),
        ('Organic Green Earth Tee', 'Eco-friendly organic cotton t-shirt with nature print', 32.99, 60, 1),
        ('Striped Navy Breton Shirt', 'Classic French-inspired striped long-sleeve tee', 39.99, 35, 1),
        ('Minimalist Grey V-Neck', 'Clean, modern v-neck tee perfect for layering', 27.99, 80, 1),
        ('Graphic Print Sunset Tee', 'Artist-designed sunset graphic on premium cotton', 34.99, 55, 1),
        
        -- Hoodies & Sweatshirts  
        ('Oversized Black Hoodie', 'Ultra-comfortable oversized hoodie with kangaroo pocket', 69.99, 40, 2),
        ('Vintage Wash Crewneck', 'Retro-style crewneck sweatshirt with vintage wash finish', 59.99, 50, 2),
        ('Zip-Up Grey Hoodie', 'Premium zip-up hoodie with brushed inner lining', 74.99, 35, 2),
        ('Cropped Pink Hoodie', 'Trendy cropped hoodie perfect for layering', 64.99, 45, 2),
        ('University Style Pullover', 'Classic collegiate-style pullover sweatshirt', 54.99, 60, 2),
        ('Fleece-Lined Winter Hoodie', 'Extra warm fleece-lined hoodie for cold weather', 89.99, 25, 2),
        
        -- Accessories
        ('Leather Baseball Cap', 'Premium leather baseball cap with adjustable strap', 39.99, 90, 3),
        ('Wool Beanie Hat', 'Cozy merino wool beanie in multiple colors', 24.99, 100, 3),
        ('Silk Square Scarf', 'Luxurious silk scarf with hand-rolled edges', 79.99, 40, 3),
        ('Canvas Belt', 'Durable canvas belt with metal buckle', 29.99, 70, 3),
        ('Leather Wallet', 'Genuine leather bi-fold wallet with RFID protection', 49.99, 55, 3),
        ('Sunglasses Classic', 'Vintage-inspired sunglasses with UV protection', 89.99, 65, 3),
        ('Watch Minimalist', 'Clean design watch with leather strap', 149.99, 30, 3),
        
        -- Shoes
        ('White Leather Sneakers', 'Premium white leather sneakers with cushioned sole', 129.99, 45, 4),
        ('Black Canvas High-Tops', 'Classic high-top canvas sneakers', 79.99, 60, 4),
        ('Brown Leather Boots', 'Handcrafted leather ankle boots', 189.99, 25, 4),
        ('Running Sports Shoes', 'Professional running shoes with advanced cushioning', 159.99, 40, 4),
        ('Slip-On Loafers', 'Comfortable slip-on loafers for casual wear', 99.99, 50, 4),
        ('Hiking Boots', 'Waterproof hiking boots with excellent grip', 219.99, 20, 4),
        
        -- Jackets
        ('Denim Jacket Classic', 'Timeless denim jacket in premium wash', 89.99, 35, 5),
        ('Leather Biker Jacket', 'Genuine leather jacket with asymmetric zip', 299.99, 15, 5),
        ('Puffer Winter Coat', 'Warm puffer jacket with down filling', 179.99, 30, 5),
        ('Bomber Jacket Green', 'Classic MA-1 style bomber jacket', 124.99, 40, 5),
        ('Trench Coat Beige', 'Elegant double-breasted trench coat', 249.99, 20, 5),
        ('Windbreaker Light', 'Lightweight packable windbreaker', 69.99, 55, 5),
        
        -- Pants & Jeans
        ('Slim Fit Blue Jeans', 'Classic slim-fit jeans in dark wash', 79.99, 70, 6),
        ('Black Skinny Jeans', 'Stretchy skinny jeans for perfect fit', 74.99, 65, 6),
        ('Chino Pants Khaki', 'Smart-casual chino pants in khaki', 59.99, 80, 6),
        ('Cargo Pants Olive', 'Utilitarian cargo pants with multiple pockets', 69.99, 50, 6),
        ('Joggers Comfortable', 'Soft cotton joggers for lounging', 44.99, 90, 6),
        ('Wide-Leg Trousers', 'Elegant wide-leg trousers for formal occasions', 89.99, 40, 6),
        
        -- Dresses & Skirts
        ('Summer Floral Dress', 'Light and airy floral dress perfect for summer', 79.99, 45, 7),
        ('Little Black Dress', 'Classic LBD suitable for any occasion', 99.99, 35, 7),
        ('Midi Wrap Dress', 'Flattering wrap dress in solid colors', 89.99, 50, 7),
        ('Pleated Mini Skirt', 'Trendy pleated mini skirt in various colors', 49.99, 60, 7),
        ('Maxi Boho Dress', 'Bohemian-style maxi dress with flowing fabric', 94.99, 30, 7),
        ('A-Line Denim Skirt', 'Classic A-line denim skirt with button front', 54.99, 55, 7),
        
        -- Bags
        ('Leather Crossbody Bag', 'Compact crossbody bag in genuine leather', 119.99, 40, 8),
        ('Canvas Backpack', 'Durable canvas backpack for daily use', 69.99, 60, 8),
        ('Tote Bag Large', 'Spacious tote bag perfect for work or shopping', 79.99, 55, 8),
        ('Evening Clutch', 'Elegant clutch bag for special occasions', 89.99, 25, 8),
        ('Weekender Duffel', 'Large duffel bag for weekend trips', 149.99, 30, 8),
        ('Laptop Messenger Bag', 'Professional messenger bag with laptop compartment', 99.99, 45, 8)
      `);
      
      console.log('✅ Complete product catalog seeded with European pricing');
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