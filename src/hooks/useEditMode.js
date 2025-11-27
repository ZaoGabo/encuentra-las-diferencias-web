import { useState, useCallback, useEffect, useRef } from 'react';
import { EDITOR_CONFIG } from '../config/gameConfig';
import { clampPercent } from '../utils/gameUtils';
import { readJsonFromStorage, writeJsonToStorage } from '../utils/storage';
import { getDifferencesStorageKey } from '../config/gameConfig';
import { isDevMode } from '../utils/gameUtils';

/**
 * Hook personalizado para gestionar el modo de edición de diferencias.
 * Maneja el estado, ajustes y persistencia de diferencias en el modo edición.
 */
const useEditMode = (initialDifferences = [], currentLevelId = null) => {
    const [editMode, setEditMode] = useState(false);
    const [selectedDifferenceId, setSelectedDifferenceId] = useState(null);
    const [dragging, setDragging] = useState(null);
    const [differences, setDifferences] = useState(initialDifferences);
    const saveDifferencesTimeoutRef = useRef(null);

    // Sincronizar diferencias cuando cambien las iniciales
    useEffect(() => {
        setDifferences(initialDifferences);
    }, [initialDifferences]);

    // Guardar diferencias en localStorage (solo en dev mode)
    useEffect(() => {
        if (!isDevMode || !currentLevelId) return undefined;

        if (saveDifferencesTimeoutRef.current) {
            clearTimeout(saveDifferencesTimeoutRef.current);
        }

        saveDifferencesTimeoutRef.current = setTimeout(() => {
            writeJsonToStorage(getDifferencesStorageKey(currentLevelId), differences);
            saveDifferencesTimeoutRef.current = null;
        }, EDITOR_CONFIG.SAVE_DEBOUNCE_MS);

        return () => {
            if (saveDifferencesTimeoutRef.current) {
                clearTimeout(saveDifferencesTimeoutRef.current);
                saveDifferencesTimeoutRef.current = null;
            }
        };
    }, [differences, currentLevelId]);

    // Limpieza al desmontar
    useEffect(() => () => {
        if (saveDifferencesTimeoutRef.current) {
            clearTimeout(saveDifferencesTimeoutRef.current);
            saveDifferencesTimeoutRef.current = null;
        }
    }, []);

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

    // Navegación por teclado
    useEffect(() => {
        if (!editMode || !selectedDifferenceId) return undefined;

        const handleKeyDown = (event) => {
            const step = event.shiftKey ? EDITOR_CONFIG.NUDGE_STEP_FINE : EDITOR_CONFIG.NUDGE_STEP_NORMAL;
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

    // Manejo de arrastre optimizado con RAF
    useEffect(() => {
        if (!dragging) return undefined;

        let rafId = null;
        let lastEvent = null;

        const onPointerMove = (event) => {
            event.preventDefault();
            lastEvent = event;

            // Cancelar RAF anterior si existe
            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            // Programar actualización en el próximo frame
            rafId = requestAnimationFrame(() => {
                if (!lastEvent) return;

                const { rect, id, startMouseX, startMouseY, startXPercent, startYPercent } = dragging;
                const deltaXpx = lastEvent.clientX - startMouseX;
                const deltaYpx = lastEvent.clientY - startMouseY;
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

                lastEvent = null;
            });
        };

        const onPointerUp = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            setDragging(null);
        };

        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp);

        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [dragging]);

    const toggleEditMode = useCallback(() => {
        setEditMode(value => !value);
        setSelectedDifferenceId(null);
        setDragging(null);
    }, []);

    const adjustRadius = useCallback((id, delta) => {
        setDifferences(prev => prev.map(diff => {
            if (diff.id !== id) return diff;
            const radius = Math.max(EDITOR_CONFIG.MIN_RADIUS, (diff.radius ?? EDITOR_CONFIG.DEFAULT_CIRCLE_RADIUS) + delta);
            return { ...diff, radius: Math.round(radius * 100) / 100 };
        }));
    }, []);

    const adjustDimension = useCallback((id, key, delta, min = EDITOR_CONFIG.MIN_RECT_DIMENSION) => {
        setDifferences(prev => prev.map(diff => {
            if (diff.id !== id) return diff;
            const current = diff[key] ?? (key === 'width' ? EDITOR_CONFIG.DEFAULT_RECT_WIDTH : key === 'height' ? EDITOR_CONFIG.DEFAULT_RECT_HEIGHT : 0);
            const next = Math.max(min, current + delta);
            return { ...diff, [key]: Math.round(next * 100) / 100 };
        }));
    }, []);

    const adjustTolerance = useCallback((id, delta) => {
        setDifferences(prev => prev.map(diff => {
            if (diff.id !== id) return diff;
            const nextTolerance = Math.max(EDITOR_CONFIG.MIN_TOLERANCE, (diff.tolerance ?? EDITOR_CONFIG.DEFAULT_TOLERANCE) + delta);
            return { ...diff, tolerance: Math.round(nextTolerance * 100) / 100 };
        }));
    }, []);

    const changeShapeType = useCallback((id, nextType) => {
        setDifferences(prev => prev.map(diff => {
            if (diff.id !== id) return diff;
            if (nextType === 'rect') {
                const fallbackSize = Math.max(6, (diff.radius ?? EDITOR_CONFIG.DEFAULT_CIRCLE_RADIUS) * 2);
                return {
                    ...diff,
                    type: 'rect',
                    width: Math.round((diff.width ?? fallbackSize) * 100) / 100,
                    height: Math.round((diff.height ?? fallbackSize) * 100) / 100,
                };
            }
            if (nextType === 'circle') {
                const fallbackRadius = (diff.width ?? diff.height ?? EDITOR_CONFIG.DEFAULT_RECT_WIDTH) / 2;
                return {
                    ...diff,
                    type: 'circle',
                    radius: Math.round((diff.radius ?? fallbackRadius) * 100) / 100,
                };
            }
            return { ...diff, type: nextType };
        }));
    }, []);

    const removeDifference = useCallback((id) => {
        setDifferences(prev => prev.filter(diff => diff.id !== id));
    }, []);

    const handlePointerDown = useCallback((event, id, imageType, containerRef) => {
        event.preventDefault();
        event.stopPropagation();
        const container = containerRef.current;
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
    }, [differences]);

    const handleEditClick = useCallback((event, imageType, containerRef) => {
        const container = containerRef.current;
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
            radius: EDITOR_CONFIG.DEFAULT_CIRCLE_RADIUS,
            tolerance: EDITOR_CONFIG.DEFAULT_TOLERANCE,
            name: `Diferencia ${nextId}`
        };
        setDifferences(prev => [...prev, newDiff]);
        setSelectedDifferenceId(nextId);
    }, [differences]);

    const handleSizeInput = useCallback((id, key, value) => {
        const parsed = parseFloat(value);
        if (Number.isNaN(parsed)) return;
        let sanitized = parsed;
        if (key === 'tolerance') sanitized = Math.max(EDITOR_CONFIG.MIN_TOLERANCE, parsed);
        if (key === 'radius') sanitized = Math.max(EDITOR_CONFIG.MIN_RADIUS, parsed);
        if (key === 'width' || key === 'height') sanitized = Math.max(EDITOR_CONFIG.MIN_RECT_DIMENSION, parsed);
        setDifferences(prev => prev.map(diff => (
            diff.id === id
                ? { ...diff, [key]: Math.round(sanitized * 100) / 100 }
                : diff
        )));
    }, []);

    const loadDifferencesFromStorage = useCallback(() => {
        if (!isDevMode || !currentLevelId) return null;
        const stored = readJsonFromStorage(getDifferencesStorageKey(currentLevelId));
        if (Array.isArray(stored)) {
            return stored;
        }
        return null;
    }, [currentLevelId]);

    return {
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
        handlePointerDown,
        handleEditClick,
        handleSizeInput,
        loadDifferencesFromStorage,
    };
};

export default useEditMode;
