import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import database pool
import pool from './config/database.js';

// Import migration runner
import runMigrations from './utils/runMigrations.js';

// Import routes
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import venuesRoutes from './routes/venues.js';
import servicesRoutes from './routes/services.js';
import reviewsRoutes from './routes/reviews.js';
import teamRoutes from './routes/team.js';
import galleryRoutes from './routes/gallery.js';
import settingsRoutes from './routes/settings.js';
import contactRoutes from './routes/contact.js';
import qotdRoutes from './routes/qotd.js';
import recurringEventsRoutes from './routes/recurringEvents.js';
import socialMediaRoutes from './routes/socialMedia.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Validate JWT_SECRET
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('❌ CRITICAL: JWT_SECRET must be set and at least 32 characters long');
  console.error('   Set it in your .env file for security');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // Allow inline styles for Tailwind
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],  // Allow images from external sources
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,  // Allow embedding
}));

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for general API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://profound-abundance-production.up.railway.app',
  'https://www.thequizmastergeneral.com',
  'https://thequizmastergeneral.com',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // In production, allow Railway frontend domain
    if (process.env.NODE_ENV === 'production' && origin && origin.includes('railway.app')) {
      console.log('✅ CORS allowed for Railway domain:', origin);
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      console.log('✅ Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Apply rate limiting
app.use('/api/auth/login', authLimiter);  // Strict limit for login
app.use('/api/auth/change-password', authLimiter);  // Strict limit for password changes
app.use('/api/contact', apiLimiter);  // Prevent contact form spam
app.use('/api/qotd/answer', apiLimiter);  // Prevent answer spam

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/qotd', qotdRoutes);
app.use('/api/recurring-events', recurringEventsRoutes);
app.use('/api/social-media', socialMediaRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Quiz Master General API is running' });
});

// Diagnostic endpoint for uploads directory (helps debug Railway volume issues)
app.get('/api/debug/uploads', (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, 'uploads');
    const imagesPath = path.join(uploadsPath, 'images');

    const diagnostics = {
      currentWorkingDir: process.cwd(),
      serverDir: __dirname,
      uploadsPath: uploadsPath,
      uploadsPathAbsolute: path.resolve(uploadsPath),
      imagesPath: imagesPath,
      imagesPathAbsolute: path.resolve(imagesPath),
      uploadsExists: fs.existsSync(uploadsPath),
      imagesExists: fs.existsSync(imagesPath),
      imageFiles: [],
      volumeMountedCorrectly: false
    };

    // List files in images directory if it exists
    if (fs.existsSync(imagesPath)) {
      diagnostics.imageFiles = fs.readdirSync(imagesPath).filter(f => f !== '.gitkeep');
      diagnostics.volumeMountedCorrectly = diagnostics.imageFiles.length > 0;
    }

    res.json(diagnostics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TEMPORARY: Password reset endpoint (REMOVE AFTER USE)
// GET version - just visit the URL in your browser: https://your-site.com/api/emergency-reset?key=TEMP_RESET_2026
app.get('/api/emergency-reset', async (req, res) => {
  try {
    const { key, password: newPassword } = req.query;

    // Check secret key
    if (key !== 'TEMP_RESET_2026') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const bcrypt = (await import('bcrypt')).default;
    const password = newPassword || 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update admin password
    const result = await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW()
       WHERE username = 'admin' OR role = 'admin'
       RETURNING username, email`,
      [hashedPassword]
    );

    if (result.rows.length === 0) {
      // Create admin user if doesn't exist
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ('admin', 'admin@thequizmastergeneral.com', $1, 'admin')`,
        [hashedPassword]
      );

      return res.json({
        success: true,
        message: 'Admin user created',
        username: 'admin',
        password: password,
        warning: 'REMOVE THIS ENDPOINT AFTER USE!'
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
      username: result.rows[0].username,
      email: result.rows[0].email,
      password: password,
      warning: 'REMOVE THIS ENDPOINT AFTER USE!'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST version for programmatic access
app.post('/api/emergency-reset-password', async (req, res) => {
  try {
    const { secret, newPassword } = req.body;

    // Check secret key
    if (secret !== 'TEMP_RESET_2026') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const bcrypt = (await import('bcrypt')).default;
    const password = newPassword || 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update admin password
    const result = await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW()
       WHERE username = 'admin' OR role = 'admin'
       RETURNING username, email`,
      [hashedPassword]
    );

    if (result.rows.length === 0) {
      // Create admin user if doesn't exist
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ('admin', 'admin@thequizmastergeneral.com', $1, 'admin')`,
        [hashedPassword]
      );

      return res.json({
        success: true,
        message: 'Admin user created',
        username: 'admin',
        password: password,
        warning: 'REMOVE THIS ENDPOINT AFTER USE!'
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
      username: result.rows[0].username,
      email: result.rows[0].email,
      password: password,
      warning: 'REMOVE THIS ENDPOINT AFTER USE!'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from React build (production)
const clientBuildPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  console.log('✓ Serving frontend from:', clientBuildPath);

  // Catch-all route - serve index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Created uploads directory:', uploadsDir);
}

// Run migrations and start server
async function startServer() {
  try {
    // Run database migrations
    await runMigrations();

    // Start server - bind to 0.0.0.0 for Railway
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🎯 Quiz Master General API Server`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`✓ Uploads directory: ${uploadsDir}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
