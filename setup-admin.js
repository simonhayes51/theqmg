import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

const { Pool } = pg;

// Use DATABASE_URL from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function setupAdmin() {
  try {
    console.log('🔐 Setting up admin user...\n');

    // Generate password hash
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('Generated password hash for "admin123"');
    console.log('Hash:', passwordHash, '\n');

    // Insert or update admin user
    const query = `
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username)
      DO UPDATE SET password_hash = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING id, username, email, role;
    `;

    const result = await pool.query(query, [
      'admin',
      'admin@thequizmastergeneral.com',
      passwordHash,
      'admin'
    ]);

    console.log('✅ Admin user created/updated successfully!\n');
    console.log('Login Credentials:');
    console.log('==================');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change these credentials after first login!\n');
    console.log('User details:', result.rows[0]);

  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);

    if (error.code === '42P01') {
      console.error('\n💡 Tip: Run the database schema first:');
      console.error('   psql $DATABASE_URL < database/schema.sql');
    }
  } finally {
    await pool.end();
  }
}

setupAdmin();
