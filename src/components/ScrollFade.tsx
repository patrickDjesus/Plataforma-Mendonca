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

  // Efeito "esticado": escalado no eixo Y + fade, conforme o card entra/sai da tela
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0, 1, 1, 0]);
  const scaleY = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.55, 1, 1, 0.55]);

  return (
    <motion.div ref={ref} style={{ opacity, scaleY }} className={className}>
      {children}
    </motion.div>
  );
};