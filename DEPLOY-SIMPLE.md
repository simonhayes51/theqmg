# Simple Deployment

The app now deploys as one service:

- Express serves the API at `/api`
- Express serves the built React site from `client/dist`
- One Postgres database is required
- The database schema is created automatically on first startup

## Required Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
DB_SSL=true
JWT_SECRET=change-this-to-a-long-random-secret-at-least-32-characters
```

Use `DB_SSL=false` only when your Postgres provider does not require SSL.

`CLIENT_URL` and `VITE_API_URL` are optional for a single-service deployment.

## Railway

1. Create a new project from this GitHub repo.
2. Add a Postgres database.
3. Set the variables above. For Railway Postgres, use:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SSL=false
```

4. Deploy.

Railway will use `nixpacks.toml` / `railway.json`:

```bash
chmod +x build.sh && ./build.sh
cd server && node server.js
```

## Coolify

Use either Nixpacks or Docker.

### Option A: Dockerfile

1. Create a new application from this repo.
2. Choose Dockerfile build.
3. Add a Postgres database or external Postgres connection.
4. Set the required environment variables.
5. Expose the app on Coolify's assigned `PORT`.

### Option B: Nixpacks

Build command:

```bash
chmod +x build.sh && ./build.sh
```

Start command:

```bash
cd server && node server.js
```

## First Login

Default admin user:

```text
Username: admin
Password: admin123
```

Change this immediately after first login.

## Uploads

Uploaded images are stored in `uploads/images`.

For persistent uploads, mount a volume to:

```text
/app/uploads
```

Without a volume, uploaded images may disappear when the service redeploys.