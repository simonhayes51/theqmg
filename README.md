# The Quiz Master General - Full Stack Website

A modern, full-stack web application for The Quiz Master General quiz provider in North East England. Built with React + Vite frontend, Node.js + Express backend, and PostgreSQL database.

## 🎨 Britpop/Mod Theme

The site features a distinctive British mod/indie aesthetic with:
- Union Jack color palette (Royal Blue #003DA5, British Red #D32F2F)
- Sharp, geometric design
- Bold typography with Impact/Arial Black headings
- High-contrast blue and red color scheme

## 🏗️ Tech Stack

### Frontend
- **Vite + React** - Fast, modern frontend
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling with custom Britpop theme
- **Axios** - API requests
- **Lucide React** - Modern icon library

### Backend
- **Node.js + Express** - RESTful API server
- **PostgreSQL** - Relational database
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

## 📁 Project Structure

```
quiz-master-general/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── pages/admin/   # Admin CMS pages
│   │   ├── services/      # API service layer
│   │   ├── context/       # React context (Auth)
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── tailwind.config.js
├── server/                # Express backend
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── config/            # Database config
│   ├── server.js          # Main server file
│   └── package.json
├── database/              # Database schemas
│   └── schema.sql         # PostgreSQL schema
└── uploads/               # Uploaded images
    └── images/
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb quiz_master_general

# Or using psql
psql -U postgres
CREATE DATABASE quiz_master_general;
\q

# Import the schema
psql -U postgres -d quiz_master_general -f database/schema.sql
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
nano .env  # or use your preferred editor
```

Update `.env` with your actual database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quiz_master_general
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_secret_key_here
```

```bash
# Start the server
npm run dev
```

Server will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the development server
npm run dev
```

Frontend will run on http://localhost:5173

## 🔐 Default Admin Login

```
Username: admin
Email: admin@thequizmastergeneral.com
Password: admin123
```

**⚠️ IMPORTANT: Change the default password immediately after first login!**

## 📊 Database Schema

The application includes these tables:

- **users** - Admin authentication
- **events** - Quiz nights, race nights, special events
- **venues** - Partner venues
- **services** - Service offerings
- **reviews** - Customer testimonials
- **team_members** - Quizmasters and staff
- **gallery_images** - Photo gallery
- **site_settings** - Configurable site content
- **contact_submissions** - Contact form messages

## 🎯 Features

### Public Features
- ✅ Home page with hero section
- ✅ Events calendar
- ✅ Venues listing
- ✅ Services showcase
- ✅ Team member profiles
- ✅ Photo gallery
- ✅ Contact form
- ✅ Testimonials/reviews
- ✅ Responsive Britpop/Mod design

### Admin CMS Features
- ✅ Secure login with JWT
- ✅ Dashboard overview
- ✅ Events management (CRUD)
- ✅ Venues management (CRUD)
- ✅ Services editor
- ✅ Reviews moderation
- ✅ Team member management with photo uploads
- ✅ Gallery management with image uploads
- ✅ Contact form submissions
- ✅ Site settings editor

## 📝 API Endpoints

### Public Endpoints
```
GET  /api/events           - Get all events
GET  /api/events/:id       - Get single event
GET  /api/venues           - Get all venues
GET  /api/services         - Get all services
GET  /api/reviews          - Get approved reviews
GET  /api/team             - Get team members
GET  /api/gallery          - Get gallery images
GET  /api/settings         - Get site settings
POST /api/contact          - Submit contact form
```

### Admin Endpoints (Requires Authentication)
```
POST /api/auth/login                  - Admin login
GET  /api/auth/me                     - Get current user
POST /api/auth/change-password        - Change password

POST   /api/events                    - Create event
PUT    /api/events/:id                - Update event
DELETE /api/events/:id                - Delete event

POST   /api/venues                    - Create venue
PUT    /api/venues/:id                - Update venue
DELETE /api/venues/:id                - Delete venue

POST   /api/services                  - Create service
PUT    /api/services/:id              - Update service
DELETE /api/services/:id              - Delete service

POST   /api/reviews                   - Create review
PUT    /api/reviews/:id               - Update review
DELETE /api/reviews/:id               - Delete review

POST   /api/team                      - Create team member (with image)
PUT    /api/team/:id                  - Update team member
DELETE /api/team/:id                  - Delete team member

POST   /api/gallery                   - Upload gallery image
PUT    /api/gallery/:id               - Update image metadata
DELETE /api/gallery/:id               - Delete image

PUT  /api/settings/:key               - Update setting
POST /api/settings/bulk-update        - Bulk update settings

GET    /api/contact                   - Get all submissions
PUT    /api/contact/:id/read          - Mark as read
PUT    /api/contact/:id/replied       - Mark as replied
DELETE /api/contact/:id               - Delete submission
```

## 🖼️ Images

Place your images in `/uploads/images/`:

1. **qmglogo340.png** - Main logo
2. **uj.png** - Union Jack graphic
3. **modbg2.jpg** - Mod background image
4. **favicon_text.png** - Favicon

Images should be downloaded manually from your current site and placed in the uploads directory.

## 🛠️ Development

### Running Both Frontend and Backend

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

### Building for Production

Frontend:
```bash
cd client
npm run build
# Output in client/dist/
```

Backend is ready for production as-is.

## 🚢 Deployment

### Option 1: Traditional VPS (DigitalOcean, Linode, etc.)

1. **Setup PostgreSQL** on server
2. **Import database schema**
3. **Upload files** to server
4. **Install dependencies** (npm install in both client and server)
5. **Build frontend** (cd client && npm run build)
6. **Serve static files** from Express or use nginx
7. **Use PM2** to run the backend:
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name quiz-master-api
   pm2 startup
   pm2 save
   ```

### Option 2: Cloud Platform

**Backend (Render, Railway, or Heroku)**:
- Deploy the `/server` directory
- Add environment variables
- Connect PostgreSQL database

**Frontend (Vercel, Netlify, or Cloudflare Pages)**:
- Deploy the `/client` directory
- Set build command: `npm run build`
- Set output directory: `dist`
- Add environment variable: `VITE_API_URL`

### Environment Variables for Production

Backend (.env):
```
NODE_ENV=production
PORT=5000
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=quiz_master_general
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_secure_random_string
CLIENT_URL=https://your-frontend-domain.com
```

Frontend (.env):
```
VITE_API_URL=https://your-api-domain.com/api
```

## 🔒 Security

1. **Change default admin password** immediately
2. **Use strong JWT_SECRET** in production
3. **Enable HTTPS** (use Let's Encrypt)
4. **Set strong database password**
5. **Keep dependencies updated**: `npm audit fix`
6. **Restrict CORS** to your actual domain in production
7. **Use environment variables** for all sensitive data

## 📦 Adding More Admin Functionality

To add a new admin page (example: Blog Posts):

1. **Add database table** in `database/schema.sql`
2. **Create API route** in `server/routes/blog.js`
3. **Add route to server.js**: `app.use('/api/blog', blogRoutes)`
4. **Create API service** in `client/src/services/api.js`
5. **Create admin page** in `client/src/pages/admin/Blog.jsx`
6. **Add route** to `client/src/App.jsx`
7. **Add dashboard link** in `client/src/pages/admin/Dashboard.jsx`

## 🎨 Customizing the Theme

Colors are defined in:
- `client/tailwind.config.js` - Tailwind color tokens
- `client/src/index.css` - Custom CSS classes

To change colors, update the values in `tailwind.config.js`:
```javascript
colors: {
  'quiz-blue': '#003DA5',      // Royal Blue
  'quiz-red': '#D32F2F',       // British Red
  'mod-blue': '#00247D',       // Union Jack Blue
  'mod-red': '#C8102E',        // Union Jack Red
}
```

## 📞 Support

For questions or issues:
- Check this README
- Review code comments
- Check browser console for errors
- Check server logs for backend issues

## 📄 License

Proprietary - The Quiz Master General

---

Built with ❤️ for The Quiz Master General - North East England's Premier Quiz Provider
