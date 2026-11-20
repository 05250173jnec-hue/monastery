const express = require('express');
const db = require('../config/db');
const { nextId, createNotification } = require('../config/helpers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get registrations (Admin gets all; Monk/Participant gets their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await db.query('SELECT * FROM registrations ORDER BY registered_at DESC');
      return res.json({ success: true, registrations: rows });
    }
    const [rows] = await db.query('SELECT * FROM registrations WHERE user_id = ? ORDER BY registered_at DESC', [req.user.id]);
    res.json({ success: true, registrations: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Register for an event
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { eventId, notes = '' } = req.body;
    const userId = req.user.id;

    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) return res.status(404).json({ success: false, message: 'Event not found' });
    const event = events[0];

    const [existing] = await db.query('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?', [userId, eventId]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You are already registered for this event' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    const user = users[0];

    const id = await nextId('registrations', 'REG', 4);
    await db.query(
      `INSERT INTO registrations (id, event_id, user_id, user_name, user_email, event_name, event_date, event_location, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, event.id, user.id, user.name, user.email, event.name, event.date, event.location, notes]
    );

    await db.query('UPDATE events SET registered = registered + 1 WHERE id = ?', [event.id]);

    await createNotification(user.id, {
      title: 'Registered Successfully',
      message: `You have registered for ${event.name}. The admin will review and confirm your registration.`,
      type: 'success',
      icon: '✅'
    });

    await createNotification('ADMIN', {
      title: 'New Registration',
      message: `${user.name} registered for ${event.name}.`,
      type: 'info',
      icon: '📝'
    });

    const [created] = await db.query('SELECT * FROM registrations WHERE id = ?', [id]);
    res.status(201).json({ success: true, registration: created[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update registration status (Admin)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [regs] = await db.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
    if (regs.length === 0) return res.status(404).json({ success: false, message: 'Registration not found' });
    const reg = regs[0];

    await db.query('UPDATE registrations SET status = ? WHERE id = ?', [status, req.params.id]);

    const msgMap = {
      confirmed: { title: 'Registration Confirmed', message: `Your registration for ${reg.event_name} has been confirmed.`, icon: '✅', type: 'success' },
      cancelled: { title: 'Registration Cancelled', message: `Your registration for ${reg.event_name} has been cancelled.`, icon: '❌', type: 'warning' },
      pending: { title: 'Registration Pending', message: `Your registration for ${reg.event_name} is pending review.`, icon: '⏳', type: 'info' }
    };

    await createNotification(reg.user_id, msgMap[status]);
    res.json({ success: true, message: `Registration marked as ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Cancel / Delete registration
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [regs] = await db.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
    if (regs.length === 0) return res.status(404).json({ success: false, message: 'Registration not found' });
    const reg = regs[0];

    if (req.user.role !== 'admin' && reg.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await db.query('DELETE FROM registrations WHERE id = ?', [req.params.id]);
    await db.query('UPDATE events SET registered = GREATEST(registered - 1, 0) WHERE id = ?', [reg.event_id]);

    await createNotification(reg.user_id, {
      title: 'Registration Cancelled',
      message: `Your registration for ${reg.event_name} has been cancelled.`,
      type: 'warning',
      icon: '❌'
    });

    res.json({ success: true, message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
