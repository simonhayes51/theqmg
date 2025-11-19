import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

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
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, address, city, postcode, phone, email, website, description, image_url, is_active } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Venue name is required' });
    }

    const result = await pool.query(
      `INSERT INTO venues (name, address, city, postcode, phone, email, website, description, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, address, city, postcode, phone, email, website, description, image_url, is_active !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update venue (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, address, city, postcode, phone, email, website, description, image_url, is_active } = req.body;

    const result = await pool.query(
      `UPDATE venues
       SET name = $1, address = $2, city = $3, postcode = $4, phone = $5, email = $6,
           website = $7, description = $8, image_url = $9, is_active = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [name, address, city, postcode, phone, email, website, description, image_url, is_active, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update venue error:', error);
    res.status(500).json({ message: 'Server error' });
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
