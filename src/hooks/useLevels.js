import { useCallback, useEffect, useMemo, useState } from 'react';
import { LEVELS_INDEX_PATH } from '../config/gameConfig';

const createErrorMessage = (type) => {
  if (type === 'index') {
    return 'No pudimos cargar la lista de niveles. Revisa public/levels/index.json.';
  }
  return 'No pudimos cargar la configuración del nivel seleccionado.';
};

const useLevels = () => {
  const [levels, setLevels] = useState([]);
  const [currentLevelId, setCurrentLevelId] = useState('');
  const [levelData, setLevelData] = useState(null);
  const [loadingIndex, setLoadingIndex] = useState(false);
  const [loadingLevel, setLoadingLevel] = useState(false);
  const [error, setError] = useState(null);

  const fetchLevelIndex = useCallback(async () => {
    setLoadingIndex(true);
    setError(null);
    try {
      const response = await fetch(LEVELS_INDEX_PATH, { cache: 'no-cache' });
      if (!response.ok) throw new Error('INDEX_NOT_FOUND');
      const payload = await response.json();
      const entries = payload?.levels ?? [];
      setLevels(entries);
      if (entries.length > 0 && !entries.some(level => level.id === currentLevelId)) {
        setCurrentLevelId(entries[0].id);
      }
      if (entries.length === 0) {
        setLevelData(null);
      }
    } catch (err) {
      console.error(err);
      setError(createErrorMessage('index'));
      setLevels([]);
    } finally {
      setLoadingIndex(false);
    }
  }, [currentLevelId]);

  const findLevelMeta = useCallback((levelId) => (
    levels.find(level => level.id === levelId) ?? null
  ), [levels]);

  const fetchLevelData = useCallback(async (levelId) => {
    if (!levelId) return;
    const levelMeta = findLevelMeta(levelId);
    if (!levelMeta) return;
    setLoadingLevel(true);
    setError(null);
    try {
      const response = await fetch(`/levels/${levelMeta.file}`, { cache: 'no-cache' });
      if (!response.ok) throw new Error('LEVEL_NOT_FOUND');
      const payload = await response.json();
      setLevelData(payload);
    } catch (err) {
      console.error(err);
      setError(createErrorMessage('level'));
      setLevelData(null);
    } finally {
      setLoadingLevel(false);
    }
  }, [findLevelMeta]);

  useEffect(() => {
    fetchLevelIndex();
  }, [fetchLevelIndex]);

  useEffect(() => {
    if (!currentLevelId) return;
    fetchLevelData(currentLevelId);
  }, [currentLevelId, fetchLevelData]);

  const reloadCurrentLevel = useCallback(() => {
    if (!currentLevelId) return;
    fetchLevelData(currentLevelId);
  }, [currentLevelId, fetchLevelData]);

  const overrideLevelData = useCallback((nextValue) => {
    setLevelData(prev => (
      typeof nextValue === 'function'
        ? nextValue(prev)
        : nextValue
    ));
  }, []);

  const loading = loadingIndex || loadingLevel;

  const currentLevelMeta = useMemo(() => findLevelMeta(currentLevelId), [findLevelMeta, currentLevelId]);

  return {
    levels,
    currentLevelId,
    setCurrentLevelId,
    levelData,
    loadingLevel,
    loadingIndex,
    loading,
    levelError: error,
    reloadLevels: fetchLevelIndex,
    reloadCurrentLevel,
    currentLevelMeta,
    overrideLevelData,
  };
};

export default useLevels;
