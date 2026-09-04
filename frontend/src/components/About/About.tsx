import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import { personalInfo as fallbackPersonalInfo, experience as fallbackExperience } from '../../data/portfolio';
import { usePortfolio } from '../../context/PortfolioContext';
import AboutProfilePhoto from './AboutProfilePhoto';
import './About.css';

function CounterNum({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1800;
          const step = () => {
            start += duration / 60;
            const progress = Math.min(start / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            if (ref.current) ref.current.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

const TICKER_ROW1 = ['React', 'Node.js', 'TypeScript', 'Python', 'MongoDB', 'AWS', 'Docker', 'Three.js', 'FastAPI', 'React Native', 'Next.js', 'PostgreSQL', 'TensorFlow', 'GraphQL'];
const TICKER_ROW2 = ['Full Stack Dev', 'AI Engineer', 'Mobile Dev', 'UI/UX Design', 'Cloud Infra', 'Machine Learning', 'API Design', 'Open Source', 'Problem Solver', 'Team Player', 'DevOps', 'Data Science'];

function TickerBand({ items, direction = 'left', colorClass = 'ticker-blue' }: { items: string[]; direction?: 'left' | 'right'; colorClass?: string }) {
  const tripled = [...items, ...items, ...items];
  return (
    <div className={`ticker-band ${colorClass}`}>
      <div className={`ticker-track ${direction === 'right' ? 'ticker-reverse' : ''}`}>
        {tripled.map((item, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-star">✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function About() {
  const { data } = usePortfolio();
  const personalInfo = data.personalInfo || fallbackPersonalInfo;
  const experience = data.experience || fallbackExperience;

  return (
    <section id="about" className="section about-section">
      <div className="glow-orb about-orb" />
      <div className="grid-overlay" />

      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="section-tag">⚡ About Me</div>
          <h2 className="section-title">
            Crafting the <span className="gradient-text">Future</span> of Digital
          </h2>
          <p className="section-subtitle">
            Passionate developer merging creativity with cutting-edge technology to build
            impactful, intelligent applications.
          </p>
        </motion.div>



        <div className="about-grid">
          {/* Left: Bio + Stats */}
          <motion.div
            className="about-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="about-bio-card glass-card">
              <AboutProfilePhoto />

              <div className="about-bio-text">
                <h3 className="about-bio-name">
                  {personalInfo.name}
                </h3>
                <p className="about-bio-role gradient-text">{personalInfo.title}</p>
                <p className="about-bio-desc">{personalInfo.bio}</p>

                <div className="about-info-grid">
                  {[
                    { label: '📍 Location', value: personalInfo.location },
                    { label: '📧 Email', value: personalInfo.email },
                    { label: '🏫 University', value: 'Rajarata University of SL' },
                    { label: '🎯 Focus', value: 'AI & Full Stack' },
                  ].map((item) => (
                    <div key={item.label} className="about-info-item">
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Social Buttons */}
                <div className="about-bio-buttons">
                  <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="btn-outline about-btn">
                    <FiGithub size={16} />
                    <span>GitHub</span>
                  </a>
                  <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="btn-primary about-btn">
                    <FiLinkedin size={16} />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="about-stats-grid">
              {[
                { label: 'Projects Built', value: 10, suffix: '+', color: 'var(--cyan)' },
                { label: 'Academic Year', value: 3, suffix: 'rd Year', color: 'var(--violet)' },
                { label: 'Hackathons / Events', value: 5, suffix: '+', color: 'var(--pink)' },
                { label: 'Certifications', value: 6, suffix: '+', color: 'var(--gold)' },
              ].map((s) => (
                <div key={s.label} className="stat-card glass-card" style={{ '--accent': s.color } as React.CSSProperties}>
                  <div className="stat-card-value" style={{ color: s.color }}>
                    <CounterNum target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="stat-card-label">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Education & Milestones Timeline */}
          <motion.div
            className="about-right"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="timeline-heading">
              <span className="section-tag">🎓 Education & Milestones</span>
            </h3>
            <div className="timeline">
              {experience.map((exp, i) => (
                <motion.div
                  key={i}
                  className="timeline-item"
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                >
                  <div className="timeline-dot" style={{ background: exp.color, boxShadow: `0 0 16px ${exp.color}` }} />
                  <div className="timeline-content glass-card">
                    <div className="tl-year" style={{ color: exp.color }}>{exp.year}</div>
                    <div className="tl-role">{exp.role}</div>
                    <div className="tl-company">{exp.company}</div>
                    <p className="tl-desc">{exp.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Skills overview chips */}
            <div className="about-chips-wrap">
              <p className="chips-label">Core Technologies</p>
              <div className="about-chips">
                {['React', 'Node.js', 'TypeScript', 'Python', 'MongoDB', 'AWS', 'Docker', 'Three.js', 'React Native', 'FastAPI'].map((chip) => (
                  <span key={chip} className="chip">{chip}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Full-width Scrolling Ticker Bands at bottom ── */}
      <div className="about-ticker-wrap">
        <div className="ticker-diagonal-row ticker-row-top">
          <TickerBand items={TICKER_ROW1} direction="left" colorClass="ticker-blue" />
        </div>
        <div className="ticker-diagonal-row ticker-row-bottom">
          <TickerBand items={TICKER_ROW2} direction="right" colorClass="ticker-white" />
        </div>
      </div>
    </section>
  );
}
