import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for venue logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'venue-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Get all venues (public)
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    let query = 'SELECT * FROM venues';
    const params = [];

    if (active === 'true') {
      query += ' WHERE is_active = true';
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single venue (public)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM venues WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create venue (admin only)
router.post('/', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('=== CREATE VENUE REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('File:', req.file ? req.file.filename : 'No file');

    const { name, address, city, postcode, phone, email, website, description, is_active, capacity, latitude, longitude } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Venue name is required' });
    }

    // Use uploaded file or provided URL
    const image_url = req.file ? `/uploads/images/${req.file.filename}` : (req.body.image_url || null);

    // Parse capacity - handle empty strings, null, undefined
    let parsedCapacity = null;
    if (capacity && capacity !== '' && capacity !== 'null' && capacity !== 'undefined') {
      const cap = parseInt(capacity, 10);
      parsedCapacity = isNaN(cap) ? null : cap;
    }

    // Parse coordinates
    let parsedLatitude = null;
    let parsedLongitude = null;
    if (latitude && latitude !== '' && latitude !== 'null' && latitude !== 'undefined') {
      const lat = parseFloat(latitude);
      parsedLatitude = isNaN(lat) ? null : lat;
    }
    if (longitude && longitude !== '' && longitude !== 'null' && longitude !== 'undefined') {
      const lng = parseFloat(longitude);
      parsedLongitude = isNaN(lng) ? null : lng;
    }

    // Parse is_active - handle string booleans from FormData
    let parsedIsActive = true; // default to true
    if (is_active !== undefined && is_active !== null && is_active !== '') {
      if (typeof is_active === 'string') {
        parsedIsActive = is_active.toLowerCase() !== 'false' && is_active !== '0';
      } else {
        parsedIsActive = Boolean(is_active);
      }
    }

    // Clean up string fields - handle empty strings and undefined
    const cleanString = (val) => {
      if (val === null || val === undefined || val === '') return null;
      if (typeof val === 'string' && val.trim() === '') return null;
      return typeof val === 'string' ? val.trim() : String(val);
    };

    console.log('Parsed values:', {
      name: cleanString(name),
      parsedCapacity,
      parsedIsActive,
      image_url
    });

    const result = await pool.query(
      `INSERT INTO venues (name, address, city, postcode, phone, email, website, description, image_url, is_active, capacity, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        cleanString(name),
        cleanString(address),
        cleanString(city),
        cleanString(postcode),
        cleanString(phone),
        cleanString(email),
        cleanString(website),
        cleanString(description),
        image_url,
        parsedIsActive,
        parsedCapacity,
        parsedLatitude,
        parsedLongitude
      ]
    );

    console.log('Venue created successfully:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('=== CREATE VENUE ERROR ===');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Detail:', error.detail);
    console.error('Code:', error.code);
    res.status(500).json({ message: 'Server error', error: error.message, detail: error.detail });
  }
});

// Update venue (admin only)
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('=== UPDATE VENUE REQUEST ===');
    console.log('Venue ID:', req.params.id);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('File:', req.file ? req.file.filename : 'No file');

    const { name, address, city, postcode, phone, email, website, description, is_active, capacity, latitude, longitude } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Venue name is required' });
    }

    // Use uploaded file, or keep existing image_url from body (if no new file uploaded)
    const image_url = req.file ? `/uploads/images/${req.file.filename}` : (req.body.image_url || null);

    // Parse capacity - handle empty strings, null, undefined
    let parsedCapacity = null;
    if (capacity && capacity !== '' && capacity !== 'null' && capacity !== 'undefined') {
      const cap = parseInt(capacity, 10);
      parsedCapacity = isNaN(cap) ? null : cap;
    }

    // Parse coordinates
    let parsedLatitude = null;
    let parsedLongitude = null;
    if (latitude && latitude !== '' && latitude !== 'null' && latitude !== 'undefined') {
      const lat = parseFloat(latitude);
      parsedLatitude = isNaN(lat) ? null : lat;
    }
    if (longitude && longitude !== '' && longitude !== 'null' && longitude !== 'undefined') {
      const lng = parseFloat(longitude);
      parsedLongitude = isNaN(lng) ? null : lng;
    }

    // Parse is_active - handle string booleans from FormData
    let parsedIsActive = true; // default to true
    if (is_active !== undefined && is_active !== null && is_active !== '') {
      if (typeof is_active === 'string') {
        parsedIsActive = is_active.toLowerCase() !== 'false' && is_active !== '0';
      } else {
        parsedIsActive = Boolean(is_active);
      }
    }

    // Clean up string fields - handle empty strings and undefined
    const cleanString = (val) => {
      if (val === null || val === undefined || val === '') return null;
      if (typeof val === 'string' && val.trim() === '') return null;
      return typeof val === 'string' ? val.trim() : String(val);
    };

    console.log('Parsed values:', {
      name: cleanString(name),
      parsedCapacity,
      parsedIsActive,
      image_url
    });

    const result = await pool.query(
      `UPDATE venues
       SET name = $1, address = $2, city = $3, postcode = $4, phone = $5, email = $6,
           website = $7, description = $8, image_url = $9, is_active = $10, capacity = $11,
           latitude = $12, longitude = $13, updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        cleanString(name),
        cleanString(address),
        cleanString(city),
        cleanString(postcode),
        cleanString(phone),
        cleanString(email),
        cleanString(website),
        cleanString(description),
        image_url,
        parsedIsActive,
        parsedCapacity,
        parsedLatitude,
        parsedLongitude,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    console.log('Venue updated successfully:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('=== UPDATE VENUE ERROR ===');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Detail:', error.detail);
    console.error('Code:', error.code);
    res.status(500).json({ message: 'Server error', error: error.message, detail: error.detail });
  }
});

// Delete venue (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM venues WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Delete venue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
