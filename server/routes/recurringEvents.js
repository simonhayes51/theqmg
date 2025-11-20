import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all recurring events (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT re.*, v.name as venue_name
      FROM recurring_events re
      LEFT JOIN venues v ON re.venue_id = v.id
      ORDER BY re.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get recurring events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single recurring event (admin only)
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT re.*, v.name as venue_name
      FROM recurring_events re
      LEFT JOIN venues v ON re.venue_id = v.id
      WHERE re.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recurring event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get recurring event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create recurring event (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      event_type,
      venue_id,
      recurrence_type,
      day_of_week,
      week_of_month,
      day_of_month,
      event_time,
      start_date,
      end_date,
      generate_weeks_ahead,
      default_image_url,
      default_status,
      is_active
    } = req.body;

    // Validation
    if (!title || !recurrence_type || !event_time || !start_date) {
      return res.status(400).json({
        message: 'Title, recurrence type, event time, and start date are required'
      });
    }

    // Validate recurrence pattern
    if (recurrence_type === 'weekly' || recurrence_type === 'biweekly') {
      if (day_of_week === null || day_of_week === undefined) {
        return res.status(400).json({
          message: 'day_of_week is required for weekly/biweekly recurrence'
        });
      }
    } else if (recurrence_type === 'monthly') {
      if (!day_of_month && (!week_of_month || day_of_week === null)) {
        return res.status(400).json({
          message: 'For monthly recurrence, specify either day_of_month or week_of_month+day_of_week'
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO recurring_events (
        title, description, event_type, venue_id,
        recurrence_type, day_of_week, week_of_month, day_of_month,
        event_time, start_date, end_date, generate_weeks_ahead,
        default_image_url, default_status, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        title, description, event_type, venue_id,
        recurrence_type, day_of_week, week_of_month, day_of_month,
        event_time, start_date, end_date, generate_weeks_ahead || 12,
        default_image_url, default_status || 'scheduled', is_active !== false
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create recurring event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update recurring event (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      event_type,
      venue_id,
      recurrence_type,
      day_of_week,
      week_of_month,
      day_of_month,
      event_time,
      start_date,
      end_date,
      generate_weeks_ahead,
      default_image_url,
      default_status,
      is_active
    } = req.body;

    const result = await pool.query(
      `UPDATE recurring_events SET
        title = $1, description = $2, event_type = $3, venue_id = $4,
        recurrence_type = $5, day_of_week = $6, week_of_month = $7, day_of_month = $8,
        event_time = $9, start_date = $10, end_date = $11, generate_weeks_ahead = $12,
        default_image_url = $13, default_status = $14, is_active = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *`,
      [
        title, description, event_type, venue_id,
        recurrence_type, day_of_week, week_of_month, day_of_month,
        event_time, start_date, end_date, generate_weeks_ahead,
        default_image_url, default_status, is_active,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recurring event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update recurring event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete recurring event (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM recurring_events WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recurring event not found' });
    }

    res.json({ message: 'Recurring event deleted successfully' });
  } catch (error) {
    console.error('Delete recurring event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate events from recurring template (admin only)
router.post('/:id/generate', authenticateToken, isAdmin, async (req, res) => {
  try {
    const recurringEventResult = await pool.query(
      'SELECT * FROM recurring_events WHERE id = $1',
      [req.params.id]
    );

    if (recurringEventResult.rows.length === 0) {
      return res.status(404).json({ message: 'Recurring event not found' });
    }

    const template = recurringEventResult.rows[0];
    const generatedEvents = await generateEventsFromTemplate(template);

    res.json({
      message: `Generated ${generatedEvents.length} events`,
      events: generatedEvents
    });
  } catch (error) {
    console.error('Generate events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to generate events from template
async function generateEventsFromTemplate(template) {
  const generatedEvents = [];
  const today = new Date();
  const startDate = new Date(template.start_date);
  const endDate = template.end_date ? new Date(template.end_date) : null;
  const weeksAhead = template.generate_weeks_ahead || 12;
  const maxDate = new Date(today.getTime() + weeksAhead * 7 * 24 * 60 * 60 * 1000);

  let currentDate = new Date(Math.max(startDate.getTime(), today.getTime()));

  // Generate events based on recurrence type
  while (currentDate <= maxDate && (!endDate || currentDate <= endDate)) {
    let eventDate = null;

    if (template.recurrence_type === 'weekly') {
      // Find next occurrence of day_of_week
      const daysUntilTarget = (template.day_of_week - currentDate.getDay() + 7) % 7;
      eventDate = new Date(currentDate);
      eventDate.setDate(currentDate.getDate() + daysUntilTarget);

      // Move to next week for next iteration
      currentDate = new Date(eventDate);
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (template.recurrence_type === 'biweekly') {
      // Find next occurrence of day_of_week
      const daysUntilTarget = (template.day_of_week - currentDate.getDay() + 7) % 7;
      eventDate = new Date(currentDate);
      eventDate.setDate(currentDate.getDate() + daysUntilTarget);

      // Move to two weeks ahead for next iteration
      currentDate = new Date(eventDate);
      currentDate.setDate(currentDate.getDate() + 14);
    } else if (template.recurrence_type === 'monthly') {
      if (template.day_of_month) {
        // Fixed day of month (e.g., 15th of every month)
        eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), template.day_of_month);

        // If we've passed this month's date, move to next month
        if (eventDate < currentDate) {
          eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, template.day_of_month);
        }

        currentDate = new Date(eventDate.getFullYear(), eventDate.getMonth() + 1, 1);
      } else if (template.week_of_month && template.day_of_week !== null) {
        // Nth weekday of month (e.g., 1st Tuesday)
        eventDate = getNthWeekdayOfMonth(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          template.day_of_week,
          template.week_of_month
        );

        // If we've passed this month's date, move to next month
        if (eventDate < currentDate) {
          const nextMonth = currentDate.getMonth() + 1;
          const nextYear = nextMonth > 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
          eventDate = getNthWeekdayOfMonth(
            nextYear,
            nextMonth % 12,
            template.day_of_week,
            template.week_of_month
          );
        }

        currentDate = new Date(eventDate.getFullYear(), eventDate.getMonth() + 1, 1);
      }
    }

    if (eventDate && eventDate >= today && eventDate <= maxDate && (!endDate || eventDate <= endDate)) {
      // Check if event already exists for this date
      const existingEvent = await pool.query(
        `SELECT id FROM events
         WHERE recurring_event_id = $1 AND event_date = $2`,
        [template.id, eventDate.toISOString().split('T')[0]]
      );

      if (existingEvent.rows.length === 0) {
        // Create the event
        const result = await pool.query(
          `INSERT INTO events (
            title, description, event_type, venue_id, event_date, event_time,
            image_url, status, recurring_event_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
          [
            template.title,
            template.description,
            template.event_type,
            template.venue_id,
            eventDate.toISOString().split('T')[0],
            template.event_time,
            template.default_image_url,
            template.default_status || 'scheduled',
            template.id
          ]
        );

        generatedEvents.push(result.rows[0]);
      }
    }
  }

  return generatedEvents;
}

// Helper to get Nth weekday of month (e.g., 1st Tuesday)
function getNthWeekdayOfMonth(year, month, dayOfWeek, weekNumber) {
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay();

  // Calculate days until target day of week
  const daysUntilTarget = (dayOfWeek - firstDayOfWeek + 7) % 7;

  // Calculate the date of the Nth occurrence
  const targetDate = 1 + daysUntilTarget + (weekNumber - 1) * 7;

  return new Date(year, month, targetDate);
}

export default router;
