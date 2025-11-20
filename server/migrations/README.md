# Database Migrations

This directory contains SQL migration files that extend the database schema with new features.

## How Migrations Work

Migrations are automatically run by `init-database.js` on server startup. The script:

1. Checks if the migrations directory exists
2. Finds all `.sql` files
3. Runs them in alphabetical order
4. Uses `CREATE TABLE IF NOT EXISTS` to avoid errors on re-runs

## Running Migrations

### On Railway (Production)

Migrations run automatically when you execute:

```bash
npm run init-db
```

This is typically run once after deployment or when new migrations are added.

### Manually via Railway CLI

```bash
railway run node init-database.js
```

### Local Development

```bash
cd server
node init-database.js
```

## Current Migrations

- `add_qotd.sql` - Adds Question of the Day feature with:
  - `daily_questions` table for storing quiz questions
  - `qotd_answers` table for tracking user answers
  - Indexes for performance
  - Sample questions for testing

## Creating New Migrations

1. Create a new `.sql` file with a descriptive name (e.g., `add_feature_name.sql`)
2. Use `CREATE TABLE IF NOT EXISTS` to make migrations idempotent
3. Add `ON CONFLICT DO NOTHING` to inserts to prevent duplicate data errors
4. Test locally before pushing to production

## Important Notes

- Migrations use `IF NOT EXISTS` checks, so they're safe to run multiple times
- The script doesn't track which migrations have been run - it attempts all of them each time
- Failed migrations don't stop the process - they log errors and continue
- Sample data uses `ON CONFLICT DO NOTHING` to avoid duplicate inserts
