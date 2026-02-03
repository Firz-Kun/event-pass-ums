import { User } from '@/types/user';
import { Event } from '@/types/event';

const API_URL = 'http://localhost:3001/api'; // Your backend URL

// Re-export types for convenience
export type { User } from '@/types/user';
export type { Event } from '@/types/event';

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  console.log("🔑 API Token Check:", token ? "Found It!" : "MISSING - This is why it fails");
  
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
  login: (credentials: { email: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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

  logout: () => {
    localStorage.removeItem('auth_token'); // Or 'token'
    localStorage.removeItem('token');      // Clear both to be safe
    return Promise.resolve();
  },
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
  
  getById: (userId: string) => apiCall(`/users/${userId}`),

  update: (userId: string, updates: Partial<User>) =>
    apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  updateStatus: (userId: string, status: string) =>
    apiCall(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  delete: (userId: string) =>
    apiCall(`/users/${userId}`, {
      method: 'DELETE',
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

export const api = {
  auth: authAPI,
  events: eventsAPI,
  users: usersAPI,
  notifications: notificationsAPI,
  feedback: feedbackAPI,
  attendance: attendanceAPI,
};
