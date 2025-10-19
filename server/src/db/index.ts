import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL || 'mysql://yoruwear_user:yourpassword@localhost:3306/yoruwear',
  multipleStatements: true,
});

export const db = drizzle(connection, { schema, mode: 'default' });
export type Database = typeof db;