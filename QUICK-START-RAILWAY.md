# Quick Start: Deploy to Railway in 10 Minutes

## 1️⃣ Push to GitHub (2 minutes)

Your code is ready at `/home/user/theqmg`. Push it:

```bash
cd /home/user/theqmg

# Add remote (if not already added)
git remote add origin https://github.com/simonhayes51/theqmg.git

# Push
git push -u origin main
```

**Need authentication?**
- Use a GitHub Personal Access Token instead of password
- Create at: https://github.com/settings/tokens
- Select scopes: `repo` (full control)

## 2️⃣ Deploy Backend on Railway (3 minutes)

1. Go to **[railway.app](https://railway.app)** → **New Project**
2. Choose **"Deploy from GitHub repo"** → Select `theqmg`
3. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
4. Click on your server service → **Settings**:
   - **Root Directory**: `server`
   - **Start Command**: `node server.js`
5. Click **"Variables"** and add:

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SSL=false
JWT_SECRET=change_this_to_random_string_abc123xyz789
CLIENT_URL=https://your-frontend.up.railway.app
```

**Note:** Railway auto-fills `${{Postgres.DATABASE_URL}}` when you add PostgreSQL.

6. Click **"Deploy"**
7. Copy your backend URL (e.g., `https://xxx.up.railway.app`)

## 3️⃣ Setup Database (2 minutes)

1. Click **PostgreSQL service** → **"Data"** → **"Query"**
2. Copy **ALL** contents from `/home/user/theqmg/database/schema.sql`
3. Paste into query editor
4. Click **"Run Query"**

Done! Your database is ready.

## 4️⃣ Deploy Frontend on Railway (3 minutes)

1. In same project, click **"+ New"** → **"GitHub Repo"** → `theqmg` again
2. Click on this new service → **Settings**:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
3. Click **"Generate Domain"** to get public URL
4. Click **"Variables"** and add:

```
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

Replace `your-backend-url` with URL from Step 2.

5. **Go back to backend service** → Variables → Update:
   - `CLIENT_URL=https://your-frontend-url.up.railway.app`

6. Click **"Deploy"**

## 5️⃣ Login & Change Password (1 minute)

1. Visit your frontend URL
2. Go to `/login`
3. Login:
   - Username: `admin`
   - Password: `admin123`
4. **Immediately change password in admin panel!**

## ✅ Done!

Your site is live! Start adding:
- Events
- Venues
- Services
- Team members
- Gallery images

---

## 🔗 Quick Links

**Your Services:**
- Frontend: `https://[your-service].up.railway.app`
- Backend API: `https://[your-service].up.railway.app/api`
- Admin Panel: `https://[your-service].up.railway.app/login`

**Railway Dashboard:**
- View logs: Railway → Project → Service → "Logs"
- Environment variables: Service → "Variables"
- Database: Click PostgreSQL service → "Data"

**Need Help?**
- See full guide: `RAILWAY-DEPLOYMENT.md`
- Railway docs: https://docs.railway.app
- Project README: `README.md`

---

## 💡 Pro Tips

1. **Auto-Deploy**: Every git push automatically redeploys
2. **Database Backups**: Railway auto-backs up PostgreSQL
3. **Custom Domain**: Settings → "Custom Domain" to add your own
4. **Monitoring**: Check "Metrics" tab for resource usage
5. **Logs**: Always check logs if something doesn't work

## 🚨 Common Issues

**CORS Error?**
- Backend `CLIENT_URL` must match frontend URL exactly
- Include `https://` prefix
- No trailing slash

**Database Empty?**
- Make sure you ran the schema.sql query
- Check PostgreSQL service → "Data" → should see tables

**Images Not Uploading?**
- Railway may need persistent storage configured
- Or use Cloudinary/S3 for production

**Can't Login?**
- Check backend logs
- Verify JWT_SECRET is set
- Make sure database has users table with admin user

---

**That's it! You're live on Railway! 🎉**
