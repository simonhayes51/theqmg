import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create migrations tracking table if it doesn't exist
async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Get list of executed migrations
async function getExecutedMigrations() {
  const result = await pool.query('SELECT filename FROM schema_migrations');
  return new Set(result.rows.map(row => row.filename));
}

// Run a single migration file
async function runMigration(filename, filePath) {
  try {
    console.log(`  → Running migration: ${filename}`);
    const sql = fs.readFileSync(filePath, 'utf8');

    // Execute the migration
    await pool.query(sql);

    // Record that this migration was executed
    await pool.query(
      'INSERT INTO schema_migrations (filename) VALUES ($1)',
      [filename]
    );

    console.log(`  ✓ Migration completed: ${filename}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Migration failed: ${filename}`);
    console.error(`    Error: ${error.message}`);
    throw error;
  }
}

// Run all pending migrations
export async function runMigrations() {
  try {
    console.log('\n🔄 Checking for database migrations...');

    // Create migrations tracking table
    await createMigrationsTable();

    // Get list of already executed migrations
    const executedMigrations = await getExecutedMigrations();

    // Get all migration files
    const migrationsDir = path.join(__dirname, '../migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('  ℹ No migrations directory found');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Run in alphabetical order

    // Filter out already executed migrations
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.has(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('  ✓ All migrations up to date');
      return;
    }

    console.log(`  📝 Found ${pendingMigrations.length} pending migration(s)\n`);

    // Run each pending migration
    for (const file of pendingMigrations) {
      const filePath = path.join(migrationsDir, file);
      await runMigration(file, filePath);
    }

    console.log('\n✅ All migrations completed successfully\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('   Server will continue, but some features may not work correctly.\n');
    // Don't throw - let the server start even if migrations fail
  }
}

export default runMigrations;
