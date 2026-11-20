/* ============================================
   MONK / PARTICIPANT DATA LAYER
   Simulates backend with localStorage
   ============================================ */

const MonkDB = {
  // ---------- Keys ----------
  KEYS: {
    CURRENT_USER: 'monk_current_user',
    USERS: 'monk_users',
    EVENTS: 'monk_events',
    REGISTRATIONS: 'monk_registrations',
    NOTIFICATIONS: 'monk_notifications',
    DONATIONS: 'admin_donations',   // shared with AdminDB
    VOLUNTEERS: 'admin_volunteers', // shared with AdminDB
    TASKS: 'admin_tasks',
    CALLS: 'admin_volunteer_calls',
    APPLICATIONS: 'admin_volunteer_apps'
  },

  // One-time cleanup: only "upcoming" and "completed" events are kept
  removePlannedEvents() {
    if (localStorage.getItem('monk_planned_removed')) return;
    const events = JSON.parse(localStorage.getItem(this.KEYS.EVENTS) || '[]');
    const removed = events.filter(e => e.status === 'planned').map(e => e.id);
    if (removed.length) {
      localStorage.setItem(this.KEYS.EVENTS, JSON.stringify(events.filter(e => e.status !== 'planned')));
      const regs = JSON.parse(localStorage.getItem(this.KEYS.REGISTRATIONS) || '[]');
      localStorage.setItem(this.KEYS.REGISTRATIONS, JSON.stringify(regs.filter(r => !removed.includes(r.eventId))));
    }
    localStorage.setItem('monk_planned_removed', '1');
  },

  // ---------- Seed Data ----------
  seedData() {
    // Users (Monks/Participants)
    if (!localStorage.getItem(this.KEYS.USERS)) {
      const users = [
        {
          id: 'MONK-001',
          name: 'Karma Dorji',
          email: 'monk@monastery.bt',
          password: 'monk123',
          phone: '+975 17123456',
          monastery: 'Tashichho Dzong',
          role: 'monk',
          joinDate: '2024-01-15'
        },
        {
          id: 'MONK-002',
          name: 'Pema Wangmo',
          email: 'pema@monastery.bt',
          password: 'pema123',
          phone: '+975 17654321',
          monastery: 'Punakha Dzong',
          role: 'participant',
          joinDate: '2024-02-20'
        }
      ];
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    }

    // Make sure these accounts always exist, even if USERS was created earlier
    // (browser storage is per address/port, so accounts can "disappear" when the
    // site is opened from a different URL).
    {
      const users = JSON.parse(localStorage.getItem(this.KEYS.USERS) || '[]');
      const required = [
        { id: 'MONK-003', name: 'Student 05250173', email: '05250173.jnec@rub.edu.bt', password: 'baka@123',
          phone: '', monastery: '', role: 'participant', joinDate: '2026-11-19' }
      ];
      let changed = false;
      required.forEach(r => {
        if (!users.some(u => (u.email || '').toLowerCase() === r.email.toLowerCase())) {
          if (users.some(u => u.id === r.id)) r.id = 'MONK-' + String(users.length + 1).padStart(3, '0');
          users.push(r); changed = true;
        }
      });
      if (changed) localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    }

    // Events
    if (!localStorage.getItem(this.KEYS.EVENTS)) {
      const events = [
        {
          id: 'EVT-001',
          name: 'Buddha Purnima Celebration',
          type: 'Religious Festival',
          description: 'Annual celebration of Lord Buddha\'s birth, enlightenment, and parinirvana. Includes prayers, offerings, and community meal.',
          date: '2026-05-30',
          time: '06:00 AM - 05:00 PM',
          location: 'Prayer Hall',
          organizer: 'Chief Abbot',
          capacity: 200,
          registered: 156,
          status: 'upcoming',
          icon: '🪷',
          color: 'gold',
          requirements: 'Traditional dress preferred. Bring your own prayer beads.'
        },
        {
          id: 'EVT-002',
          name: 'Meditation Retreat',
          type: 'Wellness',
          description: 'A three-day silent meditation retreat focusing on mindfulness and breathing techniques. Open to all levels.',
          date: '2026-05-25',
          time: '05:00 AM - 08:00 PM',
          location: 'Retreat Center',
          organizer: 'Ven. Thubten',
          capacity: 60,
          registered: 42,
          status: 'upcoming',
          icon: '🧘',
          color: 'green',
          requirements: 'Bring comfortable clothing, sleeping bag, and toiletries.'
        },
        {
          id: 'EVT-006',
          name: 'Guru Rinpoche Day',
          type: 'Prayer',
          description: 'Special prayers and offerings to Guru Rinpoche on the 10th day of the lunar month.',
          date: '2026-04-18',
          time: '05:30 AM - 12:00 PM',
          location: 'Prayer Hall',
          organizer: 'Ven. Sonam',
          capacity: 180,
          registered: 180,
          status: 'completed',
          icon: '🙏',
          color: 'gold',
          requirements: 'Completed event.'
        }
      ];
      localStorage.setItem(this.KEYS.EVENTS, JSON.stringify(events));
    }

    // Registrations
    if (!localStorage.getItem(this.KEYS.REGISTRATIONS)) {
      const regs = [
        {
          id: 'REG-1001',
          eventId: 'EVT-001',
          userId: 'MONK-001',
          userName: 'Karma Dorji',
          userEmail: 'monk@monastery.bt',
          eventName: 'Buddha Purnima Celebration',
          eventDate: '2026-05-30',
          eventLocation: 'Prayer Hall',
          status: 'confirmed',
          registeredAt: '2026-05-01T10:30:00',
          notes: ''
        },
        {
          id: 'REG-1002',
          eventId: 'EVT-002',
          userId: 'MONK-001',
          userName: 'Karma Dorji',
          userEmail: 'monk@monastery.bt',
          eventName: 'Meditation Retreat',
          eventDate: '2026-05-25',
          eventLocation: 'Retreat Center',
          status: 'pending',
          registeredAt: '2026-05-10T14:15:00',
          notes: 'First time attending retreat.'
        }
      ];
      localStorage.setItem(this.KEYS.REGISTRATIONS, JSON.stringify(regs));
    }

    // Donations (same sample data as AdminDB, so whichever side loads first keeps it)
    if (!localStorage.getItem(this.KEYS.DONATIONS)) {
      const donations = [
        { id: 'DON-001', donor: 'Baka', email: 'baka@gmail.com', amount: 7000, eventId: 'EVT-001', eventName: 'Buddha Purnima Celebration', method: 'Bank Transfer', date: '2026-05-20' },
        { id: 'DON-002', donor: 'Baku', email: 'baku@gmail.com', amount: 5000, eventId: 'EVT-002', eventName: 'Meditation Retreat', method: 'Cash', date: '2026-05-25' },
        { id: 'DON-003', donor: 'Rubi', email: 'rubi@gmail.com', amount: 3000, eventId: 'EVT-003', eventName: 'Zhabsdrung Kuchoe', method: 'Cheque', date: '2026-05-25' },
        { id: 'DON-004', donor: 'Naku', email: 'naku@gmail.com', amount: 2000, eventId: 'EVT-001', eventName: 'Buddha Purnima Celebration', method: 'Online', date: '2026-05-25' },
        { id: 'DON-005', donor: 'Sonam', email: 'sonam@gmail.com', amount: 4500, eventId: 'EVT-002', eventName: 'Meditation Retreat', method: 'Bank Transfer', date: '2026-05-22' }
      ];
      localStorage.setItem(this.KEYS.DONATIONS, JSON.stringify(donations));
    }

    // Sample volunteer call (so the feature is visible on first run)
    if (!localStorage.getItem(this.KEYS.CALLS)) {
      localStorage.setItem(this.KEYS.CALLS, JSON.stringify([
        { id: 'CALL-001', title: 'Prayer hall decoration helpers', role: 'Decoration Team', description: 'Help set up flags, flowers and butter lamps before the celebration. No experience needed.', needed: 5, eventId: 'EVT-001', eventName: 'Buddha Purnima Celebration', deadline: '', status: 'open', createdAt: '2026-05-01T09:00:00' }
      ]));
    }

    // Notifications
    if (!localStorage.getItem(this.KEYS.NOTIFICATIONS)) {
      const notifs = [
        {
          id: 'NOT-001',
          userId: 'MONK-001',
          title: 'Registration Confirmed',
          message: 'Your registration for Buddha Purnima Celebration has been confirmed.',
          type: 'success',
          icon: '✅',
          read: false,
          date: '2026-05-01T10:35:00'
        },
        {
          id: 'NOT-002',
          userId: 'MONK-001',
          title: 'New Event Announced',
          message: 'Dharma Teachings by Khenpo Rinpoche on June 10th. Registration now open.',
          type: 'info',
          icon: '📿',
          read: false,
          date: '2026-05-12T09:00:00'
        },
        {
          id: 'NOT-003',
          userId: 'MONK-001',
          title: 'Reminder: Meditation Retreat',
          message: 'Your meditation retreat starts in 3 days. Please confirm your attendance.',
          type: 'warning',
          icon: '⏰',
          read: false,
          date: '2026-05-22T08:00:00'
        },
        {
          id: 'NOT-004',
          userId: 'MONK-001',
          title: 'Registration Update',
          message: 'Your registration for Meditation Retreat is pending approval.',
          type: 'info',
          icon: '⏳',
          read: true,
          date: '2026-05-10T14:20:00'
        },
        {
          id: 'NOT-005',
          userId: 'MONK-001',
          title: 'Welcome to Monastery Portal',
          message: 'Thank you for joining our community event management system.',
          type: 'success',
          icon: '🎉',
          read: true,
          date: '2026-01-15T09:00:00'
        }
      ];
      localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }
  },


  // ---------- Volunteering ----------
  _vget(key) { return JSON.parse(localStorage.getItem(key) || '[]'); },
  _vset(key, v) { localStorage.setItem(key, JSON.stringify(v)); },

  // ---------- Volunteer calls (what the monastery needs) ----------
  getCalls() {
    return JSON.parse(localStorage.getItem(this.KEYS.CALLS) || '[]');
  },

  getApplications(callId) {
    const all = JSON.parse(localStorage.getItem(this.KEYS.APPLICATIONS) || '[]');
    return callId ? all.filter(a => a.callId === callId) : all;
  },

  // open = admin has not closed it, deadline not passed, and not yet full
  callStats(call) {
    const apps = this.getApplications(call.id);
    const approved = apps.filter(a => a.status === 'approved').length;
    const pending = apps.filter(a => a.status === 'pending').length;
    const today = new Date().toISOString().slice(0, 10);
    const expired = !!call.deadline && call.deadline < today;
    const filled = approved >= Number(call.needed || 0);
    const open = call.status === 'open' && !expired && !filled;
    return { approved, pending, total: apps.length, expired, filled, open };
  },

  _nextId(prefix, list) {
    const n = list.reduce((m, x) => Math.max(m, parseInt(String(x.id).replace(/\D/g, ''), 10) || 0), 0);
    return prefix + '-' + String(n + 1).padStart(3, '0');
  },

  // Older tasks only stored the assignee's name. Link each to the (first) volunteer
  // with that exact name once, so ownership is by id from then on.
  linkLegacyTasks() {
    const tasks = JSON.parse(localStorage.getItem('admin_tasks') || '[]');
    const vols = JSON.parse(localStorage.getItem('admin_volunteers') || '[]');
    let changed = false;
    tasks.forEach(t => {
      if (t.volunteerId === undefined && t.assignee) {
        const v = vols.find(x => x.name === t.assignee);
        t.volunteerId = v ? v.id : '';
        changed = true;
      } else if (t.volunteerId === undefined) { t.volunteerId = ''; changed = true; }
    });
    if (changed) localStorage.setItem('admin_tasks', JSON.stringify(tasks));
  },

  getMyVolunteer(user) {
    const em = (user.email || '').toLowerCase();
    return this._vget(this.KEYS.VOLUNTEERS).find(v => v.userId === user.id || (v.email || '').toLowerCase() === em) || null;
  },

  getMyApplications(userId) {
    return this.getApplications().filter(a => a.userId === userId)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  },

  applyToCall(userId, callId, data) {
    const user = this.getUsers().find(u => u.id === userId);
    const call = this.getCalls().find(c => c.id === callId);
    if (!user || !call) return { success: false, message: 'Call not found' };
    if (!this.callStats(call).open) return { success: false, message: 'This call is no longer open' };
    const apps = this.getApplications();
    if (apps.some(a => a.callId === callId && a.userId === userId && a.status !== 'withdrawn')) return { success: false, message: 'You already applied for this' };
    const app = {
      id: this._nextId('APP', apps), callId, callTitle: call.title,
      userId, userName: user.name, email: user.email,
      phone: (data.phone || user.phone || '').trim(),
      message: (data.message || '').trim(), availability: (data.availability || '').trim(),
      status: 'pending', createdAt: new Date().toISOString()
    };
    apps.push(app);
    this._vset(this.KEYS.APPLICATIONS, apps);
    this.addNotification('ADMIN', { title: 'New Volunteer Application', message: `${user.name} offered to help: ${call.title}.`, type: 'info', icon: '🙋' });
    this.addNotification(userId, { title: 'Application Sent', message: `Your offer to volunteer for "${call.title}" was sent. The admin will review it.`, type: 'success', icon: '🙋' });
    return { success: true, application: app };
  },

  withdrawApplication(appId, userId) {
    const apps = this.getApplications();
    const i = apps.findIndex(a => a.id === appId && a.userId === userId && a.status === 'pending');
    if (i === -1) return { success: false };
    apps.splice(i, 1);
    this._vset(this.KEYS.APPLICATIONS, apps);
    return { success: true };
  },

  taskBelongsTo(t, vol) { return t.volunteerId === vol.id; },

  getMyTasks(vol) { return this._vget(this.KEYS.TASKS).filter(t => this.taskBelongsTo(t, vol)); },

  getOpenTasks() { return this._vget(this.KEYS.TASKS).filter(t => t.open && !t.volunteerId && t.status !== 'done'); },

  claimTask(userId, taskId) {
    const user = this.getUsers().find(u => u.id === userId);
    const vol = user && this.getMyVolunteer(user);
    if (!vol) return { success: false, message: 'Only approved volunteers can take tasks' };
    const tasks = this._vget(this.KEYS.TASKS);
    const t = tasks.find(x => x.id === taskId);
    if (!t || !t.open || t.volunteerId) return { success: false, message: 'This task was already taken' };
    t.volunteerId = vol.id; t.assignee = vol.name; t.open = false; t.claimedAt = new Date().toISOString();
    this._vset(this.KEYS.TASKS, tasks);
    this.addNotification('ADMIN', { title: 'Task Taken', message: `${vol.name} took the task "${t.title}".`, type: 'info', icon: '📋' });
    return { success: true };
  },

  setMyTaskStatus(userId, taskId, status) {
    if (!['todo', 'in-progress', 'done'].includes(status)) return { success: false };
    const user = this.getUsers().find(u => u.id === userId);
    const vol = user && this.getMyVolunteer(user);
    const tasks = this._vget(this.KEYS.TASKS);
    const t = tasks.find(x => x.id === taskId);
    if (!vol || !t || !this.taskBelongsTo(t, vol)) return { success: false, message: 'Not your task' };
    t.status = status;
    this._vset(this.KEYS.TASKS, tasks);
    if (status === 'done') this.addNotification('ADMIN', { title: 'Task Completed', message: `${vol.name} completed "${t.title}".`, type: 'success', icon: '✅' });
    return { success: true };
  },

  // ---------- Donations ----------
  // Two types: 'money' (cash/online gift) and 'product' (goods/in-kind).
  // Donations are NOT tied to an event or a date window - open any time.
  getDonations() {
    return JSON.parse(localStorage.getItem(this.KEYS.DONATIONS) || '[]');
  },

  getMyDonations(userId) {
    return this.getDonations()
      .filter(d => d.userId === userId)
      .sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date));
  },

  addDonation(userId, data) {
    const user = this.getUsers().find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found' };

    const type = data.type === 'product' ? 'product' : 'money';
    if (type === 'money') {
      if (!(Number(data.amount) > 0)) return { success: false, message: 'Please enter a valid amount' };
      if (data.method === 'QR Scan' && !(data.txnId || '').trim()) return { success: false, message: 'Please enter the transaction / journal number from your payment' };
    } else {
      if (!data.productName || !data.productName.trim()) return { success: false, message: 'Please enter the product name' };
      if (!(Number(data.quantity) > 0)) return { success: false, message: 'Please enter a valid quantity' };
    }

    const event = data.eventId ? this.getEventById(data.eventId) : null;
    const donations = this.getDonations();
    const maxN = donations.reduce((m, d) => Math.max(m, parseInt(String(d.id).replace(/\D/g, ''), 10) || 0), 0);
    const now = new Date();
    const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    const don = {
      id: 'DON-' + String(maxN + 1).padStart(3, '0'),
      type,
      userId,
      donor: user.name,
      email: user.email,
      amount: type === 'money' ? Number(data.amount) : 0,
      method: type === 'money' ? (data.method || 'QR Scan') : (data.handover || 'Drop-off'),
      txnId: type === 'money' ? (data.txnId || '').trim() : '',
      productName: type === 'product' ? data.productName.trim() : '',
      category: type === 'product' ? (data.category || 'Other') : '',
      quantity: type === 'product' ? Number(data.quantity) : 0,
      unit: type === 'product' ? (data.unit || 'pcs') : '',
      estValue: type === 'product' ? Number(data.estValue || 0) : 0,
      pickupAddress: type === 'product' && data.handover === 'Pickup' ? (data.pickupAddress || '') : '',
      description: (data.description || '').trim(),
      eventId: data.eventId || '',
      eventName: event ? event.name : 'General Donation',
      status: 'pending',   // admin confirms after checking the bank/QR payment (money) or receiving the goods (product)
      date: today,
      createdAt: now.toISOString()
    };
    donations.push(don);
    localStorage.setItem(this.KEYS.DONATIONS, JSON.stringify(donations));

    const what = type === 'money' ? 'Nu ' + don.amount.toLocaleString('en-US') : `${don.quantity} ${don.unit} of ${don.productName}`;
    this.addNotification(userId, {
      title: 'Thank You for Your Donation',
      message: type === 'money'
        ? `Your donation of ${what} was submitted${don.txnId ? ' (Ref ' + don.txnId + ')' : ''}. The monastery will confirm it once the payment is verified. Thank you!`
        : `Your product donation (${what}) has been submitted. The monastery will contact you to confirm ${don.method === 'Pickup' ? 'the pickup' : 'the drop-off'}.`,
      type: 'success',
      icon: '💝'
    });
    this.addNotification('ADMIN', {
      title: type === 'money' ? 'New Donation' : 'New Product Donation',
      message: `${user.name} donated ${what}.`,
      type: 'info',
      icon: type === 'money' ? '💰' : '🎁'
    });
    return { success: true, donation: don };
  },

  // ---------- Auth ----------
  login(email, password) {
    const users = this.getUsers();
    const em = String(email).trim().toLowerCase();
    const user = users.find(u => (u.email || '').toLowerCase() === em && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }
    return { success: false, message: 'Invalid email or password' };
  },

  logout() {
    localStorage.removeItem(this.KEYS.CURRENT_USER);
    window.location.href = '../index.html';
  },

  getCurrentUser() {
    const user = localStorage.getItem(this.KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'monk-login.html';
      return false;
    }
    return true;
  },

  // ---------- Users ----------
  getUsers() {
    return JSON.parse(localStorage.getItem(this.KEYS.USERS) || '[]');
  },

  updateUser(userId, updates) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
      const { password: _, ...safeUser } = users[idx];
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(safeUser));
      return safeUser;
    }
    return null;
  },

  // ---------- Events ----------
  getEvents() {
    return JSON.parse(localStorage.getItem(this.KEYS.EVENTS) || '[]');
  },

  getEventById(id) {
    return this.getEvents().find(e => e.id === id);
  },

  getUpcomingEvents(limit = 6) {
    return this.getEvents()
      .filter(e => e.status === 'upcoming')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, limit);
  },

  searchEvents(query) {
    const q = query.toLowerCase();
    return this.getEvents().filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    );
  },

  // ---------- Registrations ----------
  getRegistrations() {
    return JSON.parse(localStorage.getItem(this.KEYS.REGISTRATIONS) || '[]');
  },

  getMyRegistrations(userId) {
    return this.getRegistrations().filter(r => r.userId === userId);
  },

  getRegistrationForEvent(userId, eventId) {
    return this.getRegistrations().find(r => r.userId === userId && r.eventId === eventId);
  },

  registerForEvent(userId, eventId, notes = '') {
    const event = this.getEventById(eventId);
    if (!event) return { success: false, message: 'Event not found' };

    const existing = this.getRegistrationForEvent(userId, eventId);
    if (existing) {
      return { success: false, message: 'You are already registered for this event' };
    }

    const user = this.getUsers().find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found' };

    const regs = this.getRegistrations();
    const newReg = {
      id: 'REG-' + (1000 + regs.length + 1),
      eventId,
      userId,
      userName: user.name,
      userEmail: user.email,
      eventName: event.name,
      eventDate: event.date,
      eventLocation: event.location,
      status: 'pending',
      registeredAt: new Date().toISOString(),
      notes
    };
    regs.push(newReg);
    localStorage.setItem(this.KEYS.REGISTRATIONS, JSON.stringify(regs));

    // Update event registered count
    const events = this.getEvents();
    const evIdx = events.findIndex(e => e.id === eventId);
    if (evIdx !== -1) {
      events[evIdx].registered = (events[evIdx].registered || 0) + 1;
      localStorage.setItem(this.KEYS.EVENTS, JSON.stringify(events));
    }

    // Add notification
    this.addNotification(userId, {
      title: 'Registered Successfully',
      message: `You have registered for ${event.name}. The admin will review and confirm your registration.`,
      type: 'success',
      icon: '✅'
    });

    // Alert the admin about the new registration
    this.addNotification('ADMIN', {
      title: 'New Registration',
      message: `${user.name} registered for ${event.name}.`,
      type: 'info',
      icon: '📝'
    });

    return { success: true, registration: newReg };
  },

  cancelRegistration(regId) {
    let regs = this.getRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (!reg) return { success: false, message: 'Registration not found' };

    regs = regs.filter(r => r.id !== regId);
    localStorage.setItem(this.KEYS.REGISTRATIONS, JSON.stringify(regs));

    // Update event count
    const events = this.getEvents();
    const evIdx = events.findIndex(e => e.id === reg.eventId);
    if (evIdx !== -1 && events[evIdx].registered > 0) {
      events[evIdx].registered -= 1;
      localStorage.setItem(this.KEYS.EVENTS, JSON.stringify(events));
    }

    this.addNotification(reg.userId, {
      title: 'Registration Cancelled',
      message: `Your registration for ${reg.eventName} has been cancelled.`,
      type: 'warning',
      icon: '❌'
    });

    return { success: true };
  },

  // ---------- Notifications ----------
  getNotifications() {
    return JSON.parse(localStorage.getItem(this.KEYS.NOTIFICATIONS) || '[]');
  },

  getMyNotifications(userId) {
    return this.getNotifications()
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getUnreadCount(userId) {
    return this.getMyNotifications(userId).filter(n => !n.read).length;
  },

  addNotification(userId, data) {
    const notifs = this.getNotifications();
    notifs.push({
      id: 'NOT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      userId,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      icon: data.icon || '🔔',
      read: false,
      date: new Date().toISOString()
    });
    localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  markNotificationRead(notifId) {
    const notifs = this.getNotifications();
    const idx = notifs.findIndex(n => n.id === notifId);
    if (idx !== -1) {
      notifs[idx].read = true;
      localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }
  },

  markAllNotificationsRead(userId) {
    const notifs = this.getNotifications().map(n =>
      n.userId === userId ? { ...n, read: true } : n
    );
    localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  // ---------- Helpers ----------
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  formatTime(isoStr) {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  getDayMonth(dateStr) {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    };
  }
};

// Initialize
MonkDB.seedData();
MonkDB.linkLegacyTasks();
MonkDB.removePlannedEvents();