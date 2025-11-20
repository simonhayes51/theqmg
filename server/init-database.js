import pg from 'pg';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const { Pool} = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Correct password hash for 'admin123'
const CORRECT_ADMIN_HASH = '$2b$10$j9zzybsutQlbU09r8.xKl.hnsaqQu/Jlo5wozJV0ahK4.SYyC9l8e';

async function ensureAdminPassword() {
  try {
    console.log('🔐 Checking admin password...');

    // Get current admin user
    const result = await pool.query('SELECT password_hash FROM users WHERE username = $1', ['admin']);

    if (result.rows.length === 0) {
      console.log('⚠️  Admin user not found, skipping password check');
      return;
    }

    const currentHash = result.rows[0].password_hash;

    // Check if password is correct
    const isCorrect = await bcrypt.compare('admin123', currentHash);

    if (isCorrect) {
      console.log('✅ Admin password is correct\n');
    } else {
      console.log('⚠️  Admin password hash is incorrect, fixing...');
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE username = $2',
        [CORRECT_ADMIN_HASH, 'admin']
      );
      console.log('✅ Admin password updated to correct hash\n');
    }
  } catch (error) {
    console.error('❌ Error checking admin password:', error.message);
  }
}

async function runMigrations() {
  try {
    console.log('🔄 Checking for database migrations...\n');

    const migrationsPath = join(__dirname, 'migrations');

    // Check if migrations directory exists
    if (!fs.existsSync(migrationsPath)) {
      console.log('ℹ️  No migrations directory found, skipping migrations\n');
      return;
    }

    // Get all .sql files in migrations directory
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('ℹ️  No migration files found, skipping migrations\n');
      return;
    }

    console.log(`📋 Found ${migrationFiles.length} migration file(s):`);
    migrationFiles.forEach(file => console.log(`   - ${file}`));
    console.log('');

    // Run each migration
    for (const file of migrationFiles) {
      const migrationPath = join(migrationsPath, file);
      console.log(`🚀 Running migration: ${file}`);

      const sql = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(sql);

      console.log(`   ✅ ${file} completed\n`);
    }

    console.log('✅ All migrations completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    // Don't throw - migrations are optional
  }
}

async function initializeDatabase() {
  try {
    console.log('🔍 Checking database initialization status...\n');

    // Check if users table exists
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    const tableExists = checkTable.rows[0].exists;

    if (tableExists) {
      console.log('✅ Database already initialized (users table exists)');
      console.log('✅ Skipping schema initialization\n');

      // Still check admin password even if DB exists
      await ensureAdminPassword();

      // Run any new migrations even if DB exists
      await runMigrations();
      return;
    }

    console.log('📋 Users table not found. Initializing database schema...\n');

    // Read and execute schema.sql
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📝 Executing schema.sql...');
    await pool.query(schema);

    console.log('\n✅ Database schema created successfully!');
    console.log('✅ Tables created:');
    console.log('   - users');
    console.log('   - events');
    console.log('   - venues');
    console.log('   - services');
    console.log('   - reviews');
    console.log('   - team_members');
    console.log('   - gallery_images');
    console.log('   - site_settings');
    console.log('   - contact_submissions');
    console.log('\n✅ Default admin user created:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ⚠️  Change these credentials after first login!\n');

    // Ensure admin password is correct (in case of previous bad hash)
    await ensureAdminPassword();

    // Run any migrations
    await runMigrations();

  } catch (error) {
    console.error('❌ Database initialization error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Database connection refused. Make sure DATABASE_URL is correct.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Database host not found. Check your DATABASE_URL.');
    }

    throw error;
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('✅ Database initialization complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  });
