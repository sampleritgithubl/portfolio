import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  FaNodeJs, FaReact, FaPython, FaJava, FaFigma, FaGithub, 
} from 'react-icons/fa';
import { 
  SiJavascript, SiMysql, SiFlutter, SiKotlin, SiOpenai, 
  SiPinterest, SiCanva, SiFramer, SiTypescript, SiDocker,
  SiNextdotjs, SiTailwindcss
} from 'react-icons/si';
import { TbBrandBlender } from 'react-icons/tb';
import './Hero.css';

/* 
  Icon positions spread widely across the full hero, 
  some very close to the photo for an enveloping effect
*/
const devIcons = [
  { Icon: FaNodeJs,     color: '#68A063', top: '8%',  left: '3%',   size: 44, delay: 0.0 },
  { Icon: SiJavascript, color: '#F7DF1E', top: '5%',  left: '22%',  size: 36, delay: 0.15, hideOnMobile: true },
  { Icon: SiTypescript, color: '#3178C6', top: '28%', left: '2%',   size: 40, delay: 0.3 },
  { Icon: FaReact,      color: '#61DAFB', top: '42%', left: '15%',  size: 50, delay: 0.45 },
  { Icon: FaPython,     color: '#FFD43B', top: '58%', left: '4%',   size: 38, delay: 0.6 },
  { Icon: FaJava,       color: '#f89820', top: '20%', left: '33%',  size: 34, delay: 0.75, hideOnMobile: true },
  { Icon: SiMysql,      color: '#4479A1', top: '70%', left: '10%',  size: 36, delay: 0.9 },
  { Icon: SiFlutter,    color: '#54C5F8', top: '52%', left: '30%',  size: 42, delay: 1.05, hideOnMobile: true },
  { Icon: SiKotlin,     color: '#7F52FF', top: '82%', left: '22%',  size: 34, delay: 1.2, hideOnMobile: true },
  { Icon: SiDocker,     color: '#2496ED', top: '88%', left: '5%',   size: 40, delay: 1.35 },
  { Icon: SiNextdotjs,  color: '#FFFFFF', top: '72%', left: '34%',  size: 36, delay: 1.5, hideOnMobile: true },
];

const designIcons = [
  { Icon: SiPinterest,    color: '#E60023', top: '8%',  right: '3%',   size: 40, delay: 0.1 },
  { Icon: SiFramer,       color: '#7C3AED', top: '5%',  right: '22%',  size: 36, delay: 0.25, hideOnMobile: true },
  { Icon: FaGithub,       color: '#E6EDF3', top: '28%', right: '2%',   size: 44, delay: 0.4 },
  { Icon: FaFigma,        color: '#F24E1E', top: '42%', right: '16%',  size: 48, delay: 0.55 },
  { Icon: TbBrandBlender, color: '#ea7600', top: '58%', right: '4%',   size: 40, delay: 0.7 },
  { Icon: SiCanva,        color: '#00C4CC', top: '20%', right: '32%',  size: 34, delay: 0.85, hideOnMobile: true },
  { Icon: SiOpenai,       color: '#00A67E', top: '70%', right: '12%',  size: 38, delay: 1.0 },
  { Icon: SiTailwindcss,  color: '#06B6D4', top: '52%', right: '30%',  size: 36, delay: 1.15, hideOnMobile: true },
  { Icon: SiMysql,        color: '#4479A1', top: '82%', right: '20%',  size: 34, delay: 1.3, hideOnMobile: true },
  { Icon: FaPython,       color: '#FFD43B', top: '88%', right: '5%',   size: 38, delay: 1.45 },
];

function FloatingIcon({ Icon, color, top, left, right, size, delay, hideOnMobile }: any) {
  const dir = left ? 1 : -1;
  return (
    <motion.div
      className={`fi-wrap ${hideOnMobile ? 'fi-hide-mobile' : ''}`}
      style={{ top, left, right, '--glow': color } as any}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 160, damping: 12 }}
    >
      <motion.div
        animate={{
          y: [0, dir * -18, dir * 6, 0],
          x: [0, dir * 5, dir * -3, 0],
          rotate: [0, dir * 8, dir * -4, 0],
        }}
        transition={{
          duration: 5 + delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="fi-box"
        whileHover={{ scale: 1.25 }}
      >
        <Icon size={size} color={color} />
      </motion.div>
    </motion.div>
  );
}

function Photo3D() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [14, -14]), { stiffness: 100, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-14, 14]), { stiffness: 100, damping: 18 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <motion.div
      className="photo-3d-outer"
      onMouseMove={onMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
    >
      {/* Bottom light puddle */}
      <div className="photo-ground-glow" />
      {/* Image — mix-blend-mode removes background */}
      <img
        src="/images/kavindu.png" 
        alt="Kavindu Rasanjana"
        className="photo-no-bg"
      />
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section id="home" className="hero-scene" aria-label="Hero - Kavindu Rasanjana, AI-Powered Full Stack Developer">
      {/* SEO: Single h1 for the entire page, visually hidden to preserve design */}
      <h1 className="sr-only">Kavindu Rasanjana — AI-Powered Full Stack Developer &amp; Mobile App Developer from Sri Lanka</h1>
      <p className="sr-only">
        Undergraduate at Rajarata University of Sri Lanka. Expert in React, Node.js, TypeScript, Python, 
        React Native, Flutter, TensorFlow, Docker, and AWS. 10+ projects built, 6+ certifications earned. 
        Available for hire and collaboration.
      </p>
      {/* Ambient background orbs */}
      <div className="orb orb-cyan" />
      <div className="orb orb-orange" />
      <div className="orb orb-violet" />

      {/* Scanline grid overlay */}
      <div className="hero-grid" />

      <div className="scene-inner">
        {/* Huge glowing background name */}
        <div className="bg-name" aria-hidden="true">
          <motion.span
            className="bg-name-word"
            initial={{ opacity: 0, y: 30, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.12em' }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          >
            KAVINDU
          </motion.span>
          <motion.span
            className="bg-name-word sub"
            initial={{ opacity: 0, y: 30, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.04em' }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
          >
            RASANJANA
          </motion.span>
        </div>

        {/* Dev icons – left side */}
        {devIcons.map((item, i) => (
          <FloatingIcon key={`d${i}`} {...item} />
        ))}

        {/* Design icons – right side */}
        {designIcons.map((item, i) => (
          <FloatingIcon key={`g${i}`} {...item} />
        ))}

        {/* Center 3D photo */}
        <Photo3D />

        {/* Zone labels */}
        <div className="zone-labels">
          <motion.div className="zone-pill"
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }}>
            <span className="zpill-dot zpill-cyan" /> Development
          </motion.div>
          <motion.div className="zone-pill"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }}>
            Design <span className="zpill-dot zpill-orange" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
