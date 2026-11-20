const express = require('express');
const db = require('../config/db');
const { nextId, createNotification } = require('../config/helpers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ---------- VOLUNTEERS ----------
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM volunteers ORDER BY created_at DESC');
    res.json({ success: true, volunteers: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone = '', role = 'General Volunteer', userId = null } = req.body;
    const id = await nextId('volunteers', 'VOL', 3);
    await db.query(
      `INSERT INTO volunteers (id, user_id, name, email, phone, role, status, assigned_events)
       VALUES (?, ?, ?, ?, ?, ?, 'active', '[]')`,
      [id, userId, name, email, phone, role]
    );
    const [created] = await db.query('SELECT * FROM volunteers WHERE id = ?', [id]);
    res.status(201).json({ success: true, volunteer: created[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, role, status, assignedEvents } = req.body;
    await db.query(
      `UPDATE volunteers SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        role = COALESCE(?, role),
        status = COALESCE(?, status),
        assigned_events = COALESCE(?, assigned_events)
       WHERE id = ?`,
      [name, email, phone, role, status, assignedEvents ? JSON.stringify(assignedEvents) : null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM volunteers WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- VOLUNTEER CALLS ----------
router.get('/calls', authenticateToken, async (req, res) => {
  try {
    const [calls] = await db.query('SELECT * FROM volunteer_calls ORDER BY created_at DESC');
    res.json({ success: true, calls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/calls', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, role = 'General Volunteer', description = '', needed = 1, eventId = '', eventName = '', deadline = '' } = req.body;
    const id = await nextId('volunteer_calls', 'CALL', 3);
    await db.query(
      `INSERT INTO volunteer_calls (id, title, role, description, needed, event_id, event_name, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [id, title, role, description, Math.max(1, Number(needed) || 1), eventId, eventName, deadline]
    );

    const [users] = await db.query('SELECT id FROM users');
    for (const u of users) {
      await createNotification(u.id, {
        title: `Volunteers Needed: ${title}`,
        message: `We need ${needed} volunteer(s) (${role})${eventName ? ' for ' + eventName : ''}. Open the Volunteer page to sign up.`,
        type: 'info',
        icon: '🤝'
      });
    }

    const [created] = await db.query('SELECT * FROM volunteer_calls WHERE id = ?', [id]);
    res.status(201).json({ success: true, call: created[0], notified: users.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/calls/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM volunteer_calls WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- VOLUNTEER APPLICATIONS ----------
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await db.query('SELECT * FROM volunteer_applications ORDER BY created_at DESC');
      return res.json({ success: true, applications: rows });
    }
    const [rows] = await db.query('SELECT * FROM volunteer_applications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ success: true, applications: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/calls/:callId/apply', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const { phone = '', message = '', availability = '' } = req.body;

    const [calls] = await db.query('SELECT * FROM volunteer_calls WHERE id = ?', [callId]);
    if (calls.length === 0) return res.status(404).json({ success: false, message: 'Call not found' });
    const call = calls[0];
    if (call.status !== 'open') return res.status(400).json({ success: false, message: 'This call is no longer open' });

    const [dup] = await db.query(
      `SELECT id FROM volunteer_applications WHERE call_id = ? AND user_id = ? AND status != 'withdrawn'`,
      [callId, req.user.id]
    );
    if (dup.length > 0) return res.status(400).json({ success: false, message: 'You already applied for this' });

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    const id = await nextId('volunteer_applications', 'APP', 3);
    await db.query(
      `INSERT INTO volunteer_applications (id, call_id, call_title, user_id, user_name, email, phone, message, availability, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, call.id, call.title, user.id, user.name, user.email, phone || user.phone || '', message, availability]
    );

    await createNotification('ADMIN', {
      title: 'New Volunteer Application',
      message: `${user.name} offered to help: ${call.title}.`,
      type: 'info',
      icon: '🙋'
    });
    await createNotification(user.id, {
      title: 'Application Sent',
      message: `Your offer to volunteer for "${call.title}" was sent. The admin will review it.`,
      type: 'success',
      icon: '🙋'
    });

    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/applications/:id/review', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const [apps] = await db.query('SELECT * FROM volunteer_applications WHERE id = ?', [req.params.id]);
    if (apps.length === 0) return res.status(404).json({ success: false, message: 'Application not found' });
    const app = apps[0];

    const [calls] = await db.query('SELECT * FROM volunteer_calls WHERE id = ?', [app.call_id]);
    const call = calls[0];

    await db.query('UPDATE volunteer_applications SET status = ?, reviewed_at = NOW() WHERE id = ?', [status, app.id]);

    if (status === 'approved') {
      const [vols] = await db.query('SELECT * FROM volunteers WHERE user_id = ? OR LOWER(email) = LOWER(?)', [app.user_id, app.email]);
      if (vols.length === 0) {
        const volId = await nextId('volunteers', 'VOL', 3);
        const assigned = call && call.event_id ? JSON.stringify([call.event_id]) : '[]';
        await db.query(
          `INSERT INTO volunteers (id, user_id, name, email, phone, role, status, assigned_events)
           VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
          [volId, app.user_id, app.user_name, app.email, app.phone || '', call ? call.role : 'General Volunteer', assigned]
        );
      } else {
        await db.query('UPDATE volunteers SET user_id = ?, status = ? WHERE id = ?', [app.user_id, 'active', vols[0].id]);
      }
    }

    await createNotification(app.user_id, {
      title: status === 'approved' ? 'Volunteer Application Approved' : 'Volunteer Application Update',
      message: status === 'approved'
        ? `You are now a volunteer${call ? ' for "' + call.title + '"' : ''}. Check the Volunteer page for your tasks.`
        : `Your application${call ? ' for "' + call.title + '"' : ''} was not accepted this time.`,
      type: status === 'approved' ? 'success' : 'warning',
      icon: status === 'approved' ? '🤝' : 'ℹ️'
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- TASKS ----------
router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const [tasks] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/tasks', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description = '', volunteerId = '', assignee = '', eventId = '', eventName = '', priority = 'medium', dueDate = '' } = req.body;
    const id = await nextId('tasks', 'TSK', 3);
    const isOpen = !volunteerId && !assignee;

    await db.query(
      `INSERT INTO tasks (id, title, description, assignee, volunteer_id, is_open, event_id, event_name, status, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'todo', ?, ?)`,
      [id, title, description, assignee, volunteerId, isOpen, eventId, eventName, priority, dueDate]
    );

    const [created] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.status(201).json({ success: true, task: created[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/tasks/:id/claim', authenticateToken, async (req, res) => {
  try {
    const [vols] = await db.query('SELECT * FROM volunteers WHERE user_id = ?', [req.user.id]);
    if (vols.length === 0) return res.status(403).json({ success: false, message: 'Only approved volunteers can take tasks' });
    const vol = vols[0];

    const [tasks] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (tasks.length === 0 || !tasks[0].is_open || tasks[0].volunteer_id) {
      return res.status(400).json({ success: false, message: 'This task is no longer available' });
    }

    await db.query(
      'UPDATE tasks SET volunteer_id = ?, assignee = ?, is_open = FALSE, claimed_at = NOW() WHERE id = ?',
      [vol.id, vol.name, req.params.id]
    );

    await createNotification('ADMIN', {
      title: 'Task Taken',
      message: `${vol.name} took the task "${tasks[0].title}".`,
      type: 'info',
      icon: '📋'
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/tasks/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/tasks/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
