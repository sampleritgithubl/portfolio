const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const {
  isMongoConnected,
  getPortfolioFromDb,
  savePortfolioToDb,
  updateSectionInDb,
  getMessagesFromDb,
  saveMessageToDb,
  markMessageReadInDb,
  deleteMessageInDb
} = require('../db');

const router = express.Router();

// ─── Cloudinary Config ───
const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
};

if (isCloudinaryConfigured()) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

// ─── Multer Upload Config (Memory Storage for Cloudinary / Base64 / Disk Backup) ───
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.memoryStorage();

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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
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

// ─── STORAGE & SYSTEM STATUS ───
// GET /api/admin/status
router.get('/status', requireAdminAuth, async (req, res) => {
  const mongo = isMongoConnected();
  const cloud = isCloudinaryConfigured();
  res.json({
    database: mongo ? 'mongodb' : 'ephemeral',
    databaseConnected: mongo,
    cloudinaryConfigured: cloud,
    serverTime: new Date().toISOString()
  });
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
  upload.single('image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    // 1. If Cloudinary is configured, upload to Cloudinary CDN for permanent hosting
    if (isCloudinaryConfigured()) {
      try {
        const uploadPromise = new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'portfolio_uploads', resource_type: 'auto' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        const result = await uploadPromise;
        return res.json({
          success: true,
          url: result.secure_url,
          provider: 'cloudinary',
          originalName: req.file.originalname,
          size: req.file.size,
          message: 'Image uploaded permanently to Cloudinary CDN!'
        });
      } catch (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr);
        // Fallback to local storage below if Cloudinary failed
      }
    }

    // 2. Fallback: Save to local uploads disk and generate base64 dataUrl
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const ext = path.extname(req.file.originalname).toLowerCase() || '.webp';
    const filename = uniqueSuffix + ext;
    const filePath = path.join(UPLOADS_DIR, filename);

    try {
      fs.writeFileSync(filePath, req.file.buffer);
    } catch (fsErr) {
      console.error('Error writing local file:', fsErr);
    }

    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${filename}`;
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    res.json({
      success: true,
      url: fileUrl,
      dataUrl: dataUrl,
      filename,
      originalName: req.file.originalname,
      size: req.file.size,
      provider: 'local',
      message: 'Image processed successfully!'
    });
  });
});

// ─── PUBLIC: GET PORTFOLIO DATA ───
// GET /api/portfolio
router.get('/portfolio', async (req, res) => {
  try {
    // 1. First priority: Fetch from MongoDB Atlas if connected
    if (isMongoConnected()) {
      const dbData = await getPortfolioFromDb();
      if (dbData && dbData.personalInfo && Object.keys(dbData.personalInfo).length > 0) {
        return res.json(dbData);
      }
    }

    // 2. Fallback: Read from local portfolio.json
    const data = readJsonFile(PORTFOLIO_FILE, null);
    if (!data) {
      return res.status(500).json({ error: 'Could not load portfolio data.' });
    }
    res.json(data);
  } catch (err) {
    console.error('Error in GET /api/portfolio:', err);
    const data = readJsonFile(PORTFOLIO_FILE, null);
    res.json(data || {});
  }
});

// ─── ADMIN: UPDATE ENTIRE PORTFOLIO ───
// PUT /api/admin/portfolio
router.put('/portfolio', requireAdminAuth, async (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid portfolio data payload.' });
  }

  const current = readJsonFile(PORTFOLIO_FILE, {});
  const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
  
  // Write to local JSON file
  writeJsonFile(PORTFOLIO_FILE, updated);

  // Write to MongoDB if connected
  if (isMongoConnected()) {
    try {
      await savePortfolioToDb(updated);
    } catch (e) {
      console.error('Failed to save portfolio to MongoDB:', e);
    }
  }

  res.json({ success: true, data: updated, message: 'Portfolio updated successfully!' });
});

// ─── ADMIN: UPDATE SECTION ───
// PUT /api/admin/portfolio/:section (personalInfo, projects, skills, certifications, experience)
router.put('/portfolio/:section', requireAdminAuth, async (req, res) => {
  const { section } = req.params;
  const validSections = ['personalInfo', 'skills', 'projects', 'certifications', 'experience'];

  if (!validSections.includes(section)) {
    return res.status(400).json({ error: `Invalid section: ${section}` });
  }

  const current = readJsonFile(PORTFOLIO_FILE, {});
  current[section] = req.body;
  current.updatedAt = new Date().toISOString();
  
  // Write to local JSON file
  writeJsonFile(PORTFOLIO_FILE, current);

  // Write to MongoDB if connected
  if (isMongoConnected()) {
    try {
      await updateSectionInDb(section, req.body);
    } catch (e) {
      console.error(`Failed to update ${section} in MongoDB:`, e);
    }
  }

  res.json({ success: true, section, data: current[section], message: `${section} updated successfully!` });
});

// ─── ADMIN: IMPORT BACKUP ───
// POST /api/admin/portfolio/import
router.post('/portfolio/import', requireAdminAuth, async (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid portfolio backup data.' });
  }

  const payload = {
    personalInfo: data.personalInfo || {},
    skills: Array.isArray(data.skills) ? data.skills : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    experience: Array.isArray(data.experience) ? data.experience : [],
    updatedAt: new Date().toISOString()
  };

  writeJsonFile(PORTFOLIO_FILE, payload);

  if (isMongoConnected()) {
    try {
      await savePortfolioToDb(payload);
    } catch (e) {
      console.error('Failed to import into MongoDB:', e);
    }
  }

  res.json({ success: true, data: payload, message: 'Portfolio backup imported successfully!' });
});

// ─── ADMIN: GET MESSAGES ───
// GET /api/admin/messages
router.get('/messages', requireAdminAuth, async (req, res) => {
  if (isMongoConnected()) {
    try {
      const messages = await getMessagesFromDb();
      if (messages) return res.json(messages);
    } catch (e) {
      console.error('Error fetching messages from MongoDB:', e);
    }
  }
  const messages = readJsonFile(MESSAGES_FILE, []);
  res.json(messages);
});

// ─── ADMIN: MARK MESSAGE AS READ/UNREAD ───
// PATCH /api/admin/messages/:id/read
router.patch('/messages/:id/read', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const isRead = req.body.read !== undefined ? Boolean(req.body.read) : true;

  if (isMongoConnected()) {
    try {
      await markMessageReadInDb(id, isRead);
    } catch (e) {
      console.error('Error marking message read in MongoDB:', e);
    }
  }

  const messages = readJsonFile(MESSAGES_FILE, []);
  const msgIndex = messages.findIndex((m) => String(m.id) === String(id));

  if (msgIndex !== -1) {
    messages[msgIndex].read = isRead;
    writeJsonFile(MESSAGES_FILE, messages);
    return res.json({ success: true, message: messages[msgIndex] });
  }

  res.json({ success: true, id, read: isRead });
});

// ─── ADMIN: DELETE MESSAGE ───
// DELETE /api/admin/messages/:id
router.delete('/messages/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected()) {
    try {
      await deleteMessageInDb(id);
    } catch (e) {
      console.error('Error deleting message from MongoDB:', e);
    }
  }

  let messages = readJsonFile(MESSAGES_FILE, []);
  messages = messages.filter((m) => String(m.id) !== String(id));
  writeJsonFile(MESSAGES_FILE, messages);

  res.json({ success: true, message: 'Message deleted successfully.' });
});

// Helper for saving incoming messages from /api/contact
const saveIncomingMessage = async (msgData) => {
  // Save to MongoDB if connected
  if (isMongoConnected()) {
    try {
      const saved = await saveMessageToDb(msgData);
      if (saved) return saved;
    } catch (e) {
      console.error('Error saving message to MongoDB:', e);
    }
  }

  // Fallback to local messages.json
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
