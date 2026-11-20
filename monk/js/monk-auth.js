/* ============================================
   MONK / PARTICIPANT AUTHENTICATION
   ============================================ */

// ---------- Toast Helper ----------
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

// ---------- Login ----------
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  const result = MonkDB.login(email, password);

  if (result.success) {
    showToast(`Welcome back, ${result.user.name}!`, 'success');
    setTimeout(() => {
      window.location.href = 'monk-dashboard.html';
    }, 800);
  } else {
    showToast(result.message, 'error');
  }
}

// ---------- Logout ----------
function handleLogout(event) {
  if (event) event.preventDefault();
  MonkDB.logout();
}

// ---------- Register ----------
function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirmPassword').value;

  if (!name || !email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  if (password !== confirm) {
    showToast('Passwords do not match', 'error');
    return;
  }

  const users = MonkDB.getUsers();
  if (users.find(u => u.email === email)) {
    showToast('Email already registered', 'error');
    return;
  }

  // Add new user
  const newUser = {
    id: 'MONK-' + String(users.length + 1).padStart(3, '0'),
    name,
    email,
    password,
    phone: '',
    monastery: '',
    role: 'participant',
    joinDate: new Date().toISOString().split('T')[0]
  };
  users.push(newUser);
  localStorage.setItem(MonkDB.KEYS.USERS, JSON.stringify(users));

  showToast('Account created successfully! Please login.', 'success');
  setTimeout(() => {
    window.location.href = 'monk-login.html';
  }, 1200);
}

// ---------- Password Toggle ----------
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

// ---------- Guard ----------
if (window.location.pathname.includes('monk-dashboard') ||
    window.location.pathname.includes('monk-events') ||
    window.location.pathname.includes('monk-event-detail') ||
    window.location.pathname.includes('monk-registrations') ||
    window.location.pathname.includes('monk-donate') ||
    window.location.pathname.includes('monk-volunteer') ||
    window.location.pathname.includes('monk-notifications') ||
    window.location.pathname.includes('monk-profile')) {
  if (!MonkDB.isLoggedIn()) {
    window.location.href = 'monk-login.html';
  }
}