const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin Dashboard & Reports Summary
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [[{ totalEvents }]] = await db.query('SELECT COUNT(*) AS totalEvents FROM events');
    const [[{ upcomingEvents }]] = await db.query("SELECT COUNT(*) AS upcomingEvents FROM events WHERE status = 'upcoming'");
    const [[{ totalRegistrations }]] = await db.query('SELECT COUNT(*) AS totalRegistrations FROM registrations');
    const [[{ pendingRegistrations }]] = await db.query("SELECT COUNT(*) AS pendingRegistrations FROM registrations WHERE status = 'pending'");
    const [[{ confirmedRegistrations }]] = await db.query("SELECT COUNT(*) AS confirmedRegistrations FROM registrations WHERE status = 'confirmed'");
    const [[{ pendingApplications }]] = await db.query("SELECT COUNT(*) AS pendingApplications FROM volunteer_applications WHERE status = 'pending'");
    const [[{ totalVolunteers }]] = await db.query('SELECT COUNT(*) AS totalVolunteers FROM volunteers');
    const [[{ activeVolunteers }]] = await db.query("SELECT COUNT(*) AS activeVolunteers FROM volunteers WHERE status = 'active'");
    const [[{ totalDonations }]] = await db.query("SELECT COALESCE(SUM(amount), 0) AS totalDonations FROM donations WHERE status = 'received'");
    const [[{ totalDonors }]] = await db.query('SELECT COUNT(DISTINCT email) AS totalDonors FROM donations');
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');

    res.json({
      success: true,
      stats: {
        totalEvents,
        upcomingEvents,
        totalRegistrations,
        pendingRegistrations,
        confirmedRegistrations,
        pendingApplications,
        totalVolunteers,
        activeVolunteers,
        totalDonations: Number(totalDonations),
        totalDonors,
        totalUsers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Settings
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
    res.json({ success: true, settings: rows[0] || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Settings
router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const s = req.body;
    await db.query(
      `UPDATE settings SET
        org_name = COALESCE(?, org_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        location = COALESCE(?, location),
        website = COALESCE(?, website),
        email_notifications = COALESCE(?, email_notifications),
        new_registrations = COALESCE(?, new_registrations),
        donation_alerts = COALESCE(?, donation_alerts),
        task_reminders = COALESCE(?, task_reminders),
        system_updates = COALESCE(?, system_updates),
        two_factor = COALESCE(?, two_factor)
       WHERE id = 1`,
      [
        s.orgName, s.email, s.phone, s.location, s.website,
        s.emailNotifications, s.newRegistrations, s.donationAlerts,
        s.taskReminders, s.systemUpdates, s.twoFactor
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
