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
    cb(null, path.join(__dirname, '../../uploads/images'));
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
    const { name, address, city, postcode, phone, email, website, description, is_active, capacity } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Venue name is required' });
    }

    // Use uploaded file or provided URL
    const image_url = req.file ? `/uploads/images/${req.file.filename}` : req.body.image_url || null;

    // Parse capacity properly - handle empty strings
    const parsedCapacity = capacity && capacity !== '' ? parseInt(capacity) : null;

    const result = await pool.query(
      `INSERT INTO venues (name, address, city, postcode, phone, email, website, description, image_url, is_active, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, address || null, city || null, postcode || null, phone || null, email || null,
       website || null, description || null, image_url, is_active !== 'false', parsedCapacity]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create venue error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update venue (admin only)
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, address, city, postcode, phone, email, website, description, is_active, capacity } = req.body;

    // Use uploaded file, or keep existing image_url from body (if no new file uploaded)
    const image_url = req.file ? `/uploads/images/${req.file.filename}` : req.body.image_url || null;

    // Parse capacity properly - handle empty strings
    const parsedCapacity = capacity && capacity !== '' ? parseInt(capacity) : null;

    const result = await pool.query(
      `UPDATE venues
       SET name = $1, address = $2, city = $3, postcode = $4, phone = $5, email = $6,
           website = $7, description = $8, image_url = $9, is_active = $10, capacity = $11, updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [name || null, address || null, city || null, postcode || null, phone || null, email || null,
       website || null, description || null, image_url, is_active !== 'false', parsedCapacity, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update venue error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
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
