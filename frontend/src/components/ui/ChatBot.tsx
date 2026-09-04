import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import './ChatBot.css';
import {
  personalInfo,
  skills,
  projects,
  certifications,
  experience,
} from '../../data/portfolio';

// ─── Types ───────────────────────────────────────────────
interface Message {
  id: number;
  from: 'bot' | 'user';
  text: string;
  time: string;
}

// ─── Knowledge Base ───────────────────────────────────────
const RESPONSES: Array<{ patterns: RegExp[]; reply: () => string }> = [
  {
    patterns: [/^hi|^hello|^hey|^sup|^what.?s up|^yo\b/i],
    reply: () =>
      `Hey there! 👋 I'm Kavi-Bot, Kavindu's personal AI assistant. Ask me anything about his skills, projects, experience, or how to get in touch!`,
  },
  {
    patterns: [/who are you|about you|introduce|yourself/i],
    reply: () =>
      `I'm **Kavi-Bot** — a smart assistant built for ${personalInfo.name}'s portfolio. I can answer questions about his work, stack, certifications, or contact info. What would you like to know? 🚀`,
  },
  {
    patterns: [/who is kavindu|about kavindu|tell me about him|bio|background/i],
    reply: () =>
      `${personalInfo.name} is an **${personalInfo.title}** based in ${personalInfo.location}. ${personalInfo.bio}\n\n📊 ${personalInfo.experience} years of experience · ${personalInfo.projects} projects shipped · ${personalInfo.certifications} certifications`,
  },
  {
    patterns: [/skill|tech|stack|language|framework|know|expertise/i],
    reply: () => {
      const cats = [...new Set(skills.map((s) => s.category))];
      return (
        `Here's Kavindu's tech stack by category:\n\n` +
        cats
          .map((cat) => {
            const catSkills = skills.filter((s) => s.category === cat);
            return `**${cat}**: ${catSkills.map((s) => `${s.name} (${s.level}%)`).join(', ')}`;
          })
          .join('\n')
      );
    },
  },
  {
    patterns: [/project|portfolio|built|work|made/i],
    reply: () => {
      const featured = projects.filter((p) => p.featured);
      return (
        `Here are Kavindu's featured projects:\n\n` +
        featured
          .map(
            (p) =>
              `🔹 **${p.title}** — ${p.description.slice(0, 80)}...\n   Stack: ${p.tech.join(', ')}`
          )
          .join('\n\n') +
        `\n\nHe has ${projects.length} total projects. Want details on any specific one?`
      );
    },
  },
  {
    patterns: [/experience|work history|job|company|role|career/i],
    reply: () =>
      `Kavindu's professional journey:\n\n` +
      experience
        .map((e) => `📅 **${e.year}** — ${e.role} @ ${e.company}\n   ${e.description}`)
        .join('\n\n'),
  },
  {
    patterns: [/cert|certif|course|qualification|award/i],
    reply: () =>
      `Kavindu holds **${certifications.length}** professional certifications:\n\n` +
      certifications
        .map((c) => `${c.icon} **${c.title}** — ${c.issuer} (${c.date})`)
        .join('\n'),
  },
  {
    patterns: [/contact|email|reach|hire|available|message|connect/i],
    reply: () =>
      `You can reach Kavindu at:\n\n📧 Email: ${personalInfo.email}\n📞 Phone: ${personalInfo.phone}\n💼 LinkedIn: ${personalInfo.linkedin}\n🐙 GitHub: ${personalInfo.github}\n\nHe is currently **${personalInfo.status}** — great time to connect! 🎯`,
  },
  {
    patterns: [/location|based|country|where|sri lanka/i],
    reply: () =>
      `Kavindu is based in **${personalInfo.location}** 🇱🇰. He works with clients and teams globally.`,
  },
  {
    patterns: [/react|node|python|typescript|flutter|mobile|ai|ml|aws|docker/i],
    reply: () => {
      return `Kavindu has strong expertise in that area! Here are his top skills:\n\n${skills
        .filter((s) => s.level >= 80)
        .map((s) => `⚡ ${s.name} — ${s.level}%`)
        .join('\n')}\n\nWant to see his projects using a specific technology?`;
    },
  },
  {
    patterns: [/thanks|thank you|great|awesome|cool|perfect|nice/i],
    reply: () =>
      `You're welcome! 😊 Feel free to ask anything else about Kavindu, or use the contact details to get in touch directly!`,
  },
  {
    patterns: [/bye|goodbye|see you|cya/i],
    reply: () =>
      `Goodbye! 👋 Hope to chat again soon. Don't hesitate to reach out to Kavindu — he'd love to hear from you! 🚀`,
  },
];

