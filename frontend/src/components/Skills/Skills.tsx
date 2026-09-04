import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { skills as fallbackSkills } from '../../data/portfolio';
import { usePortfolio } from '../../context/PortfolioContext';
import './Skills.css';

const categories = ['All', 'Frontend', 'Backend', 'Database', 'Mobile', 'AI/ML', 'DevOps'];

export default function Skills() {
  const { data } = usePortfolio();
  const skills = data.skills || fallbackSkills;
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered =
    activeCategory === 'All'
      ? skills
      : skills.filter((s) => s.category === activeCategory);

  return (
    <section id="skills" className="section skills-section">
      <div className="glow-orb skills-orb-1" />
      <div className="glow-orb skills-orb-2" />
      <div className="grid-overlay" />

      <div className="container">
        {/* Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-tag">💡 Technical Skills</div>
          <h2 className="section-title">
            My <span className="gradient-text">Tech Stack</span>
          </h2>
          <p className="section-subtitle">
            A curated set of tools, frameworks, and technologies I use to build
            scalable, intelligent, and beautiful products.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="skill-filters"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <motion.div className="skills-grid" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((skill, i) => (
              <motion.div
                key={skill.name}
                className="skill-card"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {/* Left color accent line */}
                <div
                  className="skill-accent"
                  style={{ background: skill.color }}
                />

                <div className="skill-content">
                  {/* Top row: name + level */}
                  <div className="skill-row-top">
                    <div className="skill-labels">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-category" style={{ color: skill.color }}>
                        {skill.category}
                      </span>
                    </div>
                    <span className="skill-level" style={{ color: skill.color }}>
                      {skill.level}<span className="skill-level-pct">%</span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="skill-bar-bg">
                    <motion.div
                      className="skill-bar-fill"
                      style={{
                        background: `linear-gradient(90deg, ${skill.color}70, ${skill.color})`,
                      }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1.1,
                        delay: 0.2 + i * 0.04,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    />
                  </div>
                </div>

                {/* Subtle hover glow */}
                <div
                  className="skill-hover-glow"
                  style={{ background: skill.color }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
