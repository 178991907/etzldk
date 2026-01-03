import { drizzle } from 'drizzle-orm/neon-http';
import { neon, type NeonHttpDatabase } from '@neondatabase/serverless';
import * as schema from './schema';
import 'dotenv/config';

let db: NeonHttpDatabase<typeof schema>;
let dbInitializationError: Error | null = null;

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  dbInitializationError = new Error("DATABASE_URL is not set. Database operations will be disabled.");
} else {
  try {
    // Ultimate fix: Clean up the connection string to handle common copy-paste errors
    // from psql or other clients. This regex finds the actual URL.
    const urlMatch = connectionString.match(/postgresql:\/\/[^'"]+/);
    if (urlMatch) {
      connectionString = urlMatch[0];
    }

    const sql = neon(connectionString);
    db = drizzle(sql, { schema });
  } catch (error) {
    dbInitializationError = new Error(`Failed to initialize database: ${(error as Error).message}`);
    console.error(dbInitializationError);
  }
}

// @ts-ignore - This is a valid export pattern for conditional modules
export { db, dbInitializationError };
