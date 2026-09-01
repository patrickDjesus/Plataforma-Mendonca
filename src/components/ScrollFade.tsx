import { ReactNode, useRef } from 'react';
import type { FC, RefObject } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ScrollFadeProps {
  container: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
}

export const ScrollFade: FC<ScrollFadeProps> = ({ container, children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    container,
    offset: ['start end', 'end start'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [44, 0, 0, -44]);

  return (
    <motion.div ref={ref} style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
};