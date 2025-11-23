import { describe, it, expect } from 'vitest';
import { clampPercent, formatTime } from './gameUtils';

describe('gameUtils', () => {
  describe('clampPercent', () => {
    it('limita valores fuera del rango permitido', () => {
      expect(clampPercent(120)).toBe(100);
      expect(clampPercent(-10)).toBe(0);
    });

    it('acepta límites personalizados', () => {
      expect(clampPercent(75, 50, 80)).toBe(75);
      expect(clampPercent(10, 20, 40)).toBe(20);
    });
  });

  describe('formatTime', () => {
    it('convierte segundos en mm:ss', () => {
      expect(formatTime(125)).toBe('2:05');
      expect(formatTime(59)).toBe('0:59');
    });

    it('normaliza valores negativos', () => {
      expect(formatTime(-5)).toBe('0:00');
    });
  });
});
