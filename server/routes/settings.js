import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all settings (public - for site display)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_settings ORDER BY setting_key ASC');

    // Convert to key-value object for easier frontend use
    const settings = result.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all settings with metadata (admin only)
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_settings ORDER BY setting_key ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a setting (admin only)
router.put('/:key', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { setting_value } = req.body;
    const { key } = req.params;

    const result = await pool.query(
      `UPDATE site_settings
       SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
       WHERE setting_key = $2
       RETURNING *`,
      [setting_value, key]
    );

    if (result.rows.length === 0) {
      // If setting doesn't exist, create it
      const insertResult = await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value, setting_type)
         VALUES ($1, $2, 'text')
         RETURNING *`,
        [key, setting_value]
      );
      return res.status(201).json(insertResult.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update settings (admin only)
router.post('/bulk-update', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log('=== BULK UPDATE SETTINGS REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const { settings } = req.body; // Object with key-value pairs

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Settings object is required' });
    }

    // Clean up values - convert empty strings to null
    const cleanValue = (val) => {
      if (val === null || val === undefined || val === '') return null;
      if (typeof val === 'string') return val.trim();
      return String(val);
    };

    console.log('Settings to update:', Object.keys(settings));

    const promises = Object.entries(settings).map(([key, value]) => {
      const cleanedValue = cleanValue(value);
      console.log(`Updating ${key}:`, cleanedValue);
      return pool.query(
        `INSERT INTO site_settings (setting_key, setting_value, setting_type)
         VALUES ($1, $2, 'text')
         ON CONFLICT (setting_key)
         DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, cleanedValue]
      );
    });

    await Promise.all(promises);

    console.log('Settings updated successfully');
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('=== BULK UPDATE SETTINGS ERROR ===');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Detail:', error.detail);
    console.error('Code:', error.code);
    res.status(500).json({ message: 'Server error', error: error.message, detail: error.detail });
  }
});

export default router;
