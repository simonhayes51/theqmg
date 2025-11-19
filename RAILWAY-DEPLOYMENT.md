# Railway Deployment Guide - Quiz Master General

Complete step-by-step guide to deploy The Quiz Master General website to Railway.

## 📋 Prerequisites

1. **Railway Account** - Sign up at [railway.app](https://railway.app)
2. **GitHub Account** - Your code is ready at `/home/user/theqmg`
3. **PostgreSQL Database** - Will be provisioned on Railway

## 🚀 Step-by-Step Deployment

### Step 1: Push Code to GitHub

Your code is ready in `/home/user/theqmg`. Push it to GitHub:

```bash
cd /home/user/theqmg

# If you haven't already, configure git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# The repository is already initialized and committed
# Just add your GitHub remote and push
git remote add origin https://github.com/simonhayes51/theqmg.git
git branch -M main
git push -u origin main
```

**If you need to authenticate:**
- Use a Personal Access Token (PAT) instead of password
- Create one at: GitHub → Settings → Developer Settings → Personal Access Tokens
- Or use SSH keys

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app) and log in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account if not already connected
5. Select the **`theqmg`** repository

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway will provision a PostgreSQL database automatically

### Step 4: Deploy the Backend (Server)

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"** → Choose `theqmg`
3. Railway will detect it's a Node.js project

**Configure the Backend Service:**

1. Click on the service → **"Settings"**
2. Set **Root Directory**: `server`
3. Set **Start Command**: `node server.js`
4. Set **Build Command**: `npm install`

**Environment Variables** (click "Variables" tab):

**Option 1: Using DATABASE_URL (Recommended - Simpler)**

```
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SSL=false
JWT_SECRET=your_super_secret_jwt_key_here_change_this
CLIENT_URL=https://your-frontend-url.up.railway.app
```

**Option 2: Using Individual Database Variables**

```
NODE_ENV=production
PORT=5000
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
JWT_SECRET=your_super_secret_jwt_key_here_change_this
CLIENT_URL=https://your-frontend-url.up.railway.app
```

**Important:**
- Railway auto-fills `${{Postgres.XXX}}` variables if you add the PostgreSQL service
- DATABASE_URL is the simplest approach - Railway provides this automatically
- Generate a secure JWT_SECRET: `openssl rand -base64 32`
- CLIENT_URL will be set after deploying frontend (Step 6)

5. Click **"Deploy"**

### Step 5: Initialize Database Schema

After backend is deployed:

1. Click on the **PostgreSQL service**
2. Click **"Data"** tab → **"Query"**
3. Copy the contents of `/home/user/theqmg/database/schema.sql`
4. Paste into the query editor
5. Click **"Run Query"**

This creates all tables and sample data.

**Or use Railway CLI:**
```bash
railway login
railway link
railway run psql -f database/schema.sql
```

### Step 6: Deploy the Frontend (Client)

1. In Railway project, click **"+ New"**
2. Select **"GitHub Repo"** → Choose `theqmg` again
3. Railway creates a new service

**Configure the Frontend Service:**

1. Click on the service → **"Settings"**
2. Set **Root Directory**: `client`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm run preview` (or use nginx - see below)
5. Click **"Generate Domain"** to get your public URL

**Environment Variables:**

```
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

Replace `your-backend-url` with your actual backend service URL from Step 4.

**Update Backend CLIENT_URL:**
- Go back to backend service → Variables
- Update `CLIENT_URL` with your frontend URL from Step 6

6. Click **"Deploy"**

### Step 7: Configure CORS

Your backend should already have CORS configured, but verify:

In `server/server.js`:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

This should work automatically with the `CLIENT_URL` environment variable.

### Step 8: Test Your Deployment

1. Visit your frontend URL: `https://your-frontend.up.railway.app`
2. Navigate to `/login`
3. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
4. ⚠️ **IMMEDIATELY change the password** in admin panel

## 🔧 Alternative Deployment: Single Service

