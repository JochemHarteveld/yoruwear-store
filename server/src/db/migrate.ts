import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from './index';

/**
 * Run Drizzle migrations
 */
export async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    await migrate(db, { 
      migrationsFolder: './src/db/migrations' 
    });
    console.log('✅ Database migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
}