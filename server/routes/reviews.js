import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all reviews (public - only approved)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE is_approved = true ORDER BY is_featured DESC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reviews including unapproved (admin only)
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create review (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { author_name, venue_name, rating, review_text, is_featured, is_approved } = req.body;

    const result = await pool.query(
      `INSERT INTO reviews (author_name, venue_name, rating, review_text, is_featured, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [author_name, venue_name, rating, review_text, is_featured || false, is_approved !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update review (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { author_name, venue_name, rating, review_text, is_featured, is_approved } = req.body;

    const result = await pool.query(
      `UPDATE reviews
       SET author_name = $1, venue_name = $2, rating = $3, review_text = $4, is_featured = $5, is_approved = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [author_name, venue_name, rating, review_text, is_featured, is_approved, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete review (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
