import mysql from 'mysql2/promise';

async function migrateDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    console.log('Starting safe database migration...');
    
    // First, check if password_hash column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password_hash'
    `, [process.env.DATABASE_NAME]);
    
    if (Array.isArray(columns) && columns.length === 0) {
      console.log('Adding password_hash column to users table...');
      
      // Add password_hash column with a default value first
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN password_hash VARCHAR(255) DEFAULT 'temp_password'
      `);
      
      console.log('password_hash column added successfully');
    } else {
      console.log('password_hash column already exists');
    }
    
    // Check if refresh_token column exists
    const [refreshTokenColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'refresh_token'
    `, [process.env.DATABASE_NAME]);
    
    if (Array.isArray(refreshTokenColumns) && refreshTokenColumns.length === 0) {
      console.log('Adding refresh_token column to users table...');
      
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN refresh_token VARCHAR(500)
      `);
      
      console.log('refresh_token column added successfully');
    } else {
      console.log('refresh_token column already exists');
    }
    
    console.log('Database migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrateDatabase();