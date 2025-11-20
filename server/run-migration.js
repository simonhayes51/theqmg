import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const migrationFile = process.argv[2] || 'migrations/add_qotd.sql';
  const migrationPath = path.join(__dirname, migrationFile);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Running Database Migration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Read the SQL file
    console.log(`📄 Reading migration file: ${migrationFile}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    console.log('🚀 Executing migration...\n');
    await pool.query(sql);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migration completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('daily_questions', 'qotd_answers')
      ORDER BY table_name
    `);

    console.log('✓ Created tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Check if sample questions were inserted
    const questionsResult = await pool.query('SELECT COUNT(*) as count FROM daily_questions');
    console.log(`\n✓ Sample questions inserted: ${questionsResult.rows[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Migration failed:');
    console.error(error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  }
}

runMigration();
