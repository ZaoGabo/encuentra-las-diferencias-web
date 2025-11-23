import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  readJsonFromStorage,
  writeJsonToStorage,
  clearStorageKey,
  resetStorageCache,
} from './storage';

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStorageCache();
    vi.restoreAllMocks();
  });

  it('returns fallback when key is missing', () => {
    const fallback = [{ id: 1 }];
    const result = readJsonFromStorage('missing-key', fallback);
    expect(result).toEqual(fallback);
  });

  it('reads and caches JSON values to avoid repeated getItem calls', () => {
    localStorage.setItem('cached-key', JSON.stringify({ value: 42 }));
  const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    const firstRead = readJsonFromStorage('cached-key');
    const secondRead = readJsonFromStorage('cached-key');

    expect(firstRead).toEqual({ value: 42 });
    expect(secondRead).toEqual({ value: 42 });
    expect(getItemSpy).toHaveBeenCalledTimes(1);
  });

  it('writes JSON values and skips unchanged payloads', () => {
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    writeJsonToStorage('diff-key', { foo: 'bar' });
    writeJsonToStorage('diff-key', { foo: 'bar' });

    expect(setItemSpy).toHaveBeenCalledTimes(1);
  });

  it('clears storage keys and cache entries', () => {
    writeJsonToStorage('clear-me', { hello: 'world' });
    expect(readJsonFromStorage('clear-me')).toEqual({ hello: 'world' });

  const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');
    clearStorageKey('clear-me');

    expect(removeSpy).toHaveBeenCalledWith('clear-me');
    const fallback = readJsonFromStorage('clear-me', []);
    expect(fallback).toEqual([]);
  });
});
