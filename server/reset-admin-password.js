import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function resetAdminPassword() {
  const newPassword = process.argv[2] || 'admin123';

  try {
    console.log('\n🔐 Admin Password Reset Utility');
    console.log('================================\n');

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the admin user's password
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1, updated_at = NOW()
       WHERE username = 'admin' OR role = 'admin'
       RETURNING username, email`,
      [hashedPassword]
    );

    if (result.rows.length === 0) {
      console.log('❌ No admin user found in database!');
      console.log('Creating new admin user...\n');

      await pool.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ('admin', 'admin@thequizmastergeneral.com', $1, 'admin')`,
        [hashedPassword]
      );

      console.log('✅ Admin user created successfully!');
    } else {
      console.log(`✅ Password reset successfully for user: ${result.rows[0].username}`);
      console.log(`   Email: ${result.rows[0].email}`);
    }

    console.log('\n📋 New Login Credentials:');
    console.log('   Username: admin');
    console.log(`   Password: ${newPassword}`);
    console.log('\n⚠️  Please change this password after logging in!');
    console.log('   Go to: Admin Panel → Settings → Change Password\n');

  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();
