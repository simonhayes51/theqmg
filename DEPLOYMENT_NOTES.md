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

### Troubleshooting: Images Show Question Marks After Deployment

If you've already set up a Railway volume but images still disappear:

#### Step 1: Verify Volume Mount Path
The volume **MUST** be mounted to the exact path where your app saves files. Your app uses:
- Upload path: `/app/uploads/`

Check your Railway volume settings:
1. Go to Railway → Your Service → Volumes tab
2. **Mount Path MUST be**: `/app/uploads` (not `/uploads` or `/app/uploads/images`)
3. If it's wrong, update it and redeploy

#### Step 2: Use Diagnostic Endpoint
After deployment, visit: `https://your-app.railway.app/api/debug/uploads`

This will show:
```json
{
  "uploadsPathAbsolute": "/app/uploads",
  "imagesPathAbsolute": "/app/uploads/images",
  "uploadsExists": true,
  "imagesExists": true,
  "imageFiles": ["team-1234.jpg", "gallery-5678.jpg"],
  "volumeMountedCorrectly": true
}
```

**What to check**:
- `uploadsExists` and `imagesExists` should be `true`
- `imageFiles` should list your uploaded images
- `volumeMountedCorrectly` should be `true`

If `imageFiles` is empty or `volumeMountedCorrectly` is `false`, the volume isn't working.

#### Step 3: Common Fixes

**Problem**: Volume mounted to wrong path (e.g., `/uploads` instead of `/app/uploads`)
**Fix**: Update mount path to `/app/uploads` in Railway and redeploy

**Problem**: Old images uploaded before volume was set up
**Fix**: Re-upload images through the admin panel after volume is properly configured

**Problem**: Images exist but show question marks
**Fix**: Check browser console for 404 errors. The image URLs should be `/uploads/images/filename.jpg`

#### Step 4: Verify After Fix
1. Upload a test image through admin panel
2. Check `/api/debug/uploads` - should see the new image in `imageFiles`
3. Redeploy your app
4. Check `/api/debug/uploads` again - the image should STILL be there
5. If the image persists after redeployment, the volume is working correctly!

### Next Steps
**For immediate fix**: Set up a Railway persistent volume as described in Option 1 above, then use the troubleshooting steps to verify it's working.

---

## Database Backup Reminder
Remember to back up your database regularly, especially before major deployments:
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```
