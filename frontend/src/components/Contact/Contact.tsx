import { useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { FiSend, FiMapPin, FiMail, FiPhone, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import { personalInfo as fallbackPersonalInfo } from '../../data/portfolio';
import { usePortfolio, API_BASE } from '../../context/PortfolioContext';
import './Contact.css';

export default function Contact() {
  const { data } = usePortfolio();
  const personalInfo = data.personalInfo || fallbackPersonalInfo;
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // 1. Post to backend to save into inbox & send email
      try {
        await axios.post(`${API_BASE}/api/contact`, form);
      } catch (backendErr) {
        console.warn('Backend API request encountered an error, trying EmailJS fallback', backendErr);
      }

      // 2. EmailJS backup if configured
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        try {
          await emailjs.send(
            serviceId,
            templateId,
            {
              from_name: form.name,
              from_email: form.email,
              subject: form.subject,
              message: form.message,
              reply_to: form.email,
            },
            publicKey
          );
        } catch (e) {
          console.error('EmailJS error:', e);
        }
      }

      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 6000);
    } catch (error) {
      console.error('Failed to transmit message:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 6000);
    }
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="glow-orb contact-orb-1" />
      <div className="glow-orb contact-orb-2" />
      <div className="grid-overlay" />

      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="section-tag">📬 Let's Connect</div>
          <h2 className="section-title">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="section-subtitle">
            Have a project in mind or want to collaborate? I'm always open to discussing
            new opportunities and creative ideas.
          </p>
        </motion.div>

        <div className="contact-grid">
          {/* Left: Info */}
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="contact-info-card glass-card">
              <div className="contact-available">
                <div className="available-pulse" />
                <div>
                  <div className="available-title">Available for Work</div>
                  <div className="available-sub">Open to freelance & full-time roles</div>
                </div>
              </div>

              <div className="contact-details">
                {[
                  { icon: <FiMapPin />, label: 'Location', value: personalInfo.location },
                  { icon: <FiMail />, label: 'Email', value: personalInfo.email },
                  { icon: <FiPhone />, label: 'Phone', value: personalInfo.phone },
                ].map((item) => (
                  <div key={item.label} className="contact-detail-item">
                    <div className="contact-detail-icon">{item.icon}</div>
                    <div>
                      <div className="contact-detail-label">{item.label}</div>
                      <a 
                        href={item.label === 'Email' ? `mailto:${item.value}` : item.label === 'Phone' ? `tel:${item.value}` : undefined} 
                        className={item.label === 'Email' || item.label === 'Phone' ? 'contact-detail-link' : 'contact-detail-value'}
                        target={item.label === 'Email' ? '_blank' : undefined}
                        rel="noreferrer"
                      >
                        {item.value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="contact-social-label">Connect Online</div>
              <div className="contact-socials">
                {[
                  { icon: <FiGithub />, href: personalInfo.github, label: 'GitHub' },
                  { icon: <FiLinkedin />, href: personalInfo.linkedin, label: 'LinkedIn' },
                  { icon: <FiTwitter />, href: personalInfo.twitter, label: 'Twitter' },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label={s.label}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quote card */}
            <div className="quote-card glass-card">
              <div className="quote-icon">"</div>
              <p className="quote-text">
                Every great software is built on the foundations of clear communication and shared vision.
              </p>
              <div className="quote-author">— Kavindu Rasanjana</div>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <form
              ref={formRef}
              className="contact-form glass-card"
              onSubmit={handleSubmit}
            >
              <h3 className="form-title">Send a Message</h3>
              <p className="form-subtitle-inline">Have a question? Feel free to contact me directly.</p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Your Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="form-input"
                  placeholder="What is this regarding?"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-input form-textarea"
                  placeholder="Tell me about your project or inquiry..."
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary form-submit"
                disabled={status === 'sending'}
              >
                <span>
                  {status === 'sending' ? 'Sending Message...' : status === 'success' ? '✅ Message Sent Successfully!' : status === 'error' ? '❌ Sending Failed. Try Again' : 'Send Message'}
                </span>
                {status === 'idle' && <FiSend size={16} />}
              </button>

              {status === 'success' && (
                <motion.div 
                  className="form-success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  🎉 Your message was sent successfully! I'll get back to you within 24 hours.
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div 
                  className="form-error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ⚠️ Something went wrong. Please try reaching out via email directly at {personalInfo.email}.
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
