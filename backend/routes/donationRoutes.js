const express = require('express');
const db = require('../config/db');
const { nextId, createNotification } = require('../config/helpers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get donations (Admin gets all; User gets their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await db.query('SELECT * FROM donations ORDER BY created_at DESC');
      return res.json({ success: true, donations: rows });
    }
    const [rows] = await db.query('SELECT * FROM donations WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ success: true, donations: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create donation (Money or Product)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      type = 'money', amount = 0, method = 'QR Scan', txnId = '',
      productName = '', category = 'Other', quantity = 0, unit = 'pcs',
      estValue = 0, handover = 'Drop-off', pickupAddress = '',
      description = '', eventId = '', donor: bodyDonor, email: bodyEmail
    } = req.body;

    let donorName = bodyDonor || '';
    let donorEmail = bodyEmail || '';
    let userId = '';

    if (req.user.role !== 'admin') {
      const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
      if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
      userId = users[0].id;
      donorName = users[0].name;
      donorEmail = users[0].email;
    }

    if (type === 'money' && !(Number(amount) > 0)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid amount' });
    }
    if (type === 'product' && (!productName.trim() || !(Number(quantity) > 0))) {
      return res.status(400).json({ success: false, message: 'Product name and quantity are required' });
    }

    let eventName = 'General Donation';
    if (eventId) {
      const [evs] = await db.query('SELECT name FROM events WHERE id = ?', [eventId]);
      if (evs.length > 0) eventName = evs[0].name;
    }

    const id = await nextId('donations', 'DON', 3);
    const today = new Date().toISOString().split('T')[0];
    const status = req.user.role === 'admin' ? 'received' : 'pending';

    await db.query(
      `INSERT INTO donations (
        id, type, user_id, donor, email, amount, method, txn_id,
        product_name, category, quantity, unit, est_value, pickup_address,
        description, event_id, event_name, status, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, type, userId, donorName, donorEmail,
        type === 'money' ? Number(amount) : 0,
        type === 'money' ? method : handover,
        type === 'money' ? txnId.trim() : '',
        type === 'product' ? productName.trim() : '',
        type === 'product' ? category : '',
        type === 'product' ? Number(quantity) : 0,
        type === 'product' ? unit : '',
        type === 'product' ? Number(estValue) : 0,
        type === 'product' && handover === 'Pickup' ? pickupAddress : '',
        description.trim(),
        eventId || '',
        eventName,
        status,
        today
      ]
    );

    if (userId) {
      const what = type === 'money' ? `Nu ${Number(amount).toLocaleString('en-US')}` : `${quantity} ${unit} of ${productName}`;
      await createNotification(userId, {
        title: 'Thank You for Your Donation',
        message: `Your donation of ${what} was submitted. The monastery will confirm it shortly.`,
        type: 'success',
        icon: '💝'
      });
      await createNotification('ADMIN', {
        title: type === 'money' ? 'New Donation' : 'New Product Donation',
        message: `${donorName} donated ${what}.`,
        type: 'info',
        icon: type === 'money' ? '💰' : '🎁'
      });
    }

    const [created] = await db.query('SELECT * FROM donations WHERE id = ?', [id]);
    res.status(201).json({ success: true, donation: created[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify or decline donation (Admin)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'received', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [rows] = await db.query('SELECT * FROM donations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Donation not found' });
    const d = rows[0];

    await db.query('UPDATE donations SET status = ? WHERE id = ?', [status, d.id]);

    if (d.user_id) {
      const what = d.type === 'product' ? `${d.quantity} ${d.unit} ${d.product_name}` : `Nu ${Number(d.amount).toLocaleString('en-US')}`;
      await createNotification(d.user_id, {
        title: status === 'received' ? 'Donation Received' : 'Donation Update',
        message: status === 'received'
          ? `The monastery has received your donation of ${what}. Thank you, may you be blessed!`
          : `Your donation (${what}) could not be confirmed. Please contact the monastery office.`,
        type: status === 'received' ? 'success' : 'warning',
        icon: status === 'received' ? '🙏' : 'ℹ️'
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM donations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
