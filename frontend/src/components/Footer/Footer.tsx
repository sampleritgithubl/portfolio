import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiTwitter, FiHeart, FiArrowUp, FiMail } from 'react-icons/fi';
import { personalInfo } from '../../data/portfolio';
import './Footer.css';

const NAV_LINKS = ['Home', 'About', 'Skills', 'Projects', 'Certifications', 'Contact'];

const SOCIALS = [
  { icon: <FiGithub />, href: personalInfo.github, label: 'GitHub' },
  { icon: <FiLinkedin />, href: personalInfo.linkedin, label: 'LinkedIn' },
  { icon: <FiTwitter />, href: personalInfo.twitter, label: 'Twitter' },
  { icon: <FiMail />, href: `mailto:${personalInfo.email}`, label: 'Email' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      {/* Animated gradient line at the top */}
      <div className="footer-gradient-line" />
      <div className="footer-glow" />

      <div className="container footer-content">
        {/* Top section */}
        <motion.div
          className="footer-top"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="footer-cta">
            <h3 className="footer-cta-title">
              Let's Build Something <span className="gradient-text">Amazing</span>
            </h3>
            <p className="footer-cta-sub">
              Ready to bring your ideas to life? Let's create extraordinary digital experiences together.
            </p>
            <a href="#contact" className="btn-primary footer-cta-btn">
              <span>Get In Touch</span>
              <FiMail size={16} />
            </a>
          </div>
        </motion.div>

        {/* Main footer grid */}
        <div className="footer-main-grid">
          {/* Brand column */}
          <motion.div
            className="footer-brand"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="footer-logo">
              <span className="logo-bracket">&lt;</span>
              <span className="footer-logo-name">KR</span>
              <span className="logo-bracket">/&gt;</span>
            </div>
            <p className="footer-tagline">{personalInfo.title}</p>
            <p className="footer-uni">🎓 {personalInfo.subtitle}</p>
            <div className="footer-status">
              <span className="badge-dot" />
              <span>Available for hire</span>
            </div>
          </motion.div>

          {/* Navigation column */}
          <motion.div
            className="footer-nav"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="footer-col-heading">Navigation</h4>
            <div className="footer-links">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link}
                  className="footer-link"
                  onClick={() => document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                  whileHover={{ x: 6 }}
                >
                  <span className="footer-link-arrow">→</span>
                  {link}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Connect column */}
          <motion.div
            className="footer-connect"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="footer-col-heading">Connect</h4>
            <div className="footer-socials">
              {SOCIALS.map((s, i) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-icon"
                  aria-label={s.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 300 }}
                  whileHover={{ y: -4, scale: 1.15 }}
                >
                  {s.icon}
                  <span className="social-tooltip">{s.label}</span>
                </motion.a>
              ))}
            </div>
            <p className="footer-email">{personalInfo.email}</p>
          </motion.div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copy">
            © {year} Kavindu Rasanjana. Crafted with{' '}
            <FiHeart className="footer-heart" /> and{' '}
            <span className="footer-highlight">passion</span>
          </p>
          <p className="footer-tech">React · Three.js · TypeScript · Node.js</p>
          <motion.button
            className="footer-scroll-top"
            onClick={scrollToTop}
            whileHover={{ y: -4, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll to top"
          >
            <FiArrowUp size={18} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
