/**
 * TimedCache – the shared { data, timestamp } localStorage helper.
 */
import { describe, it, expect, beforeAll, beforeEach, vi, afterEach } from 'vitest';

describe('TimedCache', () => {
    beforeAll(async () => {
        await import('../core/timed-cache.js');
    });

    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('writes and reads back the same data within the max age', () => {
        window.TimedCache.write('k', { a: 1 });
        expect(JSON.parse(localStorage.getItem('k'))).toEqual({ data: { a: 1 }, timestamp: Date.now() });
        expect(window.TimedCache.read('k', 1000)).toEqual({ a: 1 });
    });

    it('returns null for expired data unless allowExpired is set', () => {
        window.TimedCache.write('k', 'old');
        vi.setSystemTime(Date.now() + 5000);
        expect(window.TimedCache.read('k', 1000)).toBeNull();
        expect(window.TimedCache.read('k', 1000, { allowExpired: true })).toBe('old');
    });

    it('returns null for missing or unreadable entries', () => {
        expect(window.TimedCache.read('missing', 1000)).toBeNull();
        localStorage.setItem('bad', '{not json');
        expect(window.TimedCache.read('bad', 1000, { allowExpired: true })).toBeNull();
    });

    it('ignores storage that is full or blocked', () => {
        const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });
        expect(() => window.TimedCache.write('k', 1)).not.toThrow();
        setItem.mockRestore();
    });
});
