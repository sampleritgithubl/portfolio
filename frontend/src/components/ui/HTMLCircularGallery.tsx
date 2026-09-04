import React, { useEffect, useRef, useState } from 'react';
import { FiGithub, FiExternalLink, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import './HTMLCircularGallery.css';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tech: string[];
  github: string;
  live: string;
  category: string;
  color: string;
  featured: boolean;
}

interface HTMLCircularGalleryProps {
  projects: Project[];
  bend?: number; // Used to adjust cylinder curvature/radius
}

function lerp(start: number, end: number, factor: number) {
  return start + (end - start) * factor;
}

export default function HTMLCircularGallery({ projects, bend = 120 }: HTMLCircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const N = projects.length;
  const angleStep = 360 / N;

  // Layout Dimensions (responsive state)
  const [dimensions, setDimensions] = useState({ cardWidth: 300, radius: 420 });

  // Animation & Physics Tracking
  const rotation = useRef(0);
  const targetRotation = useRef(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startRotation = useRef(0);
  const dragDistance = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // 3D Card Hover Tilt Tracking
  const hoverTilt = useRef({ x: 0, y: 0 });
  const currentTilt = useRef({ x: 0, y: 0 });
  const hoveredCardIndex = useRef<number | null>(null);

  // Wheel Throttling
  const lastWheelTime = useRef(0);

  // Track Dimensions and update on resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;

      let cardWidth = 300;
      if (width < 480) {
        cardWidth = 220;
      } else if (width < 768) {
        cardWidth = 260;
      }

      // Radius math: space cards appropriately around the cylinder
      // (cardWidth / 2) / sin(180 / N) gives the exact radius where card edges meet.
      // We add a padding constant for premium spacing.
      let radius = (cardWidth / 2) / Math.sin(Math.PI / N) + 50;

      // Adjust using the bend prop factor
      if (bend) {
        const bendRad = (bend * Math.PI) / 180;
        const adjustedRadius = (cardWidth / 2) / Math.sin(bendRad / N) + 30;
        radius = Math.max(cardWidth * 1.15, Math.min(adjustedRadius, 600));
      }

      setDimensions({ cardWidth, radius });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [N, bend]);

  // Main Animation Loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      // Lerp track rotation for butter-smooth gliding
      rotation.current = lerp(rotation.current, targetRotation.current, 0.08);

      // Smoothly update hover tilt coordinates
      currentTilt.current.x = lerp(currentTilt.current.x, hoverTilt.current.x, 0.1);
      currentTilt.current.y = lerp(currentTilt.current.y, hoverTilt.current.y, 0.1);

      // Update Track transform
      if (trackRef.current) {
        trackRef.current.style.transform = `translateZ(-${dimensions.radius}px) rotateY(${rotation.current}deg)`;
      }

      // Update active index based on closest angle to front (0deg)
      const rawActive = ((Math.round(-rotation.current / angleStep) % N) + N) % N;
      if (rawActive !== activeIndex) {
        setActiveIndex(rawActive);
      }

      // Update individual card positioning, opacity, blur, and 3D tilts
      projects.forEach((_, i) => {
        const cardWrapper = cardRefs.current[i];
        if (!cardWrapper) return;

        // Calculate card's current relative angle to the screen front (0 degrees)
        let relAngle = (i * angleStep + rotation.current) % 360;
        if (relAngle > 180) relAngle -= 360;
        if (relAngle < -180) relAngle += 360;

        const absAngle = Math.abs(relAngle);
        const maxAngle = 105; // Maximum angle at which cards are rendered/visible

        if (absAngle > maxAngle) {
          cardWrapper.style.opacity = '0';
          cardWrapper.style.visibility = 'hidden';
          cardWrapper.style.pointerEvents = 'none';
          cardWrapper.classList.remove('active-card');
        } else {
          cardWrapper.style.visibility = 'visible';
          
          // Cards fade out smoothly as they rotate to the sides
          const opacity = Math.max(0, 1 - (absAngle / maxAngle) * 1.3);
          const scale = 1.1 - (absAngle / maxAngle) * 0.28;
          const blur = (absAngle / maxAngle) * 4.5;
          const zIndex = Math.round(1000 - absAngle * 10);

          cardWrapper.style.opacity = opacity.toString();
          cardWrapper.style.zIndex = zIndex.toString();

          // Only allow link clicking and full interactions on the centered card
          const isActive = absAngle < 20;
          cardWrapper.style.pointerEvents = isActive ? 'auto' : 'none';

          if (isActive) {
            cardWrapper.classList.add('active-card');
          } else {
            cardWrapper.classList.remove('active-card');
          }

          // Apply transform
          // Add smooth hover tilt on Y & X axes if the card is the active one and hovered
          let transformStr = `rotateY(${i * angleStep}deg) translateZ(${dimensions.radius}px) scale(${scale})`;
          
          if (isActive && hoveredCardIndex.current === i) {
            transformStr += ` rotateX(${currentTilt.current.y}deg) rotateY(${currentTilt.current.x}deg)`;
          }

          cardWrapper.style.transform = transformStr;

          // Apply dynamic blur to overlays
          const blurOverlay = cardWrapper.querySelector('.card-blur-overlay') as HTMLElement;
          if (blurOverlay) {
            blurOverlay.style.setProperty('backdrop-filter', `blur(${blur}px)`);
            blurOverlay.style.setProperty('-webkit-backdrop-filter', `blur(${blur}px)`);
          }
        }
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [projects, angleStep, dimensions.radius, N, activeIndex]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navigateGallery('prev');
      } else if (e.key === 'ArrowRight') {
        navigateGallery('next');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Gesture/Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag with left mouse button
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    isDragging.current = true;
    startX.current = e.clientX;
    startRotation.current = targetRotation.current;
    dragDistance.current = 0;
    
    if (trackRef.current) {
      trackRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startX.current;
    dragDistance.current = Math.abs(deltaX);

    // Convert pixel delta to rotation angle step (adjust drag sensitivity)
    const sensitivity = 0.18;
    targetRotation.current = startRotation.current + deltaX * sensitivity;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    if (trackRef.current) {
      trackRef.current.releasePointerCapture(e.pointerId);
    }

    // Snap to the nearest card angle
    snapToNearestCard();
  };

  const snapToNearestCard = () => {
    const snapped = Math.round(targetRotation.current / angleStep) * angleStep;
    targetRotation.current = snapped;
  };

  // Keyboard / Button click / Dot click rotation helpers
  const navigateGallery = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      targetRotation.current -= angleStep;
    } else {
      targetRotation.current += angleStep;
    }
  };

  // Safe navigation directly to card index (calculating shortest rotation path)
  const jumpToCard = (index: number) => {
    const currentAngle = targetRotation.current;
    const targetAngle = -index * angleStep;
    
    // Find shortest angular offset
    let diff = (targetAngle - currentAngle) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    targetRotation.current = currentAngle + diff;
  };

  // Wheel Handler with custom throttling
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 280) return; // Limit scroll speed
    lastWheelTime.current = now;

    if (e.deltaY > 0) {
      navigateGallery('next');
    } else {
      navigateGallery('prev');
    }
  };

  // 3D Tilt Card Interaction
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (index !== activeIndex) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();

    // Calculate mouse position relative to card center (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Set target tilt limits (e.g., max 12 degrees tilt)
    hoverTilt.current = {
      x: x * 15,
      y: -y * 15
    };
    hoveredCardIndex.current = index;
  };

  const handleCardMouseLeave = () => {
    hoverTilt.current = { x: 0, y: 0 };
    hoveredCardIndex.current = null;
  };

  // Custom Cursor Helpers
  const addCursorHover = () => {
    document.querySelector('.cursor-dot')?.classList.add('hover');
    document.querySelector('.cursor-ring')?.classList.add('hover');
  };

  const removeCursorHover = () => {
    document.querySelector('.cursor-dot')?.classList.remove('hover');
    document.querySelector('.cursor-ring')?.classList.remove('hover');
  };

  const handleCardClick = (e: React.MouseEvent, index: number) => {
    // If user was dragging, block click navigation
    if (dragDistance.current > 6) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // If card is not the active/centered one, rotate it to the center instead of opening links
    if (index !== activeIndex) {
      e.preventDefault();
      e.stopPropagation();
      jumpToCard(index);
    }
  };

  const activeProject = projects[activeIndex];

  return (
    <div className="html-circular-gallery-wrapper" ref={containerRef}>
      {/* Background Aura Glow colored dynamically matching the active project */}
      <div className="gallery-auras">
        <div 
          className="gallery-aura-glow"
          style={{
            background: activeProject?.color || '#00D4FF',
          }}
        />
      </div>

      <div 
        className="gallery-scene" 
        ref={sceneRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <div 
          className="gallery-track" 
          ref={trackRef}
          style={{
            width: dimensions.cardWidth,
            height: dimensions.cardWidth * 1.35
          }}
        >
          {projects.map((project, index) => {
            const isCardActive = index === activeIndex;
            return (
              <div
                key={project.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`gallery-card-wrapper`}
                style={{
                  width: dimensions.cardWidth,
                  height: dimensions.cardWidth * 1.35,
                  // CSS variables to style the individual card according to its config
                  ['--project-color' as any]: project.color,
                  ['--project-color-glow' as any]: `${project.color}33`,
                  ['--project-color-glow-dim' as any]: `${project.color}11`
                }}
              >
                <div 
                  className={`gallery-card ${isCardActive ? 'active' : ''}`}
                  onMouseMove={(e) => handleCardMouseMove(e, index)}
                  onMouseLeave={handleCardMouseLeave}
                  onClick={(e) => handleCardClick(e, index)}
                >
                  {/* Dynamic blur background for side cards */}
                  <div className="card-blur-overlay" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

                  <div className="card-image-container">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="card-image"
                      draggable="false"
                    />
                    <div className="card-image-overlay" />
                    <span className="card-tag">{project.category}</span>
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{project.title}</h3>
                    <p className="card-desc">{project.description}</p>
                    
                    <div className="card-tech-list">
                      {project.tech.map((tech) => (
                        <span key={tech} className="card-tech-tag">{tech}</span>
                      ))}
                    </div>

                    <div className="card-actions">
                      <a 
                        href={project.live} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="card-btn card-btn-primary hoverable"
                        onMouseEnter={addCursorHover}
                        onMouseLeave={removeCursorHover}
                      >
                        <FiExternalLink size={14} /> Live Demo
                      </a>
                      <a 
                        href={project.github} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="card-btn card-btn-secondary hoverable"
                        onMouseEnter={addCursorHover}
                        onMouseLeave={removeCursorHover}
                      >
                        <FiGithub size={14} /> GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control bar / Dot Pagination */}
      <div className="gallery-controls">
        <div className="gallery-drag-prompt">
          <span className="drag-icon-pulse">↔</span> drag or scroll to rotate
        </div>

        <div className="gallery-navigation">
          <button 
            className="nav-btn hoverable" 
            onClick={() => navigateGallery('prev')}
            onMouseEnter={addCursorHover}
            onMouseLeave={removeCursorHover}
            aria-label="Previous Project"
          >
            <FiArrowLeft size={20} />
          </button>
          
          <div className="gallery-dots">
            {projects.map((_, index) => (
              <button
                key={index}
                className={`dot-btn hoverable ${index === activeIndex ? 'active' : ''}`}
                onClick={() => jumpToCard(index)}
                onMouseEnter={addCursorHover}
                onMouseLeave={removeCursorHover}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button 
            className="nav-btn hoverable" 
            onClick={() => navigateGallery('next')}
            onMouseEnter={addCursorHover}
            onMouseLeave={removeCursorHover}
            aria-label="Next Project"
          >
            <FiArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
