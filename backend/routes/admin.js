const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const router = express.Router();

// ─── Multer Upload Config ───
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP and SVG are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const DATA_DIR = path.join(__dirname, '..', 'data');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Active session tokens stored in memory
const activeTokens = new Set();

// Helper to get admin password
const getAdminPassword = () => process.env.ADMIN_PASSWORD || 'kavindu@#123';

// Read JSON helper
const readJsonFile = (filePath, fallback = {}) => {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
};

// Write JSON helper
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
};

// Authentication Middleware
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin token missing.' });
  }

  const token = authHeader.split(' ')[1];
  if (!activeTokens.has(token)) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }

  next();
};

// ─── ADMIN LOGIN ───
// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  const expectedPassword = getAdminPassword();
  if (password !== expectedPassword) {
    return res.status(401).json({ error: 'Incorrect admin password.' });
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.add(token);

  return res.json({
    success: true,
    token,
    message: 'Welcome Kavindu! Admin login successful.'
  });
});

// ─── VERIFY TOKEN ───
// GET /api/admin/verify
router.get('/verify', requireAdminAuth, (req, res) => {
  res.json({ valid: true });
});

// ─── ADMIN LOGOUT ───
// POST /api/admin/logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeTokens.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ─── ADMIN: UPLOAD IMAGE ───
// POST /api/admin/upload
router.post('/upload', requireAdminAuth, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    // Build the public URL for the uploaded file
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      message: 'Image uploaded successfully!'
    });
  });
});

// ─── PUBLIC: GET PORTFOLIO DATA ───
// GET /api/portfolio
router.get('/portfolio', (req, res) => {
  const data = readJsonFile(PORTFOLIO_FILE, null);
  if (!data) {
    return res.status(500).json({ error: 'Could not load portfolio data.' });
  }
  res.json(data);
});

// ─── ADMIN: UPDATE ENTIRE PORTFOLIO ───
// PUT /api/admin/portfolio
router.put('/portfolio', requireAdminAuth, (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid portfolio data payload.' });
  }

  const current = readJsonFile(PORTFOLIO_FILE, {});
  const updated = { ...current, ...data };
  const ok = writeJsonFile(PORTFOLIO_FILE, updated);

  if (!ok) {
    return res.status(500).json({ error: 'Failed to persist portfolio data.' });
  }

  res.json({ success: true, data: updated, message: 'Portfolio updated successfully!' });
});

// ─── ADMIN: UPDATE SECTION ───
// PUT /api/admin/portfolio/:section (personalInfo, projects, skills, certifications, experience)
router.put('/portfolio/:section', requireAdminAuth, (req, res) => {
  const { section } = req.params;
  const validSections = ['personalInfo', 'skills', 'projects', 'certifications', 'experience'];

  if (!validSections.includes(section)) {
    return res.status(400).json({ error: `Invalid section: ${section}` });
  }

  const current = readJsonFile(PORTFOLIO_FILE, {});
  current[section] = req.body;
  const ok = writeJsonFile(PORTFOLIO_FILE, current);

  if (!ok) {
    return res.status(500).json({ error: 'Failed to update section.' });
  }

  res.json({ success: true, section, data: current[section], message: `${section} updated successfully!` });
});

// ─── ADMIN: GET MESSAGES ───
// GET /api/admin/messages
router.get('/messages', requireAdminAuth, (req, res) => {
  const messages = readJsonFile(MESSAGES_FILE, []);
  res.json(messages);
});

// ─── ADMIN: MARK MESSAGE AS READ/UNREAD ───
// PATCH /api/admin/messages/:id/read
router.patch('/messages/:id/read', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const messages = readJsonFile(MESSAGES_FILE, []);
  const msgIndex = messages.findIndex((m) => String(m.id) === String(id));

  if (msgIndex === -1) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  messages[msgIndex].read = req.body.read !== undefined ? Boolean(req.body.read) : true;
  writeJsonFile(MESSAGES_FILE, messages);

  res.json({ success: true, message: messages[msgIndex] });
});

// ─── ADMIN: DELETE MESSAGE ───
// DELETE /api/admin/messages/:id
router.delete('/messages/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  let messages = readJsonFile(MESSAGES_FILE, []);
  const initialLen = messages.length;
  messages = messages.filter((m) => String(m.id) !== String(id));

  if (messages.length === initialLen) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  writeJsonFile(MESSAGES_FILE, messages);
  res.json({ success: true, message: 'Message deleted successfully.' });
});

// Helper for saving incoming messages from /api/contact
const saveIncomingMessage = (msgData) => {
  const messages = readJsonFile(MESSAGES_FILE, []);
  const newMsg = {
    id: Date.now().toString(),
    ...msgData,
    createdAt: new Date().toISOString(),
    read: false,
  };
  messages.unshift(newMsg);
  writeJsonFile(MESSAGES_FILE, messages);
  return newMsg;
};

module.exports = { router, saveIncomingMessage };
