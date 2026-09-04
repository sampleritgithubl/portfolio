import { motion } from 'framer-motion';
import { FiGithub } from 'react-icons/fi';
import { projects as fallbackProjects } from '../../data/portfolio';
import { usePortfolio } from '../../context/PortfolioContext';
import HTMLCircularGallery from '../ui/HTMLCircularGallery';
import './Projects.css';

export default function Projects() {
  const { data } = usePortfolio();
  const projects = data.projects || fallbackProjects;

  return (
    <section id="projects" className="section projects-section">
      <div className="glow-orb proj-orb-1" />
      <div className="glow-orb proj-orb-2" />
      <div className="grid-overlay" />

      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="section-tag">🚀 Portfolio</div>
          <h2 className="section-title">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="section-subtitle">
            Real-world applications showcasing AI integration, full-stack mastery,
            and mobile development expertise.
          </p>
        </motion.div>

        {/* HTML/CSS 3D Circular Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <HTMLCircularGallery projects={projects} bend={120} />
        </motion.div>

        {/* View more CTA */}
        <motion.div
          className="proj-more"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <a
            href="https://github.com/kavindurasanjana"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            <FiGithub size={18} />
            View All on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
