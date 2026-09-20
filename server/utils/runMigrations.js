import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function baseSchemaExists() {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'users'
    );
  `);

  return result.rows[0].exists;
}

async function createBaseSchemaIfNeeded() {
  if (await baseSchemaExists()) {
    return;
  }

  const schemaPath = path.join(__dirname, '../schema.sql');

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Base schema file not found: ${schemaPath}`);
  }

  console.log('  -> Base schema missing, creating database tables');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('  ✓ Base schema created');
}

async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getExecutedMigrations() {
  const result = await pool.query('SELECT filename FROM schema_migrations');
  return new Set(result.rows.map(row => row.filename));
}

async function runMigration(filename, filePath) {
  try {
    console.log(`  -> Running migration: ${filename}`);
    const sql = fs.readFileSync(filePath, 'utf8');

    await pool.query(sql);
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

export async function runMigrations() {
  try {
    console.log('\n🔄 Checking for database migrations...');

    await createBaseSchemaIfNeeded();
    await createMigrationsTable();

    const executedMigrations = await getExecutedMigrations();
    const migrationsDir = path.join(__dirname, '../migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('  ℹ No migrations directory found');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.has(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('  ✓ All migrations up to date');
      return;
    }

    console.log(`  📝 Found ${pendingMigrations.length} pending migration(s)\n`);

    for (const file of pendingMigrations) {
      const filePath = path.join(migrationsDir, file);
      await runMigration(file, filePath);
    }

    console.log('\n✅ All migrations completed successfully\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('   Server will continue, but some features may not work correctly.\n');
  }
}

export default runMigrations;
