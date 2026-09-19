const mongoose = require('mongoose');

let isConnected = false;

// ─── Schemas & Models ───
const PortfolioSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main_portfolio' },
    personalInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
    skills: { type: [mongoose.Schema.Types.Mixed], default: [] },
    projects: { type: [mongoose.Schema.Types.Mixed], default: [] },
    certifications: { type: [mongoose.Schema.Types.Mixed], default: [] },
    experience: { type: [mongoose.Schema.Types.Mixed], default: [] },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const MessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const PortfolioModel = mongoose.model('Portfolio', PortfolioSchema);
const MessageModel = mongoose.model('Message', MessageSchema);

// ─── Connection Initialization ───
async function initDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('⚠️ [Database] MONGODB_URI not set. Running in local JSON file mode.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log('✅ [Database] Successfully connected to MongoDB Atlas! Data will be permanently preserved.');
    return true;
  } catch (err) {
    console.error('❌ [Database] Failed to connect to MongoDB Atlas:', err.message);
    isConnected = false;
    return false;
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ [Database] MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('✅ [Database] MongoDB reconnected.');
});

function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

// ─── Database Operations ───
async function getPortfolioFromDb() {
  if (!isMongoConnected()) return null;
  const doc = await PortfolioModel.findOne({ key: 'main_portfolio' }).lean();
  if (!doc) return null;
  return {
    personalInfo: doc.personalInfo || {},
    skills: doc.skills || [],
    projects: doc.projects || [],
    certifications: doc.certifications || [],
    experience: doc.experience || [],
    updatedAt: doc.updatedAt || doc.updated_at
  };
}

async function savePortfolioToDb(data) {
  if (!isMongoConnected()) return false;
  const updatePayload = {
    personalInfo: data.personalInfo,
    skills: data.skills,
    projects: data.projects,
    certifications: data.certifications,
    experience: data.experience,
    updatedAt: new Date()
  };

  await PortfolioModel.findOneAndUpdate(
    { key: 'main_portfolio' },
    updatePayload,
    { upsert: true, new: true }
  );
  return true;
}

async function updateSectionInDb(section, sectionData) {
  if (!isMongoConnected()) return false;
  await PortfolioModel.findOneAndUpdate(
    { key: 'main_portfolio' },
    { [section]: sectionData, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  return true;
}

async function seedFromLocalIfEmpty(localData) {
  if (!isMongoConnected() || !localData) return;
  try {
    const count = await PortfolioModel.countDocuments({ key: 'main_portfolio' });
    if (count === 0) {
      console.log('🌱 [Database] Seeding initial portfolio data into MongoDB Atlas...');
      await savePortfolioToDb(localData);
      console.log('✅ [Database] Seed completed successfully.');
    }
  } catch (e) {
    console.warn('Could not check/seed database:', e.message);
  }
}

async function getMessagesFromDb() {
  if (!isMongoConnected()) return null;
  const messages = await MessageModel.find().sort({ createdAt: -1 }).lean();
  return messages.map((m) => ({
    id: m._id.toString(),
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    read: m.read,
    createdAt: m.createdAt
  }));
}

async function saveMessageToDb(msg) {
  if (!isMongoConnected()) return null;
  const doc = await MessageModel.create({
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    read: false,
    createdAt: new Date()
  });
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    subject: doc.subject,
    message: doc.message,
    read: doc.read,
    createdAt: doc.createdAt
  };
}

async function markMessageReadInDb(id, read) {
  if (!isMongoConnected()) return false;
  await MessageModel.findByIdAndUpdate(id, { read });
  return true;
}

async function deleteMessageInDb(id) {
  if (!isMongoConnected()) return false;
  await MessageModel.findByIdAndDelete(id);
  return true;
}

module.exports = {
  initDatabase,
  isMongoConnected,
  getPortfolioFromDb,
  savePortfolioToDb,
  updateSectionInDb,
  seedFromLocalIfEmpty,
  getMessagesFromDb,
  saveMessageToDb,
  markMessageReadInDb,
  deleteMessageInDb
};
