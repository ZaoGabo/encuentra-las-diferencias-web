import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useCountdown from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('inicia y reduce el tiempo correctamente', () => {
    const { result } = renderHook(() => useCountdown(5));

    act(() => {
      result.current.start();
    });

    expect(result.current.timeLeft).toBe(5);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(3);
  });

  it('dispara onTimeout cuando llega a cero', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useCountdown(2, { onTimeout }));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(0);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('permite pausar y reiniciar el temporizador', () => {
    const { result } = renderHook(() => useCountdown(10));

    act(() => {
      result.current.start();
    });

    for (let i = 0; i < 3; i += 1) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(result.current.timeLeft).toBe(7);

    act(() => {
      result.current.pause();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.timeLeft).toBe(7);

    act(() => {
      result.current.reset();
    });

    expect(result.current.timeLeft).toBe(10);
  });
});
