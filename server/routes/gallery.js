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
    console.log('=== UPLOAD GALLERY IMAGE REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('File:', req.file ? req.file.filename : 'No file');

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const { title, description, category, event_id, display_order } = req.body;
    const image_url = `/uploads/images/${req.file.filename}`;

    // Clean up string fields - handle empty strings and undefined
    const cleanString = (val) => {
      if (val === null || val === undefined || val === '') return null;
      if (typeof val === 'string' && val.trim() === '') return null;
      return typeof val === 'string' ? val.trim() : String(val);
    };

    // Parse event_id - handle empty strings
    let parsedEventId = null;
    if (event_id && event_id !== '' && event_id !== 'null' && event_id !== 'undefined') {
      const eid = parseInt(event_id, 10);
      parsedEventId = isNaN(eid) ? null : eid;
    }

    // Parse display_order
    let parsedDisplayOrder = 0;
    if (display_order && display_order !== '' && display_order !== 'null' && display_order !== 'undefined') {
      const dorder = parseInt(display_order, 10);
      parsedDisplayOrder = isNaN(dorder) ? 0 : dorder;
    }

    console.log('Parsed values:', {
      title: cleanString(title),
      description: cleanString(description),
      category: cleanString(category),
      event_id: parsedEventId,
      display_order: parsedDisplayOrder,
      image_url
    });

    const result = await pool.query(
      `INSERT INTO gallery_images (title, description, image_url, category, event_id, display_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        cleanString(title),
        cleanString(description),
        image_url,
        cleanString(category),
        parsedEventId,
        parsedDisplayOrder
      ]
    );

    console.log('Gallery image uploaded successfully:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('=== UPLOAD GALLERY IMAGE ERROR ===');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Detail:', error.detail);
    console.error('Code:', error.code);
    res.status(500).json({ message: 'Server error', error: error.message, detail: error.detail });
  }
});

// Update gallery image metadata (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log('=== UPDATE GALLERY IMAGE REQUEST ===');
    console.log('Image ID:', req.params.id);
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const { title, description, category, event_id, display_order } = req.body;

    // Clean up string fields - handle empty strings and undefined
    const cleanString = (val) => {
      if (val === null || val === undefined || val === '') return null;
      if (typeof val === 'string' && val.trim() === '') return null;
      return typeof val === 'string' ? val.trim() : String(val);
    };

    // Parse event_id - handle empty strings
    let parsedEventId = null;
    if (event_id && event_id !== '' && event_id !== 'null' && event_id !== 'undefined') {
      const eid = parseInt(event_id, 10);
      parsedEventId = isNaN(eid) ? null : eid;
    }

    // Parse display_order
    let parsedDisplayOrder = 0;
    if (display_order && display_order !== '' && display_order !== 'null' && display_order !== 'undefined') {
      const dorder = parseInt(display_order, 10);
      parsedDisplayOrder = isNaN(dorder) ? 0 : dorder;
    }

    console.log('Parsed values:', {
      title: cleanString(title),
      description: cleanString(description),
      category: cleanString(category),
      event_id: parsedEventId,
      display_order: parsedDisplayOrder
    });

    const result = await pool.query(
      `UPDATE gallery_images
       SET title = $1, description = $2, category = $3, event_id = $4, display_order = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        cleanString(title),
        cleanString(description),
        cleanString(category),
        parsedEventId,
        parsedDisplayOrder,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }

    console.log('Gallery image updated successfully:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('=== UPDATE GALLERY IMAGE ERROR ===');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Detail:', error.detail);
    console.error('Code:', error.code);
    res.status(500).json({ message: 'Server error', error: error.message, detail: error.detail });
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
