require('dotenv').config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  // This is a warning now instead of an error to allow local dev without a DB.
  // Drizzle Kit will still fail if it tries to run without a DB URL, which is expected.
  console.warn('DATABASE_URL is not set in .env file. Drizzle Kit commands might fail.');
}

/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
