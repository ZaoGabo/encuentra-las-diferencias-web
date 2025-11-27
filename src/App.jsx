import React, {
  useMemo,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense
} from 'react';
import { Trophy, Info } from 'lucide-react';
// Lazy loading de componentes grandes
const Welcome = lazy(() => import('./Welcome'));
const Modal = lazy(() => import('./components/Modal'));
const DifferencesPanel = lazy(() => import('./components/DifferencesPanel'));
const GameSelector = lazy(() => import('./components/GameSelector'));
// Imports normales para componentes críticos
import GameHeader from './components/GameHeader';
import ImageCanvas from './components/ImageCanvas';
import GameOverlays from './components/GameOverlays';
import useDifferences from './hooks/useDifferences';
import useLevels from './hooks/useLevels';
import useCountdown from './hooks/useCountdown';
import useGameState from './hooks/useGameState';
import useEditMode from './hooks/useEditMode';
import useLevelImportExport from './hooks/useLevelImportExport';
import { formatTime, isDevMode } from './utils/gameUtils';
import { DEFAULT_TIME_LIMIT, DEFAULT_IMAGES } from './config/gameConfig';
import { TEXT } from './config/textContent';

// Componente de carga para Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <div className="text-gray-600">Cargando...</div>
  </div>
);

const App = () => {
  const texts = TEXT;
  const [showGameSelector, setShowGameSelector] = React.useState(true);

  // Refs para los contenedores de imágenes
  const originalContainerRef = useRef(null);
  const modifiedContainerRef = useRef(null);

  // Hook de niveles
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

  // Hook de estado del juego
  const {
    showWelcomeScreen,
    setShowWelcomeScreen,
    gameStarted,
    setGameStarted,
    showVictory,
    setShowVictory,
    showTimeoutModal,
    setShowTimeoutModal,
    startGame: handleStartGame,
    resetGameState,
    handleVictory,
    handleTimeout,
    goToNextLevel: handleGoToNextLevel,
  } = useGameState(levels);

  // Hook de modo edición
  const {
    editMode,
    toggleEditMode,
    selectedDifferenceId,
    setSelectedDifferenceId,
    differences,
    setDifferences,
    adjustRadius,
    adjustDimension,
    adjustTolerance,
    changeShapeType,
    removeDifference,
    handlePointerDown: handleEditPointerDown,
    handleEditClick,
    handleSizeInput,
    loadDifferencesFromStorage,
  } = useEditMode(levelData?.differences ?? [], currentLevelId);

  // Hook de import/export
  const {
    exportLevel: handleExportLevel,
    importLevel: handleImportLevel,
    handleCopyDifference,
  } = useLevelImportExport();

  // Configuración de scoring
  const scoringRules = useMemo(() => ({
    pointsPerHit: levelData?.pointsPerHit,
    penaltyPerMiss: levelData?.penaltyPerMiss,
    bonusPerSecond: levelData?.bonusPerSecond
  }), [levelData?.pointsPerHit, levelData?.penaltyPerMiss, levelData?.bonusPerSecond]);

  // Hook de diferencias
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

  // Hook de countdown
  const {
    timeLeft,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  } = useCountdown(timeLimit, { onTimeout: handleTimeout });

  // Cargar diferencias al cambiar nivel
  useEffect(() => {
    if (!levelData) return;
    let nextDifferences = levelData.differences ?? [];
    if (isDevMode && currentLevelId) {
      const stored = loadDifferencesFromStorage();
      if (stored) {
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
  }, [currentLevelId, levelData, resetTimer, resetTracking, timeLimit, loadDifferencesFromStorage, setDifferences, setShowVictory, setShowTimeoutModal, setGameStarted, setSelectedDifferenceId]);

  // Detectar victoria
  useEffect(() => {
    if (!gameStarted) return;
    if (foundDifferences.length === totalDifferences && totalDifferences > 0) {
      applyBonus(timeLeft);
      handleVictory();
      pauseTimer();
    }
  }, [applyBonus, foundDifferences.length, gameStarted, pauseTimer, timeLeft, totalDifferences, handleVictory]);

  // Handlers de juego
  const handleImageClick = useCallback((event, imageType) => {
    if (!gameStarted || showVictory) return;
    const container = imageType === 'original' ? originalContainerRef.current : modifiedContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickXpx = event.clientX - rect.left;
    const clickYpx = event.clientY - rect.top;
    const xPercent = (clickXpx / rect.width) * 100;
    const yPercent = (clickYpx / rect.height) * 100;
    registerClick(xPercent, yPercent, { imageType });
  }, [gameStarted, showVictory, registerClick]);

  const startGame = useCallback(() => {
    handleStartGame(totalDifferences);
    resetTracking();
    startTimer(timeLimit);
  }, [handleStartGame, totalDifferences, resetTracking, startTimer, timeLimit]);

  const resetGame = useCallback(() => {
    resetTracking();
    resetGameState();
    resetTimer(timeLimit);
    setSelectedDifferenceId(null);
  }, [resetTracking, resetGameState, resetTimer, timeLimit, setSelectedDifferenceId]);

  const goToNextLevel = useCallback(() => {
    handleGoToNextLevel(currentLevelId, setCurrentLevelId);
  }, [handleGoToNextLevel, currentLevelId, setCurrentLevelId]);

  const exportLevel = useCallback(async () => {
    await handleExportLevel(levelData, differences);
  }, [handleExportLevel, levelData, differences]);

  const importLevel = useCallback((event) => {
    handleImportLevel(event, setDifferences, overrideLevelData);
  }, [handleImportLevel, setDifferences, overrideLevelData]);

  const handlePointerDown = useCallback((event, id, imageType) => {
    const containerRef = imageType === 'original' ? originalContainerRef : modifiedContainerRef;
    handleEditPointerDown(event, id, imageType, containerRef);
  }, [handleEditPointerDown]);

  const onEditClick = useCallback((event, imageType) => {
    const containerRef = imageType === 'original' ? originalContainerRef : modifiedContainerRef;
    handleEditClick(event, imageType, containerRef);
  }, [handleEditClick]);

  const hintShapeSummary = useCallback((diff) => {
    const tolerance = diff.tolerance ?? 0;
    if (diff.type === 'rect') {
      return `${diff.x}%, ${diff.y}% • ${diff.width ?? 0}×${diff.height ?? 0} ±${tolerance}`;
    }
    if (diff.type === 'polygon') {
      return `${diff.points?.length ?? 0} puntos • tol±${tolerance}`;
    }
    return `${diff.x}%, ${diff.y}% • r=${diff.radius ?? 0} ±${tolerance}`;
  }, []);

  const handleSelectGame = useCallback((gameId) => {
    if (gameId === 'find-differences') {
      setShowGameSelector(false);
      setShowWelcomeScreen(false);
    }
  }, [setShowWelcomeScreen]);

  // Mostrar GameSelector si está activo
  if (showGameSelector) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <GameSelector onSelectGame={handleSelectGame} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      {showWelcomeScreen && (
        <Suspense fallback={<LoadingFallback />}>
          <Welcome
            onEnter={() => setShowWelcomeScreen(false)}
            onStart={startGame}
          />
        </Suspense>
      )}

      {levelError && (
        <Suspense fallback={<LoadingFallback />}>
          <Modal
            title={texts.modals.loadError.title}
            description={levelError}
            tone="danger"
            actions={[
              { label: texts.modals.loadError.retry, variant: 'primary', onClick: reloadCurrentLevel }
            ]}
          />
        </Suspense>
      )}

      {showVictory && (
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      )}

      {showTimeoutModal && (
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
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
            imageSrc={levelData?.originalImage ?? DEFAULT_IMAGES.original}
            fallbackTitle={texts.canvas.fallbackTitle}
            fallbackDescription={texts.canvas.original.fallbackDescription}
            borderClass="border-gray-200"
            isDevMode={isDevMode}
            editMode={editMode}
            onPlayClick={(event) => handleImageClick(event, 'original')}
            onEditClick={(event) => onEditClick(event, 'original')}
            overlays={
              <GameOverlays
                imageType="original"
                editMode={editMode}
                isDevMode={isDevMode}
                differences={differences}
                foundDifferences={foundDifferences}
                wrongClick={wrongClick}
                selectedDifferenceId={selectedDifferenceId}
                onSelectDifference={setSelectedDifferenceId}
                onPointerDown={handlePointerDown}
              />
            }
          />

          <ImageCanvas
            title={texts.canvas.modified.title}
            containerRef={modifiedContainerRef}
            imageSrc={levelData?.modifiedImage ?? DEFAULT_IMAGES.modified}
            fallbackTitle={texts.canvas.fallbackTitle}
            fallbackDescription={texts.canvas.modified.fallbackDescription}
            borderClass="border-purple-300"
            isDevMode={isDevMode}
            editMode={editMode}
            onPlayClick={(event) => handleImageClick(event, 'modified')}
            onEditClick={(event) => onEditClick(event, 'modified')}
            overlays={
              <GameOverlays
                imageType="modified"
                editMode={editMode}
                isDevMode={isDevMode}
                differences={differences}
                foundDifferences={foundDifferences}
                wrongClick={wrongClick}
                selectedDifferenceId={selectedDifferenceId}
                onSelectDifference={setSelectedDifferenceId}
                onPointerDown={handlePointerDown}
              />
            }
          />
        </div>

        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </div>
    </div>
  );
};

export default App;
