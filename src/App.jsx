import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { Trophy, Info } from 'lucide-react';
import Welcome from './Welcome';
import Modal from './components/Modal';
import { HitMarker, WrongMarker } from './components/FeedbackMarker';
import GameHeader from './components/GameHeader';
import ImageCanvas from './components/ImageCanvas';
import DifferencesPanel from './components/DifferencesPanel';
import useDifferences from './hooks/useDifferences';
import useLevels from './hooks/useLevels';
import useCountdown from './hooks/useCountdown';
import { clampPercent, formatTime, isDevMode } from './utils/gameUtils';
import { readJsonFromStorage, writeJsonToStorage } from './utils/storage';
import { DEFAULT_TIME_LIMIT, getDifferencesStorageKey } from './config/gameConfig';
import { TEXT } from './config/textContent';

const App = () => {
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const {
    levels,
    currentLevelId,
    setCurrentLevelId,
    levelData,
    loadingLevel,
    levelError,
    reloadCurrentLevel,
    overrideLevelData,
  } = useLevels();

  const [differences, setDifferences] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [selectedDifferenceId, setSelectedDifferenceId] = useState(null);
  const [dragging, setDragging] = useState(null);

  const originalContainerRef = useRef(null);
  const modifiedContainerRef = useRef(null);
  const saveDifferencesTimeoutRef = useRef(null);

  const texts = TEXT;
  const scoringRules = useMemo(() => ({
    pointsPerHit: levelData?.pointsPerHit,
    penaltyPerMiss: levelData?.penaltyPerMiss,
    bonusPerSecond: levelData?.bonusPerSecond
  }), [levelData?.pointsPerHit, levelData?.penaltyPerMiss, levelData?.bonusPerSecond]);

  const {
    foundDifferences,
    score,
    attempts,
    wrongClick,
    registerClick,
    applyBonus,
    reset: resetTracking
  } = useDifferences(differences, scoringRules);

  const totalDifferences = differences.length;
  const accuracy = useMemo(
    () => (attempts > 0 ? Math.round((foundDifferences.length / attempts) * 100) : 0),
    [attempts, foundDifferences.length]
  );

  const timeLimit = levelData?.timeLimit ?? DEFAULT_TIME_LIMIT;

  const handleTimeout = useCallback(() => {
    setShowTimeoutModal(true);
    setGameStarted(false);
  }, []);

  const {
    timeLeft,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  } = useCountdown(timeLimit, { onTimeout: handleTimeout });

  const nudgeDifference = useCallback((id, deltaX, deltaY) => {
    setDifferences(prev => prev.map(diff => (
      diff.id === id
        ? {
            ...diff,
            x: Math.round(clampPercent(diff.x + deltaX) * 100) / 100,
            y: Math.round(clampPercent(diff.y + deltaY) * 100) / 100
          }
        : diff
    )));
  }, []);


  useEffect(() => {
    if (!levelData) return;
    let nextDifferences = levelData.differences ?? [];
    if (isDevMode && currentLevelId) {
      const stored = readJsonFromStorage(getDifferencesStorageKey(currentLevelId));
      if (Array.isArray(stored)) {
        nextDifferences = stored;
      }
    }
    setDifferences(nextDifferences);
    resetTimer(timeLimit);
    resetTracking();
    setShowVictory(false);
    setShowTimeoutModal(false);
    setGameStarted(false);
    setSelectedDifferenceId(null);
  }, [currentLevelId, levelData, resetTimer, resetTracking, timeLimit]);

  useEffect(() => {
    if (!gameStarted) return;
    if (foundDifferences.length === totalDifferences && totalDifferences > 0) {
      applyBonus(timeLeft);
      setShowVictory(true);
      setGameStarted(false);
      pauseTimer();
    }
  }, [applyBonus, foundDifferences.length, gameStarted, pauseTimer, timeLeft, totalDifferences]);

  useEffect(() => {
    if (!editMode || !selectedDifferenceId) return;

    const handleKeyDown = (event) => {
      const step = event.shiftKey ? 0.2 : 0.8;
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        nudgeDifference(selectedDifferenceId, 0, -step);
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        nudgeDifference(selectedDifferenceId, 0, step);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        nudgeDifference(selectedDifferenceId, -step, 0);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nudgeDifference(selectedDifferenceId, step, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, selectedDifferenceId, nudgeDifference]);

  useEffect(() => {
    if (!dragging) return;

    const onPointerMove = (event) => {
      event.preventDefault();
      const { rect, id, startMouseX, startMouseY, startXPercent, startYPercent } = dragging;
      const deltaXpx = event.clientX - startMouseX;
      const deltaYpx = event.clientY - startMouseY;
      const deltaXPercent = (deltaXpx / rect.width) * 100;
      const deltaYPercent = (deltaYpx / rect.height) * 100;
      const newX = clampPercent(startXPercent + deltaXPercent, 0, 100);
      const newY = clampPercent(startYPercent + deltaYPercent, 0, 100);
      setDifferences(prev => prev.map(diff => (
        diff.id === id
          ? {
              ...diff,
              x: Math.round(newX * 100) / 100,
              y: Math.round(newY * 100) / 100
            }
          : diff
      )));
    };

    const onPointerUp = () => setDragging(null);

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragging]);

  useEffect(() => () => {
    if (saveDifferencesTimeoutRef.current) {
      clearTimeout(saveDifferencesTimeoutRef.current);
      saveDifferencesTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isDevMode || !currentLevelId) return undefined;

    if (saveDifferencesTimeoutRef.current) {
      clearTimeout(saveDifferencesTimeoutRef.current);
    }

    saveDifferencesTimeoutRef.current = setTimeout(() => {
      writeJsonToStorage(getDifferencesStorageKey(currentLevelId), differences);
      saveDifferencesTimeoutRef.current = null;
    }, 200);

    return () => {
      if (saveDifferencesTimeoutRef.current) {
        clearTimeout(saveDifferencesTimeoutRef.current);
        saveDifferencesTimeoutRef.current = null;
      }
    };
  }, [differences, currentLevelId]);

  const toggleEditMode = () => {
    setEditMode(value => !value);
    setSelectedDifferenceId(null);
    setDragging(null);
  };

  const adjustRadius = (id, delta) => {
    setDifferences(prev => prev.map(diff => {
      if (diff.id !== id) return diff;
      const radius = Math.max(1, (diff.radius ?? 8) + delta);
      return { ...diff, radius: Math.round(radius * 100) / 100 };
    }));
  };

  const adjustDimension = (id, key, delta, min = 2) => {
    setDifferences(prev => prev.map(diff => {
      if (diff.id !== id) return diff;
      const current = diff[key] ?? (key === 'width' ? 12 : key === 'height' ? 12 : 0);
      const next = Math.max(min, current + delta);
      return { ...diff, [key]: Math.round(next * 100) / 100 };
    }));
  };

  const adjustTolerance = (id, delta) => {
    setDifferences(prev => prev.map(diff => {
      if (diff.id !== id) return diff;
      const nextTolerance = Math.max(0, (diff.tolerance ?? 0) + delta);
      return { ...diff, tolerance: Math.round(nextTolerance * 100) / 100 };
    }));
  };

  const changeShapeType = (id, nextType) => {
    setDifferences(prev => prev.map(diff => {
      if (diff.id !== id) return diff;
      if (nextType === 'rect') {
        const fallbackSize = Math.max(6, (diff.radius ?? 8) * 2);
        return {
          ...diff,
          type: 'rect',
          width: Math.round((diff.width ?? fallbackSize) * 100) / 100,
          height: Math.round((diff.height ?? fallbackSize) * 100) / 100,
        };
      }
      if (nextType === 'circle') {
        const fallbackRadius = (diff.width ?? diff.height ?? 12) / 2;
        return {
          ...diff,
          type: 'circle',
          radius: Math.round((diff.radius ?? fallbackRadius) * 100) / 100,
        };
      }
      return { ...diff, type: nextType };
    }));
  };

  const removeDifference = (id) => {
    setDifferences(prev => prev.filter(diff => diff.id !== id));
  };

  const handlePointerDown = (event, id, imageType) => {
    event.preventDefault();
    event.stopPropagation();
    const container = imageType === 'original' ? originalContainerRef.current : modifiedContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const diff = differences.find(item => item.id === id);
    if (!diff) return;
    setSelectedDifferenceId(id);
    setDragging({
      id,
      rect,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startXPercent: diff.x,
      startYPercent: diff.y
    });
  };

  const handleEditClick = (event, imageType) => {
    const container = imageType === 'original' ? originalContainerRef.current : modifiedContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const nextId = differences.length > 0 ? Math.max(...differences.map(diff => diff.id)) + 1 : 1;
    const newDiff = {
      id: nextId,
      type: 'circle',
      x: Math.round(clampPercent(x) * 100) / 100,
      y: Math.round(clampPercent(y) * 100) / 100,
      radius: 8,
      tolerance: 2,
      name: `Diferencia ${nextId}`
    };
    setDifferences(prev => [...prev, newDiff]);
    setSelectedDifferenceId(nextId);
  };

  const handleImageClick = (event, imageType) => {
    if (!gameStarted || showVictory) return;
    const container = imageType === 'original' ? originalContainerRef.current : modifiedContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickXpx = event.clientX - rect.left;
    const clickYpx = event.clientY - rect.top;
    const xPercent = (clickXpx / rect.width) * 100;
    const yPercent = (clickYpx / rect.height) * 100;

    registerClick(clampPercent(xPercent), clampPercent(yPercent), { imageType });
  };

  const startGame = () => {
    if (totalDifferences === 0) return;
    setShowWelcomeScreen(false);
    setShowTimeoutModal(false);
    setShowVictory(false);
    resetTracking();
    startTimer(timeLimit);
    setGameStarted(true);
  };

  const resetGame = () => {
    resetTracking();
    setShowVictory(false);
    setShowTimeoutModal(false);
    resetTimer(timeLimit);
    setGameStarted(false);
    setSelectedDifferenceId(null);
    setDragging(null);
  };

  const goToNextLevel = () => {
    if (levels.length < 2) {
      resetGame();
      return;
    }
    const currentIndex = levels.findIndex(level => level.id === currentLevelId);
    const nextIndex = (currentIndex + 1) % levels.length;
    setCurrentLevelId(levels[nextIndex].id);
  };

  const exportLevel = async () => {
    const payload = JSON.stringify({
      ...(levelData ?? {}),
      differences,
    }, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      alert('Configuración copiada al portapapeles.');
    } catch (err) {
      console.error(err);
      alert('No se pudo copiar al portapapeles. Revisa la consola.');
    }
  };

  const importLevel = (event) => {
    const [file] = event.target.files ?? [];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const payload = JSON.parse(loadEvent.target?.result ?? '{}');
        if (!Array.isArray(payload.differences)) throw new Error('El JSON debe incluir un arreglo "differences".');
        setDifferences(payload.differences);
        overrideLevelData(prev => ({ ...prev, ...payload }));
      } catch (err) {
        console.error(err);
        alert('No se pudo importar el archivo. Comprueba que tenga el formato correcto.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleCopyDifference = (diff) => {
    navigator.clipboard?.writeText(JSON.stringify(diff, null, 2));
  };

  const handleSizeInput = (id, key, value) => {
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return;
    let sanitized = parsed;
    if (key === 'tolerance') sanitized = Math.max(0, parsed);
    if (key === 'radius') sanitized = Math.max(1, parsed);
    if (key === 'width' || key === 'height') sanitized = Math.max(2, parsed);
    setDifferences(prev => prev.map(diff => (
      diff.id === id
        ? { ...diff, [key]: Math.round(sanitized * 100) / 100 }
        : diff
    )));
  };

  const renderHitMarkers = (imageType) => (
    <>
      {foundDifferences.map(diffId => {
        const diff = differences.find(item => item.id === diffId);
        if (!diff) return null;
        return <HitMarker key={`hit-${imageType}-${diffId}`} x={diff.x} y={diff.y} />;
      })}
    </>
  );

  const renderWrongMarker = (imageType) => {
    if (!wrongClick) return null;
    if (wrongClick.context?.imageType !== imageType) return null;
    return <WrongMarker x={wrongClick.x} y={wrongClick.y} />;
  };

  const renderEditOverlays = (imageType) => {
    if (!editMode) return null;
    return (
      <>
        {differences.map(diff => {
          const tolerance = diff.tolerance ?? 0;
          if (diff.type === 'rect') {
            const width = diff.width ?? 10;
            const height = diff.height ?? 10;
            const effectiveWidth = width + tolerance * 2;
            const effectiveHeight = height + tolerance * 2;
            return (
              <React.Fragment key={`overlay-${imageType}-${diff.id}`}>
                <div
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-orange-400/70"
                  style={{
                    left: `${diff.x}%`,
                    top: `${diff.y}%`,
                    width: `${effectiveWidth}%`,
                    height: `${effectiveHeight}%`
                  }}
                />
                <div
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border border-orange-400/40 border-dashed"
                  style={{
                    left: `${diff.x}%`,
                    top: `${diff.y}%`,
                    width: `${width}%`,
                    height: `${height}%`
                  }}
                />
              </React.Fragment>
            );
          }

          if (diff.type === 'polygon') {
            return null;
          }

          const radius = diff.radius ?? 8;
          const effectiveRadius = radius + tolerance;
          return (
            <React.Fragment key={`overlay-${imageType}-${diff.id}`}>
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-400/70"
                style={{
                  left: `${diff.x}%`,
                  top: `${diff.y}%`,
                  width: `${effectiveRadius * 2}%`,
                  height: `${effectiveRadius * 2}%`
                }}
              />
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-400/40 border-dashed"
                style={{
                  left: `${diff.x}%`,
                  top: `${diff.y}%`,
                  width: `${radius * 2}%`,
                  height: `${radius * 2}%`
                }}
              />
            </React.Fragment>
          );
        })}
      </>
    );
  };

  const renderEditMarkers = (imageType) => {
    if (!editMode) return null;
    return (
      <>
        {differences.map(diff => (
          <button
            key={`edit-${imageType}-${diff.id}`}
            onClick={(event) => {
              event.stopPropagation();
              setSelectedDifferenceId(diff.id);
            }}
            onPointerDown={(event) => handlePointerDown(event, diff.id, imageType)}
            className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-bold ${selectedDifferenceId === diff.id ? 'border-orange-500 bg-orange-500/30 text-white' : 'border-orange-300 bg-orange-200/40 text-orange-700'}`}
            style={{ left: `${diff.x}%`, top: `${diff.y}%` }}
            title={`Editar ${diff.name ?? `Marcador ${diff.id}`}`}
          >
            {diff.id}
          </button>
        ))}
      </>
    );
  };

  const hintShapeSummary = (diff) => {
    const tolerance = diff.tolerance ?? 0;
    if (diff.type === 'rect') {
      return `${diff.x}%, ${diff.y}% • ${diff.width ?? 0}×${diff.height ?? 0} ±${tolerance}`;
    }
    if (diff.type === 'polygon') {
      return `${diff.points?.length ?? 0} puntos • tol±${tolerance}`;
    }
    return `${diff.x}%, ${diff.y}% • r=${diff.radius ?? 0} ±${tolerance}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      {showWelcomeScreen && (
        <Welcome
          onEnter={() => setShowWelcomeScreen(false)}
          onStart={startGame}
        />
      )}

      {levelError && (
        <Modal
          title={texts.modals.loadError.title}
          description={levelError}
          tone="danger"
          actions={[
            { label: texts.modals.loadError.retry, variant: 'primary', onClick: reloadCurrentLevel }
          ]}
        />
      )}

      {showVictory && (
        <Modal
          title={texts.modals.victory.title}
          description={levelData?.description}
          tone="success"
          actions={[
            { label: texts.modals.victory.replay, variant: 'secondary', onClick: resetGame },
            { label: texts.modals.victory.next, variant: 'primary', onClick: goToNextLevel }
          ]}
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-2xl bg-emerald-100 p-4">
              <div className="text-sm font-semibold text-emerald-600">{texts.scoreboard.score}</div>
              <div className="text-3xl font-bold text-emerald-700">{score}</div>
            </div>
            <div className="rounded-2xl bg-sky-100 p-4">
              <div className="text-sm font-semibold text-sky-600">{texts.scoreboard.remainingTime}</div>
              <div className="text-3xl font-bold text-sky-700">{formatTime(timeLeft)}</div>
            </div>
            <div className="rounded-2xl bg-purple-100 p-4">
              <div className="text-sm font-semibold text-purple-600">{texts.scoreboard.accuracy}</div>
              <div className="text-3xl font-bold text-purple-700">{accuracy}%</div>
            </div>
            <div className="rounded-2xl bg-amber-100 p-4">
              <div className="text-sm font-semibold text-amber-600">{texts.scoreboard.attempts}</div>
              <div className="text-3xl font-bold text-amber-700">{attempts}</div>
            </div>
          </div>
        </Modal>
      )}

      {showTimeoutModal && (
        <Modal
          title={texts.modals.timeout.title}
          description={texts.modals.timeout.description}
          tone="danger"
          actions={[
            { label: texts.modals.timeout.viewHints, variant: 'secondary', onClick: () => setShowTimeoutModal(false) },
            { label: texts.modals.timeout.retry, variant: 'primary', onClick: resetGame }
          ]}
        >
          <p className="text-gray-600">{texts.modals.timeout.tip}</p>
        </Modal>
      )}

      <div className="mx-auto max-w-7xl space-y-6">
        <GameHeader
          levelName={levelData?.name}
          levels={levels}
          currentLevelId={currentLevelId}
          onSelectLevel={setCurrentLevelId}
          loadingLevel={loadingLevel}
          score={score}
          foundDifferencesCount={foundDifferences.length}
          totalDifferences={totalDifferences}
          formattedTime={formatTime(timeLeft)}
          timeLeft={timeLeft}
          gameStarted={gameStarted}
          onResetGame={resetGame}
          isDevMode={isDevMode}
          editMode={editMode}
          onToggleEditMode={toggleEditMode}
          onExportLevel={exportLevel}
          onImportLevel={importLevel}
        />

        {levelData?.description && (
          <div className="rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3 rounded-2xl bg-gray-100 px-4 py-3 text-gray-700">
              <Info className="h-5 w-5 text-purple-500" />
              <span>{levelData.description}</span>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur">
          <div className="flex items-center gap-3 text-lg font-bold text-gray-800">
            <Trophy className="h-7 w-7 text-yellow-500" /> {texts.scoreboard.title}
            <span className="ml-auto text-sm font-semibold text-gray-600">{texts.scoreboard.accuracy}: {accuracy}%</span>
          </div>
          <div className="mt-4 h-5 w-full rounded-full bg-gray-200">
            <div
              className="flex h-5 items-center justify-end rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 pr-3 text-sm font-bold text-white transition-all"
              style={{ width: totalDifferences > 0 ? `${(foundDifferences.length / totalDifferences) * 100}%` : '0%' }}
            >
              {foundDifferences.length > 0 && (
                <span className="drop-shadow">{Math.round((foundDifferences.length / totalDifferences) * 100)}%</span>
              )}
            </div>
          </div>
        </div>

        {!gameStarted && !showVictory && !showTimeoutModal && totalDifferences > 0 && (
          <div className="rounded-3xl bg-white/95 p-10 text-center shadow-2xl backdrop-blur">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-800">{texts.callToAction.title}</h2>
            <p className="mt-2 text-gray-600">
              {texts.callToAction.description} {totalDifferences > 0 ? `(${totalDifferences} diferencias).` : ''}
            </p>
            <button
              onClick={startGame}
              className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition hover:scale-105"
            >
              {texts.callToAction.button}
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <ImageCanvas
            title={texts.canvas.original.title}
            containerRef={originalContainerRef}
            imageSrc={levelData?.originalImage ?? '/images/original.png'}
            fallbackTitle={texts.canvas.fallbackTitle}
            fallbackDescription={texts.canvas.original.fallbackDescription}
            borderClass="border-gray-200"
            isDevMode={isDevMode}
            editMode={editMode}
            onPlayClick={(event) => handleImageClick(event, 'original')}
            onEditClick={(event) => handleEditClick(event, 'original')}
            overlays={renderEditOverlays('original')}
            hitMarkers={renderHitMarkers('original')}
            wrongMarker={renderWrongMarker('original')}
            editMarkers={renderEditMarkers('original')}
          />

          <ImageCanvas
            title={texts.canvas.modified.title}
            containerRef={modifiedContainerRef}
            imageSrc={levelData?.modifiedImage ?? '/images/modified.png'}
            fallbackTitle={texts.canvas.fallbackTitle}
            fallbackDescription={texts.canvas.modified.fallbackDescription}
            borderClass="border-purple-300"
            isDevMode={isDevMode}
            editMode={editMode}
            onPlayClick={(event) => handleImageClick(event, 'modified')}
            onEditClick={(event) => handleEditClick(event, 'modified')}
            overlays={renderEditOverlays('modified')}
            hitMarkers={renderHitMarkers('modified')}
            wrongMarker={renderWrongMarker('modified')}
            editMarkers={renderEditMarkers('modified')}
          />
        </div>

        <DifferencesPanel
          differences={differences}
          foundDifferences={foundDifferences}
          selectedDifferenceId={selectedDifferenceId}
          onSelectDifference={setSelectedDifferenceId}
          hintShapeSummary={hintShapeSummary}
          isDevMode={isDevMode}
          editMode={editMode}
          onChangeShape={changeShapeType}
          onSizeInput={handleSizeInput}
          onAdjustRadius={adjustRadius}
          onAdjustDimension={adjustDimension}
          onAdjustTolerance={adjustTolerance}
          onRemoveDifference={removeDifference}
          onCopyDifference={handleCopyDifference}
        />
      </div>
    </div>
  );
};

export default App;
