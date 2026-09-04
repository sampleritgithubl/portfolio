const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Gemini AI Setup ───
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are Kavi — a friendly, concise AI assistant on Kavindu Rasanjana's personal portfolio website.

About Kavindu Rasanjana:
- AI-Powered Full Stack Developer & Mobile App Developer based in Sri Lanka
- Undergraduate at Rajarata University of Sri Lanka (B.Sc.)
- Has built 10+ practical projects, holds 6+ technology certifications
- Available for hire and collaboration

Skills:
- Frontend: React.js (92%), TypeScript (88%), Next.js (85%), Three.js (78%)
- Backend: Node.js (90%), Express.js (88%), Python (82%), FastAPI (75%)
- Database: MongoDB (85%), PostgreSQL (80%)
- Mobile: React Native (82%), Flutter (74%)
- AI/ML: TensorFlow (70%)
- DevOps: Docker (78%), AWS (72%), Git (92%)

Education & Milestone Journey:
- Undergraduate Student (B.Sc.) at Rajarata University of Sri Lanka (2023–Present)
- Independent Software Developer (2023–Present): Shipped 10+ web and mobile software projects.
- Self-Taught Developer Journey (2022–2023): Focused on advanced JavaScript/TypeScript, cloud deployment, and system architecture.

Certifications: AWS Solutions Architect, Google Professional Cloud Developer, Meta React Native Specialist, TensorFlow Developer Certificate, MongoDB Certified Developer, Docker Certified Associate

Featured Projects:
1. AI Chat Platform (React, Node.js, OpenAI, MongoDB, Socket.io)
2. Smart E-Commerce App (Next.js, Node.js, PostgreSQL, Stripe, Redis)
3. Health Tracker Mobile App (React Native, Python, FastAPI, TensorFlow)
4. DevOps Dashboard (React, Docker, AWS, Grafana)
5. 3D Portfolio Builder (Three.js, React, Node.js, MongoDB)
6. ML Image Recognition API (Python, TensorFlow, FastAPI, Docker, AWS)

Contact: Through the contact form on this website, or GitHub: github.com/sampleritgithubl, LinkedIn: linkedin.com/in/kavindu-rasanjana-08002b266/

Guidelines:
- Keep answers SHORT and FRIENDLY (2-4 sentences max unless a longer answer is truly needed)
- If asked about experience, explain that he is an undergraduate at Rajarata University of Sri Lanka with hands-on project experience building 10+ software systems.
- If asked about hiring or collaboration, encourage them to use the contact form
- If asked something unrelated to Kavindu's portfolio, politely redirect
- Never make up information about Kavindu not listed above
- Respond in a warm, professional tone`;

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'AI service not configured.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build chat history in Gemini format
    const chatHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'System instructions: ' + SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: "Understood! I'm Kavi, Kavindu's AI assistant. I'm ready to help answer questions about his skills, experience, and projects!" }] },
        ...chatHistory,
      ],
      generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
  }
});

// ─── Admin & Portfolio Routes ───
const { router: adminRouter, saveIncomingMessage } = require('./routes/admin');
app.use('/api/admin', adminRouter);
app.use('/api', adminRouter); // Allows GET /api/portfolio

// ─── Email Contact ───
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // 1. Save message to database (messages.json)
  const savedMessage = saveIncomingMessage({ name, email, subject, message });

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO || process.env.EMAIL_USER,
    replyTo: email,
    subject: `[Portfolio] ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #060918; color: #F0F4FF; padding: 40px; border-radius: 16px;">
        <div style="border-bottom: 2px solid #00D4FF; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="color: #00D4FF; margin: 0; font-size: 24px;">New Portfolio Message</h1>
          <p style="color: #8B9ABE; margin: 8px 0 0;">From your portfolio contact form</p>
        </div>
        <div style="margin-bottom: 20px;">
          <p style="color: #8B9ABE; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">From</p>
          <p style="color: #F0F4FF; font-size: 16px; font-weight: 600; margin: 0;">${name}</p>
          <p style="color: #00D4FF; font-size: 14px; margin: 4px 0 0;">${email}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <p style="color: #8B9ABE; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Subject</p>
          <p style="color: #F0F4FF; font-size: 16px; font-weight: 600; margin: 0;">${subject}</p>
        </div>
        <div>
          <p style="color: #8B9ABE; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Message</p>
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 20px;">
            <p style="color: #F0F4FF; line-height: 1.7; margin: 0;">${message.replace(/\n/g, '<br/>')}</p>
          </div>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.08); margin-top: 32px; padding-top: 20px; text-align: center;">
          <p style="color: #4A5568; font-size: 12px; margin: 0;">Kavindu Rasanjana Portfolio · ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Message sent successfully and saved!', savedMessage });
  } catch (error) {
    console.error('Email error (message saved to DB anyway):', error);
    // Even if email fails or Gmail credentials aren't set, message is already safely stored in DB!
    res.status(200).json({ success: true, message: 'Message received and saved to admin inbox!', savedMessage });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`🤖 Chat API: POST http://localhost:${PORT}/api/chat`);
  console.log(`📬 Contact API: POST http://localhost:${PORT}/api/contact\n`);
});


