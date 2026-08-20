import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  isHero?: boolean;
}

export const ScrollRevealSection: React.FC<ScrollRevealSectionProps> = ({
  children,
  className = '',
  id,
  isHero = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Continuous Viewport Scroll Tracking
  // - "start 92%": when the top of the section enters near bottom of the viewport
  // - "start 45%": when the top of the section reaches upper-middle of viewport
  // - "end 55%": when the bottom of the section is passing middle
  // - "end 10%": when the bottom of the section leaves near top of viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: isHero
      ? ['start start', 'end start']
      : ['start 92%', 'start 45%', 'end 55%', 'end 10%'],
  });

  // 2. High-Contrast Opacity Transition (0.00 -> 1.00 -> 1.00 -> 0.05)
  const rawOpacity: MotionValue<number> = useTransform(
    scrollYProgress,
    isHero ? [0, 0.35, 0.85, 1] : [0, 0.28, 0.72, 1],
    isHero ? [1, 1, 0.25, 0.05] : [0.05, 1, 1, 0.05]
  );

  // 3. Pronounced Vertical Motion (+100px gliding up to 0px, and floating out to -70px)
  const rawY: MotionValue<number> = useTransform(
    scrollYProgress,
    isHero ? [0, 0.4, 1] : [0, 0.28, 0.72, 1],
    isHero ? [0, 0, -85] : [90, 0, 0, -70]
  );

  // 4. Dynamic Scale (0.91 -> 1.0 -> 0.93)
  const rawScale: MotionValue<number> = useTransform(
    scrollYProgress,
    isHero ? [0, 0.4, 1] : [0, 0.28, 0.72, 1],
    isHero ? [1, 1, 0.93] : [0.92, 1, 1, 0.93]
  );

  // 5. Blur transformation for depth-of-field effect
  const rawBlur: MotionValue<string> = useTransform(
    scrollYProgress,
    isHero ? [0, 0.4, 1] : [0, 0.25, 0.75, 1],
    isHero ? ['blur(0px)', 'blur(0px)', 'blur(6px)'] : ['blur(6px)', 'blur(0px)', 'blur(0px)', 'blur(6px)']
  );

  // Spring physics for buttery-smooth responsiveness to fast and slow scrolls
  const springConfig = { stiffness: 120, damping: 26, mass: 0.6, restDelta: 0.001 };
  const opacity = useSpring(rawOpacity, springConfig);
  const y = useSpring(rawY, springConfig);
  const scale = useSpring(rawScale, springConfig);

  return (
    <motion.div
      ref={containerRef}
      id={id}
      style={{
        opacity,
        y,
        scale,
        filter: rawBlur,
      }}
      className={`will-change-transform transform-gpu ${className}`}
    >
      {children}
    </motion.div>
  );
};
