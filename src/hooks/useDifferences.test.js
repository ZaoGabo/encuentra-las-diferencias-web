import { renderHook, act } from '@testing-library/react';
import useDifferences from './useDifferences';

const sampleDifferences = [
  { id: 1, type: 'circle', x: 10, y: 10, radius: 5 },
  { id: 2, type: 'rect', x: 50, y: 50, width: 10, height: 8 },
];

describe('useDifferences', () => {
  it('registra aciertos y suma puntos', () => {
    const { result } = renderHook(() => useDifferences(sampleDifferences, {
      pointsPerHit: 120,
      penaltyPerMiss: 40,
      bonusPerSecond: 5,
    }));

    act(() => {
      result.current.registerClick(10, 10);
    });

    expect(result.current.foundDifferences).toContain(1);
    expect(result.current.score).toBe(120);
    expect(result.current.attempts).toBe(1);
  });

  it('aplica penalización pero no baja de cero', () => {
    const { result } = renderHook(() => useDifferences(sampleDifferences, {
      pointsPerHit: 50,
      penaltyPerMiss: 75,
    }));

    act(() => {
      result.current.registerClick(90, 90);
    });

    expect(result.current.score).toBe(0);
    expect(result.current.wrongClick).toMatchObject({ x: 90, y: 90 });
    expect(result.current.attempts).toBe(1);
  });

  it('agrega bonus de tiempo solo cuando hay segundos restantes', () => {
    const { result } = renderHook(() => useDifferences(sampleDifferences, {
      pointsPerHit: 80,
      bonusPerSecond: 3,
    }));

    act(() => {
      result.current.registerClick(10, 10);
      result.current.applyBonus(4);
    });

    expect(result.current.score).toBe(80 + 12);
  });
});
