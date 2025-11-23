import { useCallback, useEffect, useRef, useState } from 'react';

const useCountdown = (initialDuration = 0, { onTimeout } = {}) => {
  const timerRef = useRef(null);
  const [duration, setDuration] = useState(initialDuration);
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setTimeLeft(prev => Math.max(0, prev - 1));
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback((nextDuration = duration) => {
    const target = typeof nextDuration === 'number' ? nextDuration : duration;
    clearTimer();
    setDuration(target);
    setTimeLeft(target);
    setIsRunning(false);
  }, [clearTimer, duration]);

  const start = useCallback((nextDuration) => {
    const target = typeof nextDuration === 'number' ? nextDuration : duration;
    clearTimer();
    setDuration(target);
    setTimeLeft(target);
    setIsRunning(true);
  }, [clearTimer, duration]);

  useEffect(() => {
    setDuration(initialDuration);
    setTimeLeft(initialDuration);
  }, [initialDuration]);

  useEffect(() => {
    clearTimer();
    if (!isRunning) return undefined;
    if (timeLeft <= 0) {
      setIsRunning(false);
      onTimeout?.();
      return undefined;
    }
    timerRef.current = setTimeout(tick, 1000);
    return clearTimer;
  }, [clearTimer, isRunning, onTimeout, tick, timeLeft]);

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
  };
};

export default useCountdown;
