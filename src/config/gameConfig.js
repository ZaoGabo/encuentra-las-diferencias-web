export const LEVELS_INDEX_PATH = '/levels/index.json';
export const DEFAULT_TIME_LIMIT = 120;
const DIFFERENCES_STORAGE_PREFIX = 'differences';

export const getDifferencesStorageKey = (levelId) => (
  levelId ? `${DIFFERENCES_STORAGE_PREFIX}-${levelId}` : DIFFERENCES_STORAGE_PREFIX
);
