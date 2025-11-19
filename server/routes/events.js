import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
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
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const { upcoming, past, limit } = req.query;

    let query = `
      SELECT e.*, v.name as venue_name, v.city as venue_city
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
    `;

    const conditions = [];
    const params = [];

    if (upcoming === 'true') {
      conditions.push('e.event_date >= CURRENT_DATE');
    } else if (past === 'true') {
      conditions.push('e.event_date < CURRENT_DATE');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY e.event_date DESC';

    if (limit) {
      params.push(parseInt(limit));
      query += ` LIMIT $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event (public)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, v.name as venue_name, v.address as venue_address, v.city as venue_city
       FROM events e
       LEFT JOIN venues v ON e.venue_id = v.id
       WHERE e.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event (admin only)
router.post('/', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, event_type, venue_id, event_date, event_time, status } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({ message: 'Title and event date are required' });
    }

    const image_url = req.file ? `/uploads/images/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO events (title, description, event_type, venue_id, event_date, event_time, status, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, event_type, venue_id || null, event_date, event_time || null, status || 'scheduled', image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (admin only)
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, event_type, venue_id, event_date, event_time, status } = req.body;

    let image_url = req.body.image_url;
    if (req.file) {
      image_url = `/uploads/images/${req.file.filename}`;
    }

    const result = await pool.query(
      `UPDATE events
       SET title = $1, description = $2, event_type = $3, venue_id = $4,
           event_date = $5, event_time = $6, status = $7, image_url = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, description, event_type, venue_id || null, event_date, event_time || null, status, image_url, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
