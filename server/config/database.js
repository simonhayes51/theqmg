import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

// Support both DATABASE_URL (Railway/Heroku style) and individual env variables
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'quiz_master_general',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Database Configuration:');
console.log(`Connection method: ${process.env.DATABASE_URL ? 'DATABASE_URL' : 'Individual variables'}`);
if (process.env.DATABASE_URL) {
  // Show partial connection string for security
  const url = new URL(process.env.DATABASE_URL);
  console.log(`Host: ${url.hostname}`);
  console.log(`Port: ${url.port}`);
  console.log(`Database: ${url.pathname.substring(1)}`);
  console.log(`SSL: ${poolConfig.ssl ? 'enabled' : 'disabled'}`);
} else {
  console.log(`Host: ${poolConfig.host}`);
  console.log(`Port: ${poolConfig.port}`);
  console.log(`Database: ${poolConfig.database}`);
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const pool = new Pool(poolConfig);

// Test the connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ Database connection error:');
  console.error(err);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(-1);
});

// Test initial connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Failed to connect to database:');
    console.error(err.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('\nPlease check:');
    console.error('1. DATABASE_URL is set correctly in environment variables');
    console.error('2. Database server is running and accessible');
    console.error('3. Database credentials are correct');
    console.error('4. Network/firewall allows connection\n');
  } else {
    console.log('✓ Database connection test successful');
    console.log(`✓ Server time: ${res.rows[0].now}\n`);
  }
});

export default pool;
