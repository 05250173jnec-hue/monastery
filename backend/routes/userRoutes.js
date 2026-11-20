const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { nextId } = require('../config/helpers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, monastery, role, photo, join_date FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update current user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, phone, monastery, photo } = req.body;
    await db.query(
      `UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        monastery = COALESCE(?, monastery),
        photo = COALESCE(?, photo)
       WHERE id = ?`,
      [name, phone, monastery, photo, req.user.id]
    );
    const [rows] = await db.query(
      'SELECT id, name, email, phone, monastery, role, photo, join_date FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all users
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, monastery, role, join_date FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Create user
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password = 'default123', phone = '', monastery = '', role = 'participant' } = req.body;
    const [dup] = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (dup.length > 0) return res.status(409).json({ success: false, message: 'Email already exists' });

    const id = await nextId('users', 'USR', 3);
    const hash = await bcrypt.hash(password, 10);
    const joinDate = new Date().toISOString().split('T')[0];

    await db.query(
      `INSERT INTO users (id, name, email, password_hash, phone, monastery, role, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email, hash, phone, monastery, role, joinDate]
    );

    res.status(201).json({ success: true, user: { id, name, email, phone, monastery, role, joinDate } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update user
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, monastery, role } = req.body;
    await db.query(
      `UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        monastery = COALESCE(?, monastery),
        role = COALESCE(?, role)
       WHERE id = ?`,
      [name, email, phone, monastery, role, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete user
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
