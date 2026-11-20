/* ============================================
   SHARED API CLIENT FOR FRONTEND -> BACKEND
   Include <script src="../shared/api-client.js"></script>
   ============================================ */

const MonasteryAPI = {
  BASE_URL: 'http://localhost:5000/api',

  getToken() {
    return localStorage.getItem('auth_token') || '';
  },

  setToken(token) {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  },

  // Auth
  loginMonk(email, password) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  registerMonk(payload) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  },
  loginAdmin(email, password) {
    return this.request('/auth/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },

  // Events
  getEvents(params = '') {
    return this.request(`/events${params ? '?' + params : ''}`);
  },
  createEvent(data) {
    return this.request('/events', { method: 'POST', body: JSON.stringify(data) });
  },
  updateEvent(id, data) {
    return this.request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteEvent(id) {
    return this.request(`/events/${id}`, { method: 'DELETE' });
  },

  // Registrations
  getRegistrations() {
    return this.request('/registrations');
  },
  registerForEvent(eventId, notes = '') {
    return this.request('/registrations', { method: 'POST', body: JSON.stringify({ eventId, notes }) });
  },
  updateRegistrationStatus(id, status) {
    return this.request(`/registrations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  cancelRegistration(id) {
    return this.request(`/registrations/${id}`, { method: 'DELETE' });
  },

  // Volunteers, Calls, Applications & Tasks
  getVolunteers() {
    return this.request('/volunteers');
  },
  getVolunteerCalls() {
    return this.request('/volunteers/calls');
  },
  applyToCall(callId, data) {
    return this.request(`/volunteers/calls/${callId}/apply`, { method: 'POST', body: JSON.stringify(data) });
  },
  getTasks() {
    return this.request('/volunteers/tasks');
  },

  // Donations
  getDonations() {
    return this.request('/donations');
  },
  submitDonation(data) {
    return this.request('/donations', { method: 'POST', body: JSON.stringify(data) });
  },
  verifyDonation(id, status) {
    return this.request(`/donations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },

  // Notifications
  getNotifications() {
    return this.request('/notifications');
  },
  markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  // Admin Dashboard Stats
  getDashboardStats() {
    return this.request('/dashboard/stats');
  }
};