const FALLBACK_REPLIES = [
  `Hmm, I'm not sure about that specific topic. Try asking about Kavindu's **skills**, **projects**, **experience**, or **contact info**!`,
  `Great question! I'm best at answering questions about Kavindu's tech stack, work history, and projects. What would you like to know?`,
  `I didn't quite catch that. You can ask me things like "What are his skills?", "Show me his projects", or "How do I contact him?"`,
];

function getBotReply(input: string): string {
  const trimmed = input.trim();
  for (const entry of RESPONSES) {
    if (entry.patterns.some((r) => r.test(trimmed))) {
      return entry.reply();
    }
  }
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

function getTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const SUGGESTIONS = ['About Kavindu', 'Skills & Stack', 'Projects', 'Experience', 'Contact Info'];

// ─── Bot Icon SVG ─────────────────────────────────────────
const BotIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <rect x="6" y="10" width="20" height="16" rx="5" fill="white" fillOpacity="0.95" />
    {/* Eyes */}
    <circle cx="11.5" cy="17" r="2.2" fill="#00D4FF" />
    <circle cx="20.5" cy="17" r="2.2" fill="#8B5CF6" />
    <circle cx="12.2" cy="16.3" r="0.8" fill="white" />
    <circle cx="21.2" cy="16.3" r="0.8" fill="white" />
    {/* Mouth */}
    <path d="M12 21.5 Q16 23.5 20 21.5" stroke="#060918" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    {/* Antenna */}
    <line x1="16" y1="10" x2="16" y2="6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="16" cy="5" r="2" fill="#00D4FF" />
    {/* Ears */}
    <rect x="3" y="14" width="3" height="6" rx="1.5" fill="white" fillOpacity="0.7" />
    <rect x="26" y="14" width="3" height="6" rx="1.5" fill="white" fillOpacity="0.7" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Component ────────────────────────────────────────────
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: 'bot',
      text: `Hi! 👋 I'm **Kavi-Bot**, Kavindu's personal assistant. Ask me anything about his skills, projects, experience, or how to reach him!`,
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleOpen = () => {
    setOpen(true);
    setShowBadge(false);
  };

  const sendMessage = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;

    const userMsg: Message = { id: Date.now(), from: 'user', text: msg, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const delay = 800 + Math.random() * 600;
    setTimeout(() => {
      const botReply = getBotReply(msg);
      const botMsg: Message = { id: Date.now() + 1, from: 'bot', text: botReply, time: getTime() };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Render bold markdown (**text**) in message
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i} style={{ whiteSpace: 'pre-line' }}>{part}</span>
      )
    );
  };

  return (
    <>
      {/* ── Chat Window ── */}
      <div className={`chatbot-window ${open ? 'open' : ''}`} aria-hidden={!open}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-avatar">
            <BotIcon />
          </div>
          <div className="chatbot-info">
            <div className="chatbot-name">Kavi-Bot</div>
            <div className="chatbot-status">● Online — always ready</div>
          </div>
          <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close chat">
            <CloseIcon />
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="chatbot-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.from}`}>
              <div className="msg-avatar">
                {msg.from === 'bot' ? <BotIcon /> : 'K'}
              </div>
              <div>
                <div className="msg-bubble">{renderText(msg.text)}</div>
                <span className="msg-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-message bot">
              <div className="msg-avatar"><BotIcon /></div>
              <div className="msg-bubble" style={{ padding: '10px 16px' }}>
                <div className="typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chatbot-input-area">
          <input
            id="chatbot-input"
            className="chatbot-input"
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            aria-label="Chat input"
          />
          <button
            className="chatbot-send"
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>

      {/* ── Floating Action Button ── */}
      <button
        id="chatbot-fab"
        className={`chatbot-fab ${open ? 'open' : ''}`}
        onClick={open ? () => setOpen(false) : handleOpen}
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
      >
        {showBadge && !open && <span className="chatbot-badge">1</span>}
        {open ? (
          <CloseIcon />
        ) : (
          <BotIcon />
        )}
      </button>
    </>
  );
}
