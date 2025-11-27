// Configuración de niveles
export const LEVELS_INDEX_PATH = '/levels/index.json';
export const DEFAULT_TIME_LIMIT = 120;

// Configuración de almacenamiento
const DIFFERENCES_STORAGE_PREFIX = 'differences';

export const getDifferencesStorageKey = (levelId) => (
  levelId ? `${DIFFERENCES_STORAGE_PREFIX}-${levelId}` : DIFFERENCES_STORAGE_PREFIX
);

// Configuración de scoring
export const SCORING_DEFAULTS = {
  pointsPerHit: 200,
  penaltyPerMiss: 50,
  bonusPerSecond: 10,
};

// Configuración del editor
export const EDITOR_CONFIG = {
  NUDGE_STEP_NORMAL: 0.8,
  NUDGE_STEP_FINE: 0.2,
  DEFAULT_CIRCLE_RADIUS: 8,
  DEFAULT_RECT_WIDTH: 12,
  DEFAULT_RECT_HEIGHT: 12,
  DEFAULT_TOLERANCE: 2,
  MIN_RADIUS: 1,
  MIN_RECT_DIMENSION: 2,
  MIN_TOLERANCE: 0,
  RADIUS_ADJUST_STEP: 0.5,
  DIMENSION_ADJUST_STEP: 0.5,
  TOLERANCE_ADJUST_STEP: 0.5,
  SAVE_DEBOUNCE_MS: 200,
};

// Configuración de imágenes por defecto
export const DEFAULT_IMAGES = {
  original: '/images/original.png',
  modified: '/images/modified.png',
};

// Configuración de formas por defecto
export const DEFAULT_SHAPE_CONFIG = {
  type: 'circle',
  radius: EDITOR_CONFIG.DEFAULT_CIRCLE_RADIUS,
  tolerance: EDITOR_CONFIG.DEFAULT_TOLERANCE,
};
