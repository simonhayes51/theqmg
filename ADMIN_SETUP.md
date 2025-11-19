# Admin Login Setup

## Default Login Credentials

```
Username: admin
Password: admin123
```

**Login URL:** `/login` (e.g., `http://localhost:5173/login` or `https://your-domain.com/login`)

⚠️ **IMPORTANT:** Change these credentials immediately after first login!

## Database Setup

### Option 1: Initialize Database with Schema

If you haven't initialized your Railway PostgreSQL database yet:

```bash
# Make sure your DATABASE_URL is set in server/.env
# Then run the schema SQL file
psql $DATABASE_URL < database/schema.sql
```

This will:
- Create all required tables (users, events, venues, services, etc.)
- Insert the default admin user
- Insert sample services data

### Option 2: Run the Admin Setup Script

If the schema is already initialized but the admin user needs to be created/reset:

```bash
node setup-admin.js
```

This script will:
- Generate a secure bcrypt hash for "admin123"
- Create or update the admin user in your database
- Display the login credentials

## Changing the Admin Password

After logging in for the first time, you should change your password:

1. Log in with the default credentials
2. Navigate to Admin Settings (if available) or use the change password endpoint
3. Use a strong, unique password

### Via API:

```bash
POST /api/auth/change-password
Headers: Authorization: Bearer <your-jwt-token>
Body: {
  "currentPassword": "admin123",
  "newPassword": "your-new-secure-password"
}
```

## Accessing the Admin Area

1. Start your development server:
   ```bash
   cd client
   npm run dev
   ```

2. Navigate to: `http://localhost:5173/login`

3. Enter the default credentials

4. You'll be redirected to `/admin` with access to:
   - Events Management
   - Services Management
   - Venues Management
   - Reviews Management
   - Team Management
   - Gallery Management
   - Contact Submissions

## Troubleshooting

### "Invalid credentials" error

1. Make sure the database schema has been initialized
2. Run `node setup-admin.js` to create/reset the admin user
3. Check that your DATABASE_URL is correctly configured in `server/.env`

### Users table doesn't exist

Run the database schema:
```bash
psql $DATABASE_URL < database/schema.sql
```

### Cannot connect to database

1. Verify DATABASE_URL in `server/.env`
2. Make sure Railway PostgreSQL is running
3. Check that SSL settings are correct (`DB_SSL=false` for Railway internal connection)
