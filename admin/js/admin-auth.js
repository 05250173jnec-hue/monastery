/* ============================================
   ADMIN AUTHENTICATION
   ============================================ */

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(110%)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function handleAdminLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const result = AdminDB.login(email, password);
  if (result.success) {
    showToast(`Welcome, ${result.user.name}!`, 'success');
    setTimeout(() => window.location.href = 'admin-dashboard.html', 800);
  } else {
    showToast(result.message, 'error');
  }
}

function handleAdminLogout(event) {
  if (event) event.preventDefault();
  AdminDB.logout();
}

// Guard for admin pages
const adminPages = ['admin-dashboard','admin-events','admin-volunteers','admin-registrations',
  'admin-donations','admin-notifications','admin-users','admin-reports','admin-settings'];

if (adminPages.some(p => window.location.pathname.includes(p))) {
  if (!AdminDB.isLoggedIn()) window.location.href = 'admin-login.html';
}
