const API_URL = 'http://localhost:3001/api'; // Your backend URL

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: any) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => apiCall('/auth/me'),

  updateProfile: (updates: any) =>
    apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};

// Events API
export const eventsAPI = {
  getAll: () => apiCall('/events'),
  
  getById: (id: string) => apiCall(`/events/${id}`),
  
  create: (eventData: any) =>
    apiCall('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),
  
  update: (id: string, eventData: any) =>
    apiCall(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),
  
  delete: (id: string) =>
    apiCall(`/events/${id}`, {
      method: 'DELETE',
    }),

  register: (eventId: string) =>
    apiCall(`/events/${eventId}/register`, {
      method: 'POST',
    }),

  getRegistrations: (eventId: string) =>
    apiCall(`/events/${eventId}/registrations`),
};

// Users API (Admin only)
export const usersAPI = {
  getAll: () => apiCall('/users'),
  
  updateStatus: (userId: string, status: string) =>
    apiCall(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => apiCall('/notifications'),
  
  markAsRead: (notificationId: string) =>
    apiCall(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),
};

// Feedback API
export const feedbackAPI = {
  submit: (eventId: string, rating: number, comment: string) =>
    apiCall(`/events/${eventId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),

  getForEvent: (eventId: string) =>
    apiCall(`/events/${eventId}/feedback`),
};

// Attendance API
export const attendanceAPI = {
  checkIn: (qrCode: string) =>
    apiCall('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ qrCode }),
    }),

  getRecords: (eventId: string) =>
    apiCall(`/attendance/event/${eventId}`),
};