/* ============================================
   MONK APP - SHARED UI HELPERS
   ============================================ */

// ---------- Profile photo helper ----------
function photoStyle(user) {
  // Only accept real image data-URLs saved by the profile page
  if (user && typeof user.photo === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(user.photo)) {
    return `style="background-image:url('${user.photo}'); background-size:cover; background-position:center;"`;
  }
  return '';
}

// ---------- Sidebar Builder ----------
function renderMonkSidebar(activePage) {
  const user = MonkDB.getCurrentUser();
  const unread = MonkDB.getUnreadCount(user.id);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: 'monk-dashboard.html' },
    { id: 'events', label: 'Events', icon: '📅', href: 'monk-events.html' },
    { id: 'registrations', label: 'My Registrations', icon: '📝', href: 'monk-registrations.html' },
    { id: 'volunteer', label: 'Volunteer', icon: '🤝', href: 'monk-volunteer.html' },
    { id: 'donate', label: 'Donate', icon: '💝', href: 'monk-donate.html' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', href: 'monk-notifications.html', badge: unread },
    { id: 'profile', label: 'My Profile', icon: '👤', href: 'monk-profile.html' }
  ];

  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return `
    <aside class="monk-sidebar" id="sidebar">
      <div class="monk-sidebar-header">
        <div class="brand-icon" style="overflow: hidden; padding: 0;">
  <img src="../image/logo.jpg" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;">
</div>
        <div class="brand-text">
          <h3>MONASTERY</h3>
          <span>PARTICIPANT PORTAL</span>
        </div>
      </div>
      <nav class="monk-sidebar-nav">
        ${navItems.map(item => `
          <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
            ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
          </a>
        `).join('')}
      </nav>
      <div class="monk-sidebar-footer">
        <div class="monk-user-card">
          <div class="avatar" ${photoStyle(user)}>${user.photo ? '' : initials}</div>
          <div class="info">
            <div class="name">${user.name}</div>
            <div class="role">${user.role === 'monk' ? 'Monk' : 'Participant'}</div>
          </div>
        </div>
        <a href="#" class="nav-item" onclick="handleLogout(event)">
          <span class="nav-icon">🚪</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  `;
}

// ---------- Topbar Builder ----------
function renderTopbar(title, subtitle = '') {
  const user = MonkDB.getCurrentUser();
  const unread = MonkDB.getUnreadCount(user.id);

  return `
    <div class="topbar">
      <div class="greeting">
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="topbar-actions">
        <a href="monk-notifications.html" class="icon-btn">
          🔔
          ${unread > 0 ? '<span class="dot"></span>' : ''}
        </a>
        <a href="monk-profile.html" class="icon-btn">👤</a>
      </div>
    </div>
  `;
}

// ---------- Event Card Builder ----------
function buildEventCard(event, showRegisterBtn = true) {
  const user = MonkDB.getCurrentUser();
  const reg = MonkDB.getRegistrationForEvent(user.id, event.id);
  const { day, month } = MonkDB.getDayMonth(event.date);

  let actionBtn = '';
  if (reg) {
    actionBtn = `
      <button class="btn btn-outline btn-sm" disabled>
        ✓ ${reg.status === 'cancelled' ? 'Cancelled' : 'Registered'}
      </button>
    `;
  } else if (event.status === 'completed') {
    actionBtn = `<button class="btn btn-outline btn-sm" disabled>Event Ended</button>`;
  } else {
    actionBtn = `<button class="btn btn-primary btn-sm" onclick="openRegisterModal('${event.id}')">Register Now</button>`;
  }

  return `
    <div class="event-card fade-in">
      <div class="event-banner ${event.color}" ${event.image ? `style="background: url('${event.image}') center / cover no-repeat;"` : ''}>
        ${event.image ? '' : event.icon}
        <div class="event-date-badge">
          <div class="day">${day}</div>
          <div class="month">${month}</div>
        </div>
        <div class="event-status ${event.status}">${event.status}</div>
      </div>
      <div class="event-body">
        <div class="event-type">${event.type}</div>
        <div class="event-title">${event.name}</div>
        <div class="event-desc">${event.description}</div>
        <div class="event-meta">
          <div class="meta-item"><span>🕐</span> ${event.time}</div>
          <div class="meta-item"><span>📍</span> ${event.location}</div>
          <div class="meta-item"><span>👥</span> ${event.registered || 0} registered</div>
        </div>
        <div class="event-footer">
          <button class="btn btn-outline btn-sm" onclick="location.href='monk-event-detail.html?id=${event.id}'">Details</button>
          ${actionBtn}
        </div>
      </div>
    </div>
  `;
}

// ---------- Register Modal ----------
function openRegisterModal(eventId) {
  const event = MonkDB.getEventById(eventId);
  if (!event) return;

  let overlay = document.getElementById('registerModalOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'registerModalOverlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Register for Event</h3>
        <button class="modal-close" onclick="closeRegisterModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:20px; padding:14px; background:#faf9ff; border-radius:12px;">
          <div style="font-size:32px;">${event.icon}</div>
          <div>
            <div style="font-weight:700; font-size:15px;">${event.name}</div>
            <div style="font-size:12px; color:#8b8ba7;">${event.date} · ${event.location}</div>
          </div>
        </div>
        <div class="form-group">
          <label>Additional Notes (Optional)</label>
          <textarea id="regNotes" rows="3" style="width:100%; padding:12px; border:1.5px solid #e9e5f5; border-radius:8px; font-size:14px; resize:vertical;" placeholder="Any special requirements or notes..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeRegisterModal()">Cancel</button>
        <button class="btn btn-primary" onclick="confirmRegister('${eventId}')">Confirm Registration</button>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

function closeRegisterModal() {
  const overlay = document.getElementById('registerModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

function confirmRegister(eventId) {
  const user = MonkDB.getCurrentUser();
  const notes = document.getElementById('regNotes')?.value || '';
  const result = MonkDB.registerForEvent(user.id, eventId, notes);

  if (result.success) {
    closeRegisterModal();
    showToast('Registration submitted successfully!', 'success');
    setTimeout(() => location.reload(), 1000);
  } else {
    showToast(result.message, 'error');
  }
}

// ---------- Cancel Registration ----------
function confirmCancelRegistration(regId, eventName) {
  if (confirm(`Are you sure you want to cancel your registration for "${eventName}"?`)) {
    const result = MonkDB.cancelRegistration(regId);
    if (result.success) {
      showToast('Registration cancelled', 'warning');
      setTimeout(() => location.reload(), 1000);
    }
  }
}

// ---------- Mobile Menu ----------
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}