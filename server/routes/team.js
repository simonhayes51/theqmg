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
    cb(null, 'team-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all team members (public - only active)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM team_members WHERE is_active = true ORDER BY display_order ASC, id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single team member
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_members WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create team member (admin only)
router.post('/', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, role, bio, email, phone, specialties, display_order, is_active } = req.body;

    const image_url = req.file ? `/uploads/images/${req.file.filename}` : null;
    const specialtiesArray = typeof specialties === 'string' ? JSON.parse(specialties) : specialties;

    const result = await pool.query(
      `INSERT INTO team_members (name, role, bio, image_url, email, phone, specialties, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, role, bio, image_url, email, phone, specialtiesArray || [], display_order || 0, is_active !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update team member (admin only)
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, role, bio, email, phone, specialties, display_order, is_active } = req.body;

    let image_url = req.body.image_url;
    if (req.file) {
      image_url = `/uploads/images/${req.file.filename}`;
    }

    const specialtiesArray = typeof specialties === 'string' ? JSON.parse(specialties) : specialties;

    const result = await pool.query(
      `UPDATE team_members
       SET name = $1, role = $2, bio = $3, image_url = $4, email = $5, phone = $6, specialties = $7, display_order = $8, is_active = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, role, bio, image_url, email, phone, specialtiesArray, display_order, is_active, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete team member (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM team_members WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
