const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { nextId } = require('../config/helpers');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Monk / Participant Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone = '', monastery = '', role = 'participant' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const id = await nextId('users', 'MONK', 3);
    const passwordHash = await bcrypt.hash(password, 10);
    const joinDate = new Date().toISOString().split('T')[0];

    await db.query(
      `INSERT INTO users (id, name, email, password_hash, phone, monastery, role, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name.trim(), email.trim(), passwordHash, phone, monastery, role === 'monk' ? 'monk' : 'participant', joinDate]
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { id, name: name.trim(), email: email.trim(), phone, monastery, role, joinDate }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Monk / Participant Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [String(email || '').trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      monastery: user.monastery,
      role: user.role,
      photo: user.photo,
      joinDate: user.join_date
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM admins WHERE LOWER(email) = LOWER(?)', [String(email || '').trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const safeAdmin = { id: admin.id, name: admin.name, email: admin.email, role: 'admin' };
    const token = jwt.sign(safeAdmin, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({ success: true, token, user: safeAdmin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Change Password (Admin or User)
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const table = req.user.role === 'admin' ? 'admins' : 'users';
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Account not found' });

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query(`UPDATE ${table} SET password_hash = ? WHERE id = ?`, [newHash, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
