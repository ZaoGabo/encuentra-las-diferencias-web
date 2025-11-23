const valueCache = new Map();
const serializedCache = new Map();

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch (error) {
    console.warn('LocalStorage no está disponible en este entorno.', error);
    return null;
  }
};

export const readJsonFromStorage = (key, fallback = null) => {
  if (!key) return fallback;
  if (valueCache.has(key)) return valueCache.get(key);

  const storage = getStorage();
  if (!storage) return fallback;

  try {
    const rawValue = storage.getItem(key);
    if (!rawValue) {
      valueCache.set(key, fallback);
      serializedCache.set(key, null);
      return fallback;
    }
    const parsed = JSON.parse(rawValue);
    valueCache.set(key, parsed);
    serializedCache.set(key, rawValue);
    return parsed;
  } catch (error) {
    console.warn(`No se pudo leer "${key}" desde localStorage.`, error);
    valueCache.set(key, fallback);
    serializedCache.set(key, null);
    return fallback;
  }
};

export const writeJsonToStorage = (key, value) => {
  if (!key) return false;

  const storage = getStorage();
  if (!storage) return false;

  try {
    const serialized = JSON.stringify(value);
    if (serializedCache.get(key) === serialized) return false;

    storage.setItem(key, serialized);
    valueCache.set(key, value);
    serializedCache.set(key, serialized);
    return true;
  } catch (error) {
    console.warn(`No se pudo guardar "${key}" en localStorage.`, error);
    return false;
  }
};

export const clearStorageKey = (key) => {
  if (!key) return false;

  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.removeItem(key);
    valueCache.delete(key);
    serializedCache.delete(key);
    return true;
  } catch (error) {
    console.warn(`No se pudo limpiar "${key}" en localStorage.`, error);
    return false;
  }
};

export const resetStorageCache = () => {
  valueCache.clear();
  serializedCache.clear();
};
