import React from 'react';
import { motion } from 'motion/react';

interface AnimatedEmojiProps {
  emoji: string;
  className?: string;
  onClick?: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Componente de Emoji Animado com efeito "pop-in" suave via Framer Motion
 * Aplicado nos novos emojis personalizados inseridos e renderizados no editor do Caderno
 */
export const AnimatedEmoji: React.FC<AnimatedEmojiProps> = ({
  emoji,
  className = '',
  onClick,
  title,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <motion.span
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={{ scale: 1.2, rotate: 6 }}
      whileTap={{ scale: 0.9, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 22,
        mass: 0.8
      }}
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center select-none font-emoji align-middle mx-0.5 transform-gpu cursor-default ${sizeClasses[size]} ${className}`}
    >
      {emoji}
    </motion.span>
  );
};
