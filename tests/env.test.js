/**
 * Env tests – isLocalhost() and getApiBase() behavior
 */
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';

describe('Env', () => {
    let realLocation;

    beforeAll(async () => {
        realLocation = window.location;
        await import('../core/env.js');
    });

    afterEach(() => {
        vi.stubGlobal('location', realLocation);
    });

    describe('isLocalhost', () => {
        it('returns true for hostname localhost', () => {
            vi.stubGlobal('location', { ...realLocation, hostname: 'localhost' });
            expect(window.Env.isLocalhost()).toBe(true);
        });

        it('returns true for hostname 127.0.0.1', () => {
            vi.stubGlobal('location', { ...realLocation, hostname: '127.0.0.1' });
            expect(window.Env.isLocalhost()).toBe(true);
        });

        it('returns true for empty hostname', () => {
            vi.stubGlobal('location', { ...realLocation, hostname: '' });
            expect(window.Env.isLocalhost()).toBe(true);
        });

        it('returns false for production hostname', () => {
            vi.stubGlobal('location', { ...realLocation, hostname: 'example.com' });
            expect(window.Env.isLocalhost()).toBe(false);
        });
    });

    describe('getApiBase', () => {
        it('returns null on localhost', () => {
            vi.stubGlobal('location', { ...realLocation, hostname: 'localhost' });
            expect(window.Env.getApiBase('apod')).toBe(null);
        });

        it('returns /api/<path> in production', () => {
            vi.stubGlobal('location', { ...realLocation, hostname: 'example.com' });
            expect(window.Env.getApiBase('apod')).toBe('/api/apod');
        });

        it('strips leading slash from path', () => {
            vi.stubGlobal('location', { ...realLocation, hostname: 'example.com' });
            expect(window.Env.getApiBase('/apod')).toBe('/api/apod');
        });
    });
});
