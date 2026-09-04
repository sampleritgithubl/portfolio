import { motion } from 'framer-motion';
import { certifications as fallbackCertifications } from '../../data/portfolio';
import { usePortfolio } from '../../context/PortfolioContext';
import './Certifications.css';

export default function Certifications() {
  const { data } = usePortfolio();
  const certifications = data.certifications || fallbackCertifications;

  return (
    <section id="certifications" className="section cert-section">
      <div className="glow-orb cert-orb-1" />
      <div className="glow-orb cert-orb-2" />
      <div className="grid-overlay" />

      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="section-tag">🏆 Achievements</div>
          <h2 className="section-title">
            My <span className="gradient-text">Certifications</span>
          </h2>
          <p className="section-subtitle">
            Verified credentials from world-class technology providers, proving expertise
            across cloud, AI, and modern development.
          </p>
        </motion.div>

        {/* Marquee strip */}
        <div className="cert-marquee-wrap">
          <div className="cert-marquee">
            <div className="cert-marquee-track">
              {[...certifications, ...certifications].map((cert, i) => (
                <div key={i} className="cert-marquee-chip" style={{ borderColor: `${cert.color}40`, color: cert.color }}>
                  <span>{cert.icon}</span>
                  <span>{cert.issuer}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certification Cards Grid */}
        <div className="cert-grid">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.id}
              className="cert-card glass-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              style={{ '--cert-color': cert.color } as React.CSSProperties}
            >
              {/* Top line / border light effect */}
              <div className="cert-top-bar" style={{ background: cert.color }} />

              {/* Certificate Image Frame */}
              <div className="cert-image-container">
                <img src={cert.image} alt={cert.title} className="cert-image" loading="lazy" />
                <div className="cert-image-overlay" />
                
                {/* Float Badge */}
                <div className="cert-badge" style={{ background: `rgba(10, 15, 30, 0.75)`, border: `1px solid ${cert.color}40`, color: cert.color }}>
                  <span className="cert-badge-icon">{cert.icon}</span>
                  <span className="cert-badge-text">{cert.date}</span>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="cert-content">
                <div className="cert-header-meta">
                  <span className="cert-issuer">{cert.issuer}</span>
                  <div className="cert-verify">
                    <span className="cert-verify-dot" />
                    <span>Verified</span>
                  </div>
                </div>

                <h3 className="cert-title">{cert.title}</h3>

                <div className="cert-id">
                  <span className="cert-id-label">Credential ID</span>
                  <span className="cert-id-value">{cert.credentialId}</span>
                </div>

                {/* Interactive link/action */}
                <div className="cert-action" style={{ color: cert.color }}>
                  <span>Verify Credential</span>
                  <svg className="cert-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ stroke: cert.color }}>
                    <path d="M6 12L10 8L6 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
