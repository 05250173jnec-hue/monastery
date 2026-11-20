const express = require('express');
const db = require('../config/db');
const { createNotification } = require('../config/helpers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get my notifications (Admin gets 'ADMIN' notifications; Users get their user_id notifications)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const targetId = req.user.role === 'admin' ? 'ADMIN' : req.user.id;
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [targetId]
    );
    res.json({ success: true, notifications: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark single notification read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark all read
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    const targetId = req.user.role === 'admin' ? 'ADMIN' : req.user.id;
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [targetId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin send/broadcast notification
router.post('/send', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, title, message, type = 'info', icon = '🔔' } = req.body;
    if (userId && userId !== 'ALL') {
      await createNotification(userId, { title, message, type, icon });
      return res.json({ success: true, count: 1 });
    }

    const [users] = await db.query('SELECT id FROM users');
    for (const u of users) {
      await createNotification(u.id, { title, message, type, icon });
    }
    res.json({ success: true, count: users.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
