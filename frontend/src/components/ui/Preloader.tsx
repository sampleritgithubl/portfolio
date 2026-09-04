import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { personalInfo } from '../../data/portfolio';
import './Preloader.css';

/* ═══════════════════════════════════════
   MATRIX RAIN — Canvas-based falling code
   ═══════════════════════════════════════ */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Characters: mix of katakana, latin, digits, symbols — the classic Matrix look
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/{}[]();:=+-*&^%$#@!~`|\\';

    // Each column tracks its current y-position
    const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -100);

    let animId: number;

    function render() {
      // Semi-transparent black overlay creates the trail/fade effect
      ctx!.fillStyle = 'rgba(3, 5, 10, 0.06)';
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character — bright green
        ctx!.fillStyle = `rgba(0, 255, 65, ${0.7 + Math.random() * 0.3})`;
        ctx!.font = `${fontSize}px 'Courier New', monospace`;
        ctx!.fillText(char, x, y);

        // Trail character slightly dimmer
        if (drops[i] > 1) {
          const trailChar = chars[Math.floor(Math.random() * chars.length)];
          ctx!.fillStyle = `rgba(0, 200, 50, ${0.15 + Math.random() * 0.15})`;
          ctx!.fillText(trailChar, x, y - fontSize);
        }

        // Reset drop to top once it goes past screen, with randomness
        if (y > canvas!.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.6 + Math.random() * 0.4;
      }

      animId = requestAnimationFrame(render);
    }

    render();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const cleanup = draw();
    return cleanup;
  }, [draw]);

  return <canvas ref={canvasRef} className="matrix-canvas" />;
}

/* ═══════════════════════════════════════
   TYPEWRITER — cycles through role titles
   ═══════════════════════════════════════ */
function Typewriter({ words, speed = 80, delay = 1800 }: { words: string[], speed?: number, delay?: number }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const blinkTimeout = setTimeout(() => setBlink((prev) => !prev), 500);
    return () => clearTimeout(blinkTimeout);
  }, [blink]);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), delay);
      return () => clearTimeout(timeout);
    }
    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words, speed, delay]);

  return (
    <span className="preloader-typewriter">
      {words[index].substring(0, subIndex)}
      <span className={`preloader-cursor ${blink ? 'visible' : ''}`}>|</span>
    </span>
  );
}

/* ═══════════════════════════════════════
   PRELOADER — 10-second cinematic intro
   ═══════════════════════════════════════ */
export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);

  const typewriterRoles = [
    "AI-Powered Full Stack Developer",
    "Mobile App Developer",
    "UI/UX & 3D Specialist",
    "DevOps Enthusiast"
  ];

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.05,
            filter: 'blur(10px)',
            transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1] } 
          }}
        >
          {/* Matrix rain canvas background */}
          <MatrixRain />

          {/* Dark vignette overlay on top of rain for readability */}
          <div className="matrix-vignette" />

          {/* Ambient glow orbs */}
          <div className="preloader-orb orb-1" />
          <div className="preloader-orb orb-2" />

          <div className="preloader-content-card">
            {/* 1. Badge status */}
            <motion.div 
              className="preloader-badge"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="preloader-badge-dot" />
              <span>{personalInfo.status}</span>
            </motion.div>

            {/* 2. Main Title */}
            <motion.h1 
              className="preloader-hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: 'easeOut', delay: 0.8 }}
            >
              Hi, I'm <span className="gradient-preloader-text">{personalInfo.name}</span>
            </motion.h1>

            {/* 3. Subtitle / Typewriter */}
            <motion.h2 
              className="preloader-hero-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.8 }}
            >
              I am a <Typewriter words={typewriterRoles} />
            </motion.h2>

            {/* 4. Description Bio */}
            <motion.p 
              className="preloader-hero-desc"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ duration: 1.0, delay: 2.8 }}
            >
              {personalInfo.bio}
            </motion.p>

            {/* 5. Preloader Actions */}
            <motion.div 
              className="preloader-actions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 4.0 }}
            >
              <div className="pre-btn btn-primary">
                <span>Explore My Work</span>
              </div>
              <div className="pre-btn btn-secondary">
                <span>Get In Touch</span>
              </div>
            </motion.div>
            
            {/* 6. Progress bar — fills over ~9 seconds */}
            <div className="preloader-progress-wrap">
              <motion.div 
                className="preloader-progress-bar"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 9.2, ease: 'linear' }}
              />
            </div>
            
            <motion.p 
              className="preloader-loading-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.4 }}
            >
              INITIALIZING WORKSPACE
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
