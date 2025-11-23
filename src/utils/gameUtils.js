export const clampPercent = (value, min = 0, max = 100) => {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};

export const formatTime = (seconds) => {
  const normalized = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(normalized / 60);
  const remainingSeconds = String(normalized % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

export const isDevMode = import.meta.env.MODE !== 'production';
