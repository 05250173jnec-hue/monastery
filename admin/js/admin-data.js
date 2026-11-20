/* ============================================
   ADMIN DATA LAYER
   Shares the same localStorage keys as MonkDB
   ============================================ */

const AdminDB = {
  KEYS: {
    ADMIN_USER: 'admin_current_user',
    ADMINS: 'admin_users',
    USERS: 'monk_users',        // shared with MonkDB
    EVENTS: 'monk_events',      // shared with MonkDB
    REGISTRATIONS: 'monk_registrations', // shared
    NOTIFICATIONS: 'monk_notifications', // shared
    VOLUNTEERS: 'admin_volunteers',
    TASKS: 'admin_tasks',
    DONATIONS: 'admin_donations',
    CALLS: 'admin_volunteer_calls',
    APPLICATIONS: 'admin_volunteer_apps',
    SETTINGS: 'admin_settings'
  },

  // ---------- Seed ----------
  seedData() {
    // Admin users
    if (!localStorage.getItem(this.KEYS.ADMINS)) {
      const admins = [
        {
          id: 'ADM-001',
          name: 'Admin User',
          email: 'admin@monastery.bt',
          password: 'admin123',
          role: 'admin'
        }
      ];
      localStorage.setItem(this.KEYS.ADMINS, JSON.stringify(admins));
    }

    // Ensure shared data exists (call MonkDB seed if missing)
    if (typeof MonkDB !== 'undefined') MonkDB.seedData();

    // Volunteers
    if (!localStorage.getItem(this.KEYS.VOLUNTEERS)) {
      const vols = [
        { id: 'VOL-001', name: 'Karma Dorji', email: 'karma@monastery.bt', phone: '+975 17111111', role: 'Event Coordinator', status: 'active', assignedEvents: ['EVT-001','EVT-002'] },
        { id: 'VOL-002', name: 'Pema Wangmo', email: 'pema@monastery.bt', phone: '+975 17222222', role: 'Logistics Lead', status: 'active', assignedEvents: ['EVT-001'] },
        { id: 'VOL-003', name: 'Tshering Lhamo', email: 'tshering@monastery.bt', phone: '+975 17333333', role: 'Catering Team', status: 'on-leave', assignedEvents: ['EVT-002'] },
        { id: 'VOL-004', name: 'Sonam Tobgay', email: 'sonam@monastery.bt', phone: '+975 17444444', role: 'Decoration Team', status: 'active', assignedEvents: ['EVT-003'] },
        { id: 'VOL-005', name: 'Dawa Zangmo', email: 'dawa@monastery.bt', phone: '+975 17555555', role: 'Security Team', status: 'active', assignedEvents: ['EVT-001','EVT-003'] }
      ];
      localStorage.setItem(this.KEYS.VOLUNTEERS, JSON.stringify(vols));
    }

    // Tasks
    if (!localStorage.getItem(this.KEYS.TASKS)) {
      const tasks = [
        { id: 'TSK-001', title: 'Set up prayer hall decorations', assignee: 'Karma Dorji', eventId: 'EVT-001', eventName: 'Buddha Purnima Celebration', status: 'todo', priority: 'high', dueDate: '2026-05-28' },
        { id: 'TSK-002', title: 'Arrange catering for 200 guests', assignee: 'Tshering Lhamo', eventId: 'EVT-001', eventName: 'Buddha Purnima Celebration', status: 'in-progress', priority: 'high', dueDate: '2026-05-29' },
        { id: 'TSK-003', title: 'Print event banners & programs', assignee: 'Pema Wangmo', eventId: 'EVT-001', eventName: 'Buddha Purnima Celebration', status: 'in-progress', priority: 'medium', dueDate: '2026-05-27' },
        { id: 'TSK-004', title: 'Coordinate transport logistics', assignee: 'Sonam Tobgay', eventId: 'EVT-002', eventName: 'Meditation Retreat', status: 'todo', priority: 'medium', dueDate: '2026-05-23' },
        { id: 'TSK-005', title: 'Send event invitations', assignee: 'Dawa Zangmo', eventId: 'EVT-001', eventName: 'Buddha Purnima Celebration', status: 'done', priority: 'high', dueDate: '2026-05-20' }
      ];
      localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
    }

    // Donations
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

    // Settings
    if (!localStorage.getItem(this.KEYS.SETTINGS)) {
      const settings = {
        orgName: 'Monastery of Bhutan',
        email: 'admin@monastery.bt',
        phone: '+975 2 123456',
        location: 'Thimphu, Bhutan',
        website: 'https://monastery.bt',
        emailNotifications: true,
        newRegistrations: true,
        donationAlerts: true,
        taskReminders: false,
        systemUpdates: true,
        twoFactor: false
      };
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    }
  },

  // ---------- Auth ----------
  login(email, password) {
    const admins = this.getAdmins();
    const admin = admins.find(a => a.email === email && a.password === password);
    if (admin) {
      const { password: _, ...safe } = admin;
      localStorage.setItem(this.KEYS.ADMIN_USER, JSON.stringify(safe));
      return { success: true, user: safe };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  // Change the logged-in admin's password
  changePassword(currentPassword, newPassword) {
    const me = this.getCurrentUser();
    if (!me) return { success: false, message: 'Please log in again' };
    const admins = this.getAdmins();
    const idx = admins.findIndex(a => a.id === me.id);
    if (idx === -1) return { success: false, message: 'Admin account not found' };
    if (admins[idx].password !== currentPassword) return { success: false, message: 'Current password is incorrect' };
    if (!newPassword || newPassword.length < 6) return { success: false, message: 'New password must be at least 6 characters' };
    if (newPassword === currentPassword) return { success: false, message: 'New password must be different from the current one' };
    admins[idx].password = newPassword;
    localStorage.setItem(this.KEYS.ADMINS, JSON.stringify(admins));
    return { success: true };
  },

  logout() {
    localStorage.removeItem(this.KEYS.ADMIN_USER);
    window.location.href = '../index.html';
  },

  getCurrentUser() {
    const u = localStorage.getItem(this.KEYS.ADMIN_USER);
    return u ? JSON.parse(u) : null;
  },

  isLoggedIn() { return !!this.getCurrentUser(); },

  getAdmins() {
    return JSON.parse(localStorage.getItem(this.KEYS.ADMINS) || '[]');
  },

  // ---------- Stats ----------
  getStats() {
    const events = this.getEvents();
    const regs = this.getRegistrations();
    const vols = this.getVolunteers();
    const donations = this.getDonations();

    return {
      totalEvents: events.length,
      upcomingEvents: events.filter(e => e.status === 'upcoming').length,
      totalRegistrations: regs.length,
      pendingRegistrations: regs.filter(r => r.status === 'pending').length,
      pendingApplications: this.getApplications().filter(a => a.status === 'pending').length,
      confirmedRegistrations: regs.filter(r => r.status === 'confirmed').length,
      totalVolunteers: vols.length,
      activeVolunteers: vols.filter(v => v.status === 'active').length,
      totalDonations: donations.filter(d => d.status !== 'pending' && d.status !== 'declined').reduce((s, d) => s + Number(d.amount), 0),
      totalDonors: new Set(donations.map(d => d.email)).size,
      totalUsers: this.getUsers().length
    };
  },

  // ---------- Shared: Users ----------
  getUsers() {
    return JSON.parse(localStorage.getItem(this.KEYS.USERS) || '[]');
  },

  addUser(data) {
    const users = this.getUsers();
    if (users.find(u => u.email === data.email)) {
      return { success: false, message: 'Email already exists' };
    }
    const newUser = {
      id: 'USR-' + String(users.length + 1).padStart(3, '0'),
      name: data.name,
      email: data.email,
      password: data.password || 'default123',
      phone: data.phone || '',
      monastery: data.monastery || '',
      role: data.role || 'participant',
      joinDate: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    return { success: true, user: newUser };
  },

  updateUser(id, data) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return { success: false };
    users[idx] = { ...users[idx], ...data };
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    return { success: true };
  },

  deleteUser(id) {
    const users = this.getUsers().filter(u => u.id !== id);
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    return { success: true };
  },

  // ---------- Shared: Events ----------
  getEvents() {
    return JSON.parse(localStorage.getItem(this.KEYS.EVENTS) || '[]');
  },

  getEventById(id) {
    return this.getEvents().find(e => e.id === id);
  },

  addEvent(data) {
    const events = this.getEvents();
    const newEvent = {
      id: 'EVT-' + String(events.length + 1).padStart(3, '0'),
      name: data.name,
      type: data.type,
      description: data.description,
      date: data.date,
      time: data.time || '09:00 AM - 05:00 PM',
      location: data.location,
      organizer: data.organizer || 'Admin',
      registered: 0,
      status: data.status || 'upcoming',
      icon: data.icon || '🪷',
      image: data.image || '',
      color: data.color || 'gold',
      requirements: data.requirements || ''
    };
    events.push(newEvent);
    localStorage.setItem(this.KEYS.EVENTS, JSON.stringify(events));

    // Notify all users about the new event (unless admin opted out)
    let notified = 0;
    if (data.notifyUsers !== false) {
      const when = this.formatDate ? this.formatDate(newEvent.date) : newEvent.date;
      const res = this.broadcastNotification({
        title: 'New Event: ' + newEvent.name,
        message: `${newEvent.name} is scheduled on ${when} at ${newEvent.location}. Registration is now open!`,
        type: 'info',
        icon: newEvent.icon || '📅'
      });
      notified = res.count;
    }
    return { success: true, event: newEvent, notified };
  },

  updateEvent(id, data) {
    const events = this.getEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return { success: false };
    events[idx] = { ...events[idx], ...data };
    localStorage.setItem(this.KEYS.EVENTS, JSON.stringify(events));
    return { success: true, event: events[idx] };
  },

  deleteEvent(id) {
    const events = this.getEvents().filter(e => e.id !== id);
    localStorage.setItem(this.KEYS.EVENTS, JSON.stringify(events));
    // Also remove registrations for this event
    const regs = this.getRegistrations().filter(r => r.eventId !== id);
    localStorage.setItem(this.KEYS.REGISTRATIONS, JSON.stringify(regs));
    return { success: true };
  },

  // ---------- Shared: Registrations ----------
  getRegistrations() {
    return JSON.parse(localStorage.getItem(this.KEYS.REGISTRATIONS) || '[]');
  },

  updateRegistrationStatus(regId, status) {
    const regs = this.getRegistrations();
    const idx = regs.findIndex(r => r.id === regId);
    if (idx === -1) return { success: false };
    regs[idx].status = status;
    localStorage.setItem(this.KEYS.REGISTRATIONS, JSON.stringify(regs));

    // Notify user
    const notifs = JSON.parse(localStorage.getItem(this.KEYS.NOTIFICATIONS) || '[]');
    const msgMap = {
      confirmed: { title: 'Registration Confirmed', message: `Your registration for ${regs[idx].eventName} has been confirmed.`, icon: '✅', type: 'success' },
      cancelled: { title: 'Registration Cancelled', message: `Your registration for ${regs[idx].eventName} has been cancelled.`, icon: '❌', type: 'warning' },
      pending: { title: 'Registration Pending', message: `Your registration for ${regs[idx].eventName} is pending review.`, icon: '⏳', type: 'info' }
    };
    const m = msgMap[status];
    if (m) {
      notifs.push({
        id: 'NOT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        userId: regs[idx].userId,
        title: m.title, message: m.message, icon: m.icon, type: m.type,
        read: false, date: new Date().toISOString()
      });
      localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }
    return { success: true };
  },

  deleteRegistration(regId) {
    const regs = this.getRegistrations().filter(r => r.id !== regId);
    localStorage.setItem(this.KEYS.REGISTRATIONS, JSON.stringify(regs));
    return { success: true };
  },

  // ---------- Volunteers ----------
  getVolunteers() {
    return JSON.parse(localStorage.getItem(this.KEYS.VOLUNTEERS) || '[]');
  },

  addVolunteer(data) {
    const vols = this.getVolunteers();
    const newVol = {
      id: this._nextId('VOL', vols),
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      role: data.role || 'General Volunteer',
      status: 'active',
      assignedEvents: []
    };
    vols.push(newVol);
    localStorage.setItem(this.KEYS.VOLUNTEERS, JSON.stringify(vols));
    return { success: true, volunteer: newVol };
  },

  updateVolunteer(id, data) {
    const vols = this.getVolunteers();
    const idx = vols.findIndex(v => v.id === id);
    if (idx === -1) return { success: false };
    vols[idx] = { ...vols[idx], ...data };
    localStorage.setItem(this.KEYS.VOLUNTEERS, JSON.stringify(vols));
    return { success: true };
  },

  deleteVolunteer(id) {
    const vols = this.getVolunteers().filter(v => v.id !== id);
    localStorage.setItem(this.KEYS.VOLUNTEERS, JSON.stringify(vols));
    return { success: true };
  },

  // ---------- Tasks ----------
  getTasks() {
    return JSON.parse(localStorage.getItem(this.KEYS.TASKS) || '[]');
  },

  // assignee optional: no volunteerId => OPEN task that volunteers can pick up themselves
  addTask(data) {
    const tasks = this.getTasks();
    const event = data.eventId ? this.getEventById(data.eventId) : null;
    const vol = data.volunteerId ? this.getVolunteers().find(v => v.id === data.volunteerId) : null;
    const newTask = {
      id: this._nextId('TSK', tasks),
      title: data.title,
      description: data.description || '',
      assignee: vol ? vol.name : (data.assignee || ''),
      volunteerId: vol ? vol.id : '',
      open: !vol && !data.assignee,
      eventId: data.eventId || '',
      eventName: event ? event.name : '',
      status: 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate || ''
    };
    tasks.push(newTask);
    localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
    if (vol && vol.userId) {
      this.sendNotification(vol.userId, {
        title: 'New Task Assigned', type: 'info', icon: '📋',
        message: `You have a new task: "${newTask.title}"${newTask.dueDate ? ' (due ' + this.formatDate(newTask.dueDate) + ')' : ''}.`
      });
    } else if (newTask.open) {
      const targets = this.getVolunteers().filter(v => v.userId);
      targets.forEach(v => this.sendNotification(v.userId, { title: 'New Open Task', type: 'info', icon: '📋', message: `"${newTask.title}" is open - take it from the Volunteer page.` }));
    }
    return { success: true, task: newTask };
  },

  updateTask(id, data) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return { success: false };
    tasks[idx] = { ...tasks[idx], ...data };
    localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
    return { success: true };
  },

  deleteTask(id) {
    const tasks = this.getTasks().filter(t => t.id !== id);
    localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
    return { success: true };
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

  // ---------- Volunteer calls ----------
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

  addCall(data) {
    const calls = this.getCalls();
    const event = data.eventId ? this.getEventById(data.eventId) : null;
    const call = {
      id: this._nextId('CALL', calls),
      title: data.title,
      role: data.role || 'General Volunteer',
      description: data.description || '',
      needed: Math.max(1, Number(data.needed) || 1),
      eventId: data.eventId || '',
      eventName: event ? event.name : '',
      deadline: data.deadline || '',
      status: 'open',
      createdAt: new Date().toISOString()
    };
    calls.push(call);
    localStorage.setItem(this.KEYS.CALLS, JSON.stringify(calls));
    const res = this.broadcastNotification({
      title: 'Volunteers Needed: ' + call.title,
      message: `We need ${call.needed} volunteer${call.needed > 1 ? 's' : ''} (${call.role})${call.eventName ? ' for ' + call.eventName : ''}. Open the Volunteer page to sign up.`,
      type: 'info', icon: '🤝'
    });
    return { success: true, call, notified: res.count };
  },

  updateCall(id, data) {
    const calls = this.getCalls();
    const i = calls.findIndex(c => c.id === id);
    if (i === -1) return { success: false };
    calls[i] = { ...calls[i], ...data };
    localStorage.setItem(this.KEYS.CALLS, JSON.stringify(calls));
    return { success: true };
  },

  deleteCall(id) {
    localStorage.setItem(this.KEYS.CALLS, JSON.stringify(this.getCalls().filter(c => c.id !== id)));
    localStorage.setItem(this.KEYS.APPLICATIONS, JSON.stringify(this.getApplications().filter(a => a.callId !== id)));
    return { success: true };
  },

  // Approve -> user becomes a volunteer (record linked by userId). Reject -> notify only.
  reviewApplication(appId, status) {
    const apps = this.getApplications();
    const i = apps.findIndex(a => a.id === appId);
    if (i === -1) return { success: false, message: 'Application not found' };
    const app = apps[i];
    const call = this.getCalls().find(c => c.id === app.callId);
    if (status === 'approved' && call) {
      const st = this.callStats(call);
      if (app.status !== 'approved' && st.approved >= call.needed) return { success: false, message: 'All needed volunteer places are already filled' };
    }
    apps[i].status = status;
    apps[i].reviewedAt = new Date().toISOString();
    localStorage.setItem(this.KEYS.APPLICATIONS, JSON.stringify(apps));

    if (status === 'approved') {
      const vols = this.getVolunteers();
      let v = vols.find(x => x.userId === app.userId || (x.email || '').toLowerCase() === (app.email || '').toLowerCase());
      if (!v) {
        v = { id: this._nextId('VOL', vols), userId: app.userId, name: app.userName, email: app.email, phone: app.phone || '',
              role: call ? call.role : 'General Volunteer', status: 'active', assignedEvents: [] };
        vols.push(v);
      } else { v.userId = app.userId; v.status = 'active'; }
      if (call && call.eventId && !(v.assignedEvents || []).includes(call.eventId)) v.assignedEvents = [...(v.assignedEvents || []), call.eventId];
      localStorage.setItem(this.KEYS.VOLUNTEERS, JSON.stringify(vols));
    }
    this.sendNotification(app.userId, {
      title: status === 'approved' ? 'Volunteer Application Approved' : 'Volunteer Application Update',
      message: status === 'approved'
        ? `You are now a volunteer${call ? ' for "' + call.title + '"' : ''}. Check the Volunteer page for your tasks.`
        : `Your application${call ? ' for "' + call.title + '"' : ''} was not accepted this time. Thank you for offering to help.`,
      type: status === 'approved' ? 'success' : 'warning',
      icon: status === 'approved' ? '🤝' : 'ℹ️'
    });
    return { success: true };
  },

  // ---------- Donations ----------
  getDonations() {
    return JSON.parse(localStorage.getItem(this.KEYS.DONATIONS) || '[]');
  },

  addDonation(data) {
    const donations = this.getDonations();
    const event = data.eventId ? this.getEventById(data.eventId) : null;
    const type = data.type === 'product' ? 'product' : 'money';
    const maxN = donations.reduce((m, d) => Math.max(m, parseInt(String(d.id).replace(/\D/g, ''), 10) || 0), 0);
    const now = new Date();
    const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    const newDon = {
      id: 'DON-' + String(maxN + 1).padStart(3, '0'),
      type,
      userId: data.userId || '',
      donor: data.donor,
      email: data.email || '',
      amount: type === 'money' ? Number(data.amount) : 0,
      eventId: data.eventId || '',
      eventName: event ? event.name : 'General Donation',
      method: data.method || (type === 'product' ? 'Drop-off' : 'Cash'),
      txnId: data.txnId || '',
      productName: type === 'product' ? (data.productName || '') : '',
      category: type === 'product' ? (data.category || 'Other') : '',
      quantity: type === 'product' ? Number(data.quantity || 0) : 0,
      unit: type === 'product' ? (data.unit || 'pcs') : '',
      estValue: type === 'product' ? Number(data.estValue || 0) : 0,
      pickupAddress: data.pickupAddress || '',
      description: data.description || '',
      status: data.status || 'received',
      date: today,
      createdAt: now.toISOString()
    };
    donations.push(newDon);
    localStorage.setItem(this.KEYS.DONATIONS, JSON.stringify(donations));
    return { success: true, donation: newDon };
  },

  // Product donations: pending -> received (or declined). Notifies the donor.
  updateDonationStatus(id, status) {
    const donations = this.getDonations();
    const idx = donations.findIndex(d => d.id === id);
    if (idx === -1) return { success: false };
    donations[idx].status = status;
    localStorage.setItem(this.KEYS.DONATIONS, JSON.stringify(donations));
    const d = donations[idx];
    if (d.userId) {
      const notifs = JSON.parse(localStorage.getItem(this.KEYS.NOTIFICATIONS) || '[]');
      notifs.push({
        id: 'NOT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        userId: d.userId,
        title: status === 'received' ? 'Donation Received' : 'Donation Update',
        message: (() => {
          const what = d.type === 'product' ? `${d.quantity} ${d.unit} ${d.productName}` : 'Nu ' + Number(d.amount).toLocaleString('en-US');
          return status === 'received'
            ? `The monastery has received your donation of ${what}. Thank you, may you be blessed!`
            : `Your donation (${what}) could not be confirmed. Please contact the monastery office.`;
        })(),
        icon: status === 'received' ? '🙏' : 'ℹ️',
        type: status === 'received' ? 'success' : 'warning',
        read: false, date: new Date().toISOString()
      });
      localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }
    return { success: true };
  },

  deleteDonation(id) {
    const donations = this.getDonations().filter(d => d.id !== id);
    localStorage.setItem(this.KEYS.DONATIONS, JSON.stringify(donations));
    return { success: true };
  },

  // ---------- Settings ----------
  getSettings() {
    return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS) || '{}');
  },

  saveSettings(data) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data));
    return { success: true };
  },

  // ---------- Notifications (admin broadcast) ----------
  sendNotification(userId, data) {
    const notifs = JSON.parse(localStorage.getItem(this.KEYS.NOTIFICATIONS) || '[]');
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
    return { success: true };
  },

  broadcastNotification(data) {
    const users = this.getUsers();
    users.forEach(u => this.sendNotification(u.id, data));
    return { success: true, count: users.length };
  },

  // ---------- Helpers ----------
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  formatTime(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  formatCurrency(n) {
    return 'Nu ' + Number(n).toLocaleString('en-US');
  }
};

AdminDB.seedData();
AdminDB.linkLegacyTasks();
if (typeof MonkDB !== 'undefined') MonkDB.removePlannedEvents();