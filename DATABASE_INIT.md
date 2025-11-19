# Database Initialization

## Automatic Initialization (Railway)

The database is now automatically initialized on first deployment! 🎉

When you deploy to Railway, the server will:
1. Check if the `users` table exists
2. If not, run `database/schema.sql` automatically
3. Create all tables and insert default data
4. Create the default admin user

**No manual setup required!**

---

## Manual Initialization (If Needed)

If you need to manually initialize or reset the database:

### Option 1: Run the Init Script

```bash
npm run init-db
```

This will:
- Check if tables exist
- Create all tables if missing
- Insert default admin user and sample data

### Option 2: Direct SQL Execution

```bash
psql $DATABASE_URL -f database/schema.sql
```

---

## What Gets Created

### Tables:
- `users` - Admin authentication
- `events` - Quiz nights and events
- `venues` - Partner venues
- `services` - Service offerings
- `reviews` - Customer testimonials
- `team_members` - Quizmasters and staff
- `gallery_images` - Event photos
- `site_settings` - Site configuration
- `contact_submissions` - Contact form data

### Default Data:
- **Admin User:**
  - Username: `admin`
  - Password: `admin123`
  - ⚠️ **Change after first login!**

- **Sample Services:**
  - Quiz Nights
  - Race Nights
  - Special Events

- **Site Settings:**
  - Site title, tagline
  - Contact information placeholders
  - Social media URL placeholders

---

## Verification

To verify the database is initialized:

```bash
# Using Railway CLI
railway run psql $DATABASE_URL -c "\dt"

# Or check for users table
railway run psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

You should see 1 user (the admin).

---

## Troubleshooting

### "relation does not exist" error

The database tables haven't been created yet. Run:
```bash
npm run init-db
```

### Init script runs on every deployment

This is normal! The script checks if tables exist first and skips initialization if they're already there. It's safe to run multiple times.

### Need to reset the database

**WARNING: This will delete all data!**

```bash
# Drop all tables
railway run psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-initialize
npm run init-db
```
