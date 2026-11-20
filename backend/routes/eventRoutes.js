const express = require('express');
const db = require('../config/db');
const { nextId, createNotification } = require('../config/helpers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all events (supports ?status=upcoming&q=search)
router.get('/', async (req, res) => {
  try {
    const { status, q } = req.query;
    let sql = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (q) {
      sql += ' AND (name LIKE ? OR type LIKE ? OR location LIKE ? OR description LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    sql += ' ORDER BY date ASC';

    const [rows] = await db.query(sql, params);
    res.json({ success: true, events: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create event (Admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name, type, description = '', date, time = '09:00 AM - 05:00 PM',
      location, organizer = 'Admin', capacity = 100, status = 'upcoming',
      icon = '🪷', image = '', color = 'gold', requirements = '', notifyUsers = true
    } = req.body;

    if (!name || !type || !date || !location) {
      return res.status(400).json({ success: false, message: 'Name, type, date, and location are required' });
    }

    const id = await nextId('events', 'EVT', 3);
    await db.query(
      `INSERT INTO events (id, name, type, description, date, time, location, organizer, capacity, registered, status, icon, image, color, requirements)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
      [id, name, type, description, date, time, location, organizer, capacity, status, icon, image, color, requirements]
    );

    let notified = 0;
    if (notifyUsers !== false) {
      const [users] = await db.query('SELECT id FROM users');
      for (const u of users) {
        await createNotification(u.id, {
          title: `New Event: ${name}`,
          message: `${name} is scheduled on ${date} at ${location}. Registration is now open!`,
          type: 'info',
          icon
        });
      }
      notified = users.length;
    }

    const [created] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
    res.status(201).json({ success: true, event: created[0], notified });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update event (Admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const allowed = ['name', 'type', 'description', 'date', 'time', 'location', 'organizer', 'capacity', 'status', 'icon', 'image', 'color', 'requirements'];
    const updates = [];
    const params = [];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

    params.push(req.params.id);
    await db.query(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, params);
    const [updated] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true, event: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete event (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM registrations WHERE event_id = ?', [req.params.id]);
    await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
