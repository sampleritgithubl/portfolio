import { motion } from 'framer-motion';
import './AboutProfilePhoto.css';

export default function AboutProfilePhoto() {
  return (
    <div className="about-photo-wrapper">
      {/* Ambient background glow */}
      <div className="about-photo-glow" />

      {/* Main Card Container */}
      <motion.div
        className="about-photo-card glass-card"
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Gradient Border Frame */}
        <div className="about-photo-border">
          <div className="about-photo-frame">
            <img
              src="/kavindu_about.jpg"
              alt="Kavindu Rasanjana"
              className="about-photo-img"
            />
            {/* Subtle gloss shine overlay */}
            <div className="about-photo-gloss" />
          </div>
        </div>

        {/* Floating Status Badge */}
        <motion.div
          className="about-photo-badge"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="badge-pulse-dot" />
          <span className="badge-text">Available for Hire</span>
        </motion.div>

        {/* Tech Focus Tag Badge */}
        <div className="about-photo-tag">
          <span>Full Stack & AI Specialist</span>
        </div>
      </motion.div>
    </div>
  );
}
