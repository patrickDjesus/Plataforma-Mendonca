import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { recordStudySessionTime } from '../services/supabase';

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos sem interação de usuário

export function useStudyTimer(isActive: boolean, modeLabel: string = 'Documento') {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'guest';

  const [activeSeconds, setActiveSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());
  const pendingSecondsRef = useRef<number>(0);

  // Monitora eventos do usuário para renovar o timer de 5 minutos
  useEffect(() => {
    if (!isActive) return;

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
      setIsPaused(false);
    };

    const events = ['keydown', 'click', 'mousemove', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    lastActivityRef.current = Date.now();
    setIsPaused(false);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
    };
  }, [isActive]);

  // Intervalo de 1 segundo para acumular tempo ativo ou pausar se passar de 5 minutos
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;

      if (timeSinceLastActivity < INACTIVITY_TIMEOUT_MS) {
        setIsPaused(false);
        setActiveSeconds(prev => prev + 1);
        pendingSecondsRef.current += 1;
      } else {
        setIsPaused(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Salva o tempo acumulado no Supabase / localStorage periodicamente ou no unmount
  useEffect(() => {
    if (!isActive) return;

    const flushTime = () => {
      const secs = pendingSecondsRef.current;
      if (secs >= 5) {
        pendingSecondsRef.current = 0;
        recordStudySessionTime(userId, secs, modeLabel).catch(err =>
          console.warn('Erro ao salvar tempo de estudo:', err)
        );
      }
    };

    // Salva a cada 30 segundos de estudo ativo
    const flushInterval = setInterval(flushTime, 30000);

    return () => {
      clearInterval(flushInterval);
      flushTime();
    };
  }, [isActive, userId, modeLabel]);

  return { activeSeconds, isPaused };
}
