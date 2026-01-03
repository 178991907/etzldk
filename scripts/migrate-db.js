const { execSync } = require('child_process');

console.log('Checking for DATABASE_URL...');

if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL found. Initializing database schema...');
    try {
        // Run drizzle-kit push to sync schema to the database
        execSync('npx drizzle-kit push', { stdio: 'inherit' });
        console.log('✅ Database initialization completed successfully.');
    } catch (error) {
        console.error('❌ Database initialization failed.');
        // We intentionally exit with error to fail the build so the user knows something went wrong
        process.exit(1);
    }
} else {
    console.log('ℹ️  DATABASE_URL not found. Skipping database initialization.');
    console.log('   (This is expected if you are using LocalStorage mode)');
}
