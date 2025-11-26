# Deployment Notes

## Image Persistence Issue

### Problem
When deploying a new version, uploaded images (gallery photos, logos, team member photos, etc.) are lost.

### Why This Happens
Railway and most cloud platforms use **ephemeral file systems**. This means:
- When you deploy a new version, a fresh container is created
- Any files uploaded to the previous container are not transferred to the new one
- The `uploads/images/` directory is recreated empty on each deployment

### Solution Options

#### Option 1: Railway Persistent Volumes (Recommended)
Add a persistent volume to your Railway project:

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Volumes" tab
4. Add a new volume:
   - **Mount Path**: `/app/uploads`
   - **Size**: 10GB (adjust based on needs)
5. Redeploy your application

This will ensure the uploads directory persists across deployments.

#### Option 2: Cloud Storage (Alternative)
For production applications with high traffic, consider using cloud storage:
- AWS S3
- Cloudinary
- DigitalOcean Spaces
- Google Cloud Storage

This requires code changes to upload files to the cloud service instead of local filesystem.

### Current Status
- The `uploads/images/` directory is tracked in git with a `.gitkeep` file
- The directory structure is automatically created on server startup
- Images uploaded locally will work until the next deployment

### Next Steps
**For immediate fix**: Set up a Railway persistent volume as described in Option 1 above.

---

## Database Backup Reminder
Remember to back up your database regularly, especially before major deployments:
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```
