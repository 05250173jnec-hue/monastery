/* ============================================
   ADMIN APP - SHARED UI
   ============================================ */

function renderAdminSidebar(activePage) {
  const user = AdminDB.getCurrentUser();
  const stats = AdminDB.getStats();

  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'admin-dashboard.html' },
    { id: 'events', label: 'Events', icon: '📅', href: 'admin-events.html' },
    { id: 'volunteers', label: 'Volunteers & Tasks', icon: '🤝', href: 'admin-volunteers.html', badge: stats.pendingApplications },
    { id: 'registrations', label: 'Registrations', icon: '📝', href: 'admin-registrations.html', badge: stats.pendingRegistrations },
    { id: 'donations', label: 'Donations', icon: '💰', href: 'admin-donations.html' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', href: 'admin-notifications.html' },
    { id: 'users', label: 'Users', icon: '👥', href: 'admin-users.html' },
    { id: 'reports', label: 'Reports', icon: '📈', href: 'admin-reports.html' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: 'admin-settings.html' }
  ];

  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

  return `
    <aside class="admin-sidebar" id="sidebar">
      <div class="admin-sidebar-header">
        <div class="brand-icon" style="overflow: hidden; padding: 0;">
  <img src="../image/logo.jpg" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;">
</div>
        <div class="brand-text">
          <h3>MONASTERY</h3>
          <span>ADMIN PANEL</span>
        </div>
      </div>
      <nav class="admin-sidebar-nav">
        ${nav.map(item => `
          <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
            ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
          </a>
        `).join('')}
      </nav>
      <div class="admin-sidebar-footer">
        <a href="admin-settings.html#security" class="admin-user-card" title="Account &amp; password" style="text-decoration:none; color:inherit;">
          <div class="avatar">${initials}</div>
          <div class="info">
            <div class="name">${user.name}</div>
            <div class="role">Administrator · Change password</div>
          </div>
        </a>
        <a href="#" class="nav-item" onclick="handleAdminLogout(event)">
          <span class="nav-icon">🚪</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  `;
}

function renderAdminTopbar(title, subtitle = '') {
  return `
    <div class="topbar">
      <div class="greeting">
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="topbar-actions">
        <a href="${AdminDB.getStats().pendingRegistrations > 0 ? 'admin-registrations.html' : 'admin-notifications.html'}" class="icon-btn" style="position:relative;" title="Pending registrations">🔔${AdminDB.getStats().pendingRegistrations > 0 ? `<span style="position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff; font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:9px; display:flex; align-items:center; justify-content:center; padding:0 4px;">${AdminDB.getStats().pendingRegistrations}</span>` : ''}</a>
        <a href="admin-settings.html" class="icon-btn">👤</a>
      </div>
    </div>
  `;
}

// ---------- Modal Helper ----------
function openModal(id, html) {
  let overlay = document.getElementById(id);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = html;
  overlay.classList.add('active');
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('active');
}