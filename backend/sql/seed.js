const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seed() {
  try {
    console.log('Seeding Monastery Event database (Admin default account only)...');

    const adminHash = await bcrypt.hash('admin123', 10);
    await db.query(
      `INSERT IGNORE INTO admins (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      ['ADM-001', 'Admin User', 'admin@monastery.bt', adminHash, 'admin']
    );

    await db.query(
      `INSERT IGNORE INTO events (id, name, type, description, date, time, location, organizer, capacity, registered, status, icon, color, requirements) VALUES
       ('EVT-001', 'Buddha Purnima Celebration', 'Religious Festival', 'Annual celebration of Lord Buddha\'s birth, enlightenment, and parinirvana. Includes prayers, offerings, and community meal.', '2026-05-30', '06:00 AM - 05:00 PM', 'Prayer Hall', 'Chief Abbot', 200, 0, 'upcoming', '🪷', 'gold', 'Traditional dress preferred. Bring your own prayer beads.'),
       ('EVT-002', 'Meditation Retreat', 'Wellness', 'A three-day silent meditation retreat focusing on mindfulness and breathing techniques. Open to all levels.', '2026-05-25', '05:00 AM - 08:00 PM', 'Retreat Center', 'Ven. Thubten', 60, 0, 'upcoming', '🧘', 'green', 'Bring comfortable clothing, sleeping bag, and toiletries.'),
       ('EVT-006', 'Guru Rinpoche Day', 'Prayer', 'Special prayers and offerings to Guru Rinpoche on the 10th day of the lunar month.', '2026-04-18', '05:30 AM - 12:00 PM', 'Prayer Hall', 'Ven. Sonam', 180, 180, 'completed', '🙏', 'gold', 'Completed event.')`
    );

    await db.query(
      `INSERT IGNORE INTO volunteer_calls (id, title, role, description, needed, event_id, event_name, deadline, status) VALUES
       ('CALL-001', 'Prayer hall decoration helpers', 'Decoration Team', 'Help set up flags, flowers and butter lamps before the celebration. No experience needed.', 5, 'EVT-001', 'Buddha Purnima Celebration', '', 'open')`
    );

    console.log('Seed completed successfully! Default Admin: admin@monastery.bt / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
