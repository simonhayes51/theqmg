import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_ADMIN_HASH = '$2b$10$Af9r98hMG9RntVDmctgczOFgg3BvFag2QCHGcDeRNmrWkvIIn9o06';
const KNOWN_BAD_ADMIN_HASH = '$2b$10$j9zzybsutQlbU09r8.xKl.hnsaqQu/Jlo5wozJV0ahK4.SYyC9l8e';

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

async function ensureDefaultAdminUser() {
  const result = await pool.query(
    'SELECT id, username, password_hash FROM users WHERE username = $1',
    ['admin']
  );

  if (result.rows.length === 0) {
    await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ('admin', 'admin@thequizmastergeneral.com', $1, 'admin')`,
      [DEFAULT_ADMIN_HASH]
    );
    console.log('  ✓ Default admin user created');
    return;
  }

  const admin = result.rows[0];
  const defaultPasswordWorks = await bcrypt.compare(DEFAULT_ADMIN_PASSWORD, admin.password_hash);

  if (!defaultPasswordWorks && admin.password_hash === KNOWN_BAD_ADMIN_HASH) {
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [DEFAULT_ADMIN_HASH, admin.id]
    );
    console.log('  ✓ Fixed default admin password hash');
  }
}

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

    await createBaseSchemaIfNeeded();

    // Create migrations tracking table
    await createMigrationsTable();

    // Get list of already executed migrations
    const executedMigrations = await getExecutedMigrations();

    // Get all migration files
    const migrationsDir = path.join(__dirname, '../migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('  ℹ No migrations directory found');
    } else {
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Run in alphabetical order

      // Filter out already executed migrations
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.has(file)
      );

      if (pendingMigrations.length === 0) {
        console.log('  ✓ All migrations up to date');
      } else {
        console.log(`  📝 Found ${pendingMigrations.length} pending migration(s)\n`);

        // Run each pending migration
        for (const file of pendingMigrations) {
          const filePath = path.join(migrationsDir, file);
          await runMigration(file, filePath);
        }

        console.log('\n✅ All migrations completed successfully\n');
      }
    }

    await ensureDefaultAdminUser();
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('   Server will continue, but some features may not work correctly.\n');
    // Don't throw - let the server start even if migrations fail
  }
}

export default runMigrations;
