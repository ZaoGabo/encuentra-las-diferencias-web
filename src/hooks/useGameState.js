import { useState, useCallback } from 'react';

/**
 * Hook personalizado para gestionar el estado general del juego.
 * Maneja pantallas de bienvenida, victoria, timeout y navegación entre niveles.
 */
const useGameState = (levels = []) => {
    const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
    const [gameStarted, setGameStarted] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);

    const startGame = useCallback((totalDifferences) => {
        if (totalDifferences === 0) return;
        setShowWelcomeScreen(false);
        setShowTimeoutModal(false);
        setShowVictory(false);
        setGameStarted(true);
    }, []);

    const resetGameState = useCallback(() => {
        setShowVictory(false);
        setShowTimeoutModal(false);
        setGameStarted(false);
    }, []);

    const handleVictory = useCallback(() => {
        setShowVictory(true);
        setGameStarted(false);
    }, []);

    const handleTimeout = useCallback(() => {
        setShowTimeoutModal(true);
        setGameStarted(false);
    }, []);

    const goToNextLevel = useCallback((currentLevelId, setCurrentLevelId) => {
        if (levels.length < 2) {
            resetGameState();
            return;
        }
        const currentIndex = levels.findIndex(level => level.id === currentLevelId);
        const nextIndex = (currentIndex + 1) % levels.length;
        setCurrentLevelId(levels[nextIndex].id);
    }, [levels]);

    return {
        showWelcomeScreen,
        setShowWelcomeScreen,
        gameStarted,
        setGameStarted,
        showVictory,
        setShowVictory,
        showTimeoutModal,
        setShowTimeoutModal,
        startGame,
        resetGameState,
        handleVictory,
        handleTimeout,
        goToNextLevel,
    };
};

export default useGameState;
