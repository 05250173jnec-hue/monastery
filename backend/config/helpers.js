const db = require('./db');

async function nextId(table, prefix, pad = 3) {
  const [rows] = await db.query(`SELECT id FROM ${table}`);
  const maxN = rows.reduce((m, r) => {
    const num = parseInt(String(r.id).replace(/\D/g, ''), 10) || 0;
    return Math.max(m, num);
  }, 0);
  return `${prefix}-${String(maxN + 1).padStart(pad, '0')}`;
}

async function createNotification(userId, { title, message, type = 'info', icon = '🔔' }) {
  const id = 'NOT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  await db.query(
    `INSERT INTO notifications (id, user_id, title, message, type, icon, is_read) VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
    [id, userId, title, message, type, icon]
  );
  return id;
}

module.exports = { nextId, createNotification };
