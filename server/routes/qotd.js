import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get today's question (public)
router.get('/today', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, question, answer_a, answer_b, answer_c, answer_d,
              difficulty, category, display_date
       FROM daily_questions
       WHERE display_date = CURRENT_DATE AND is_active = true
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No question available for today' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get today question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get yesterday's question with answer (public)
router.get('/yesterday', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, question, answer_a, answer_b, answer_c, answer_d,
              correct_answer, explanation, difficulty, category, display_date
       FROM daily_questions
       WHERE display_date = CURRENT_DATE - INTERVAL '1 day' AND is_active = true
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No question available for yesterday' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get yesterday question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit answer (public)
router.post('/answer', async (req, res) => {
  try {
    const { question_id, selected_answer, user_name } = req.body;
    const user_ip = req.ip || req.connection.remoteAddress;

    if (!question_id || !selected_answer) {
      return res.status(400).json({ message: 'Question ID and answer are required' });
    }

    // Check if already answered today from this IP
    const existingAnswer = await pool.query(
      `SELECT id FROM qotd_answers
       WHERE question_id = $1 AND user_ip = $2`,
      [question_id, user_ip]
    );

    if (existingAnswer.rows.length > 0) {
      return res.status(400).json({ message: 'You have already answered today!' });
    }

    // Get correct answer
    const questionResult = await pool.query(
      'SELECT correct_answer FROM daily_questions WHERE id = $1',
      [question_id]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const correct_answer = questionResult.rows[0].correct_answer;
    const is_correct = selected_answer.toUpperCase() === correct_answer;

    // Save answer
    await pool.query(
      `INSERT INTO qotd_answers (question_id, user_name, selected_answer, is_correct, user_ip)
       VALUES ($1, $2, $3, $4, $5)`,
      [question_id, user_name || 'Anonymous', selected_answer.toUpperCase(), is_correct, user_ip]
    );

    res.json({ is_correct, correct_answer });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monthly leaderboard (public)
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_name, COUNT(*) as correct_count
       FROM qotd_answers
       WHERE is_correct = true
       AND answered_at >= DATE_TRUNC('month', CURRENT_DATE)
       AND user_name != 'Anonymous'
       GROUP BY user_name
       ORDER BY correct_count DESC
       LIMIT 10`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all questions (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM daily_questions ORDER BY display_date DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create question (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, difficulty, category, display_date } = req.body;

    if (!question || !answer_a || !answer_b || !answer_c || !answer_d || !correct_answer || !display_date) {
      return res.status(400).json({ message: 'All question fields are required' });
    }

    const result = await pool.query(
      `INSERT INTO daily_questions
       (question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, difficulty, category, display_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [question, answer_a, answer_b, answer_c, answer_d, correct_answer.toUpperCase(), explanation, difficulty, category, display_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create question error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'A question already exists for this date' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update question (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation, difficulty, category, display_date, is_active } = req.body;

    const result = await pool.query(
      `UPDATE daily_questions
       SET question = $1, answer_a = $2, answer_b = $3, answer_c = $4, answer_d = $5,
           correct_answer = $6, explanation = $7, difficulty = $8, category = $9,
           display_date = $10, is_active = $11, updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [question, answer_a, answer_b, answer_c, answer_d, correct_answer.toUpperCase(), explanation, difficulty, category, display_date, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete question (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM daily_questions WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
