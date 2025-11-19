import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'server', '.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

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
      return;
    }

    console.log('📋 Users table not found. Initializing database schema...\n');

    // Read and execute schema.sql
    const schemaPath = join(__dirname, 'database', 'schema.sql');
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
