// backend/server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ums_event_pass',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// ============================================================================
// AUTH ROUTES
// ============================================================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check status
    if (user.status === 'pending') {
      return res.status(403).json({ 
        message: 'Your account is awaiting approval from an administrator' 
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ 
        message: 'Your account has been suspended. Please contact support.' 
      });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete user.password;

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password, role, studentId, faculty } = req.body;

    // Check if user already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        message: 'An account with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user ID
    const userId = `user-${Date.now()}`;

    // Insert new user
    await pool.query(
      `INSERT INTO users (id, email, password, name, role, status, student_id, faculty, email_verified) 
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?, FALSE)`,
      [userId, email, hashedPassword, name, role || 'student', studentId, faculty]
    );

    res.status(201).json({ 
      message: 'Registration successful. Your account is pending approval.' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, name, role, status, student_id, faculty, phone, email_verified, created_at, last_login FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, faculty } = req.body;
    
    await pool.query(
      'UPDATE users SET name = ?, phone = ?, faculty = ? WHERE id = ?',
      [name, phone, faculty, req.user.userId]
    );

    const [users] = await pool.query(
      'SELECT id, email, name, role, status, student_id, faculty, phone, email_verified, created_at, last_login FROM users WHERE id = ?',
      [req.user.userId]
    );

    res.json(users[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// EVENTS ROUTES
// ============================================================================

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const { status, category } = req.query;
    
    let query = 'SELECT * FROM events';
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date ASC';

    const [events] = await pool.query(query, params);
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
app.get('/api/events/:id', async (req, res) => {
  try {
    const [events] = await pool.query(
      'SELECT * FROM events WHERE id = ?',
      [req.params.id]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(events[0]);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event (Event Manager or Admin only)
app.post('/api/events', authenticateToken, authorizeRoles('event_manager', 'admin'), async (req, res) => {
  try {
    const { title, description, date, time, venue, category, capacity, imageUrl, organizer } = req.body;
    
    const eventId = `event-${Date.now()}`;

    await pool.query(
      `INSERT INTO events (id, title, description, date, time, venue, category, capacity, image_url, organizer, created_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming')`,
      [eventId, title, description, date, time, venue, category, capacity, imageUrl, organizer, req.user.userId]
    );

    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    res.status(201).json(events[0]);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
app.put('/api/events/:id', authenticateToken, authorizeRoles('event_manager', 'admin'), async (req, res) => {
  try {
    const { title, description, date, time, venue, category, capacity, imageUrl, organizer, status } = req.body;
    
    await pool.query(
      `UPDATE events SET title = ?, description = ?, date = ?, time = ?, venue = ?, 
       category = ?, capacity = ?, image_url = ?, organizer = ?, status = ? WHERE id = ?`,
      [title, description, date, time, venue, category, capacity, imageUrl, organizer, status, req.params.id]
    );

    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json(events[0]);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
app.delete('/api/events/:id', authenticateToken, authorizeRoles('event_manager', 'admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for event
app.post('/api/events/:id/register', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;

    // Check if event exists and has capacity
    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = events[0];
    if (event.registered_count >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const [existing] = await pool.query(
      'SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Create registration
    const registrationId = `reg-${Date.now()}`;
    const qrCode = `QR-${eventId}-${userId}-${Date.now()}`;

    await pool.query(
      'INSERT INTO event_registrations (id, event_id, user_id, qr_code, status) VALUES (?, ?, ?, ?, "registered")',
      [registrationId, eventId, userId, qrCode]
    );

    // Update event registered count
    await pool.query(
      'UPDATE events SET registered_count = registered_count + 1 WHERE id = ?',
      [eventId]
    );

    res.status(201).json({ 
      message: 'Successfully registered for event',
      qrCode
    });
  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event registrations
app.get('/api/events/:id/registrations', authenticateToken, authorizeRoles('event_manager', 'admin'), async (req, res) => {
  try {
    const [registrations] = await pool.query(
      `SELECT r.*, u.name, u.email, u.student_id, u.faculty 
       FROM event_registrations r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.event_id = ?`,
      [req.params.id]
    );

    res.json(registrations);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// USER MANAGEMENT (Admin only)
// ============================================================================

// Get all users
app.get('/api/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, name, role, status, student_id, faculty, phone, email_verified, created_at, last_login FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status
app.put('/api/users/:id/status', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// NOTIFICATIONS
// ============================================================================

// Get user notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.userId]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET read_status = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// FEEDBACK
// ============================================================================

// Submit event feedback
app.post('/api/events/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const feedbackId = `feedback-${Date.now()}`;

    await pool.query(
      'INSERT INTO event_feedback (id, event_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [feedbackId, req.params.id, req.user.userId, rating, comment]
    );

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event feedback
app.get('/api/events/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const [feedback] = await pool.query(
      `SELECT f.*, u.name FROM event_feedback f 
       JOIN users u ON f.user_id = u.id 
       WHERE f.event_id = ? ORDER BY f.submitted_at DESC`,
      [req.params.id]
    );
    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// ATTENDANCE
// ============================================================================

// Check-in via QR code
app.post('/api/attendance/check-in', authenticateToken, authorizeRoles('event_manager', 'admin'), async (req, res) => {
  try {
    const { qrCode } = req.body;

    // Find registration by QR code
    const [registrations] = await pool.query(
      'SELECT * FROM event_registrations WHERE qr_code = ?',
      [qrCode]
    );

    if (registrations.length === 0) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    const registration = registrations[0];

    // Check if already checked in
    const [existing] = await pool.query(
      'SELECT id FROM attendance_records WHERE registration_id = ?',
      [registration.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already checked in' });
    }

    // Create attendance record
    const attendanceId = `attend-${Date.now()}`;
    await pool.query(
      'INSERT INTO attendance_records (id, registration_id, scanned_by) VALUES (?, ?, ?)',
      [attendanceId, registration.id, req.user.userId]
    );

    // Update registration status
    await pool.query(
      'UPDATE event_registrations SET status = "attended" WHERE id = ?',
      [registration.id]
    );

    res.json({ message: 'Check-in successful' });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance records for event
app.get('/api/attendance/event/:eventId', authenticateToken, authorizeRoles('event_manager', 'admin'), async (req, res) => {
  try {
    const [records] = await pool.query(
      `SELECT a.*, r.user_id, u.name, u.student_id 
       FROM attendance_records a 
       JOIN event_registrations r ON a.registration_id = r.id 
       JOIN users u ON r.user_id = u.id 
       WHERE r.event_id = ? 
       ORDER BY a.check_in_time DESC`,
      [req.params.eventId]
    );
    res.json(records);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================================================
// SERVER START
// ============================================================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
