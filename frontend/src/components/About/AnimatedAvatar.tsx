import { motion } from 'framer-motion';
import './AnimatedAvatar.css';

export default function AnimatedAvatar() {
  return (
    <div className="av-wrap">
      {/* ── Soft background glow ── */}
      <div className="av-bg-glow" />

      {/* ── Main photo card ── */}
      <motion.div
        className="av-photo-outer"
        whileHover={{ y: -6 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Gradient border */}
        <div className="av-photo-border">
          <div className="av-photo-inner">
            <img
              src="/kavindu.png" 
              alt="Kavindu Rasanjana"
              className="av-photo-img"
            />
            {/* Subtle gloss overlay */}
            <div className="av-photo-gloss" />
          </div>
        </div>

        {/* Shadow beneath */}
        <div className="av-photo-shadow" />
      </motion.div>

      {/* ── Available badge ── */}
      <motion.div
        className="av-badge"
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <span className="av-badge-dot" />
        <span>Available for Hire</span>
      </motion.div>
    </div>
  );
}