You can also deploy as a single service where Express serves the React build:

1. Add to `server/server.js` (before routes):

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}
```

2. Create `build.sh` in project root:

```bash
#!/bin/bash
cd client && npm install && npm run build
cd ../server && npm install
```

3. In Railway Settings:
   - Root Directory: `/`
   - Build Command: `chmod +x build.sh && ./build.sh`
   - Start Command: `cd server && node server.js`
   - PORT: `$PORT` (Railway auto-assigns)

## 📊 Environment Variables Summary

### Backend Service

**Recommended (DATABASE_URL):**
```
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SSL=false
JWT_SECRET=<generate-secure-key>
CLIENT_URL=<your-frontend-url>
```

**Alternative (Individual Variables):**
```
NODE_ENV=production
PORT=5000
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
JWT_SECRET=<generate-secure-key>
CLIENT_URL=<your-frontend-url>
```

### Frontend Service
```
VITE_API_URL=<your-backend-url>/api
```

## 🔐 Security Checklist

After deployment:

- [ ] Change default admin password (admin/admin123)
- [ ] Set strong JWT_SECRET
- [ ] Verify CORS is properly configured
- [ ] Enable HTTPS (Railway does this automatically)
- [ ] Test all admin functions
- [ ] Test contact form
- [ ] Test image uploads
- [ ] Review database connection security

## 📱 Custom Domain (Optional)

1. In Railway project → Service → Settings
2. Click **"Generate Domain"** or **"Custom Domain"**
3. Add your domain (e.g., thequizmastergeneral.com)
4. Configure DNS:
   - Add CNAME record pointing to Railway URL
   - Or A record to Railway IP

Railway provides automatic SSL certificates for custom domains.

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check database is provisioned
railway status

# Check connection
railway run psql
\dt  # List tables
```

### Build Failures
```bash
# Check logs
railway logs

# Common issues:
# - Missing environment variables
# - Wrong root directory
# - Node version mismatch
```

### CORS Errors
- Verify `CLIENT_URL` in backend matches frontend URL exactly
- Include protocol (https://)
- No trailing slash

### Image Uploads Not Working
- Check Railway volumes/persistent storage
- Consider using S3/Cloudinary for production uploads
- Verify multer configuration

## 📈 Monitoring & Logs

View logs in Railway:
```bash
# Using CLI
railway logs

# Or in Railway dashboard
Project → Service → "Logs" tab
```

## 💰 Pricing

**Railway Pricing (as of 2024):**
- **Starter Plan**: $5/month
- **Hobby Plan**: $20/month (includes $20 credits)
- PostgreSQL usage billed separately

**Estimated Monthly Cost:**
- Backend service: ~$5-10
- PostgreSQL: ~$5-10
- Frontend service: ~$5
- **Total**: ~$15-25/month

## 🔄 Updates & Redeployment

Railway auto-deploys when you push to GitHub:

```bash
cd /home/user/theqmg
git add .
git commit -m "Update feature"
git push origin main
```

Railway automatically rebuilds and redeploys.

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Project README**: See `/home/user/theqmg/README.md`

## ✅ Post-Deployment Checklist

- [ ] Both services deployed successfully
- [ ] Database schema imported
- [ ] Environment variables set correctly
- [ ] Can access frontend URL
- [ ] Can access backend API (check /api/health)
- [ ] Can login to admin panel
- [ ] Changed default password
- [ ] Tested creating events
- [ ] Tested image uploads
- [ ] Tested contact form
- [ ] Custom domain configured (optional)
- [ ] Backups configured

---

## 🎉 You're Live!

Your Quiz Master General website is now deployed on Railway with:
- ✅ Fast React frontend
- ✅ Secure Node.js/Express backend
- ✅ PostgreSQL database
- ✅ Admin CMS
- ✅ Automatic HTTPS
- ✅ Auto-deployments from GitHub

Manage your content through: `https://your-site.com/login`
