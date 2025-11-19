import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for gallery
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all gallery images (public)
router.get('/', async (req, res) => {
  try {
    const { category, limit } = req.query;
    let query = 'SELECT * FROM gallery_images';
    const params = [];

    if (category) {
      params.push(category);
      query += ` WHERE category = $${params.length}`;
    }

    query += ' ORDER BY display_order ASC, created_at DESC';

    if (limit) {
      params.push(parseInt(limit));
      query += ` LIMIT $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload gallery image (admin only)
router.post('/', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const { title, description, category, event_id, display_order } = req.body;
    const image_url = `/uploads/images/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO gallery_images (title, description, image_url, category, event_id, display_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, image_url, category, event_id || null, display_order || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload gallery image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update gallery image metadata (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, category, event_id, display_order } = req.body;

    const result = await pool.query(
      `UPDATE gallery_images
       SET title = $1, description = $2, category = $3, event_id = $4, display_order = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, description, category, event_id || null, display_order, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update gallery image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete gallery image (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM gallery_images WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }
    res.json({ message: 'Gallery image deleted successfully' });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
