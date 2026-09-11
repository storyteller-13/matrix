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

    describe('device helpers', () => {
        afterEach(() => {
            if (window.matchMedia && window.matchMedia._restore) {
                window.matchMedia = window.matchMedia._restore;
            }
        });

        it('treats missing matchMedia as a capable desktop', () => {
            const original = window.matchMedia;
            delete window.matchMedia;
            expect(window.Env.matchesMedia('(pointer: coarse)')).toBe(false);
            expect(window.Env.isNarrowViewport()).toBe(false);
            expect(window.Env.isCoarsePointer()).toBe(false);
            expect(window.Env.isConstrainedDevice()).toBe(false);
            expect(window.Env.shouldAutoOpenDesktopPanels()).toBe(true);
            window.matchMedia = original;
        });

        it('treats a coarse pointer as a constrained device', () => {
            window.matchMedia = (query) => ({
                matches: String(query).includes('pointer: coarse'),
                addListener() {},
                removeListener() {},
            });
            expect(window.Env.isCoarsePointer()).toBe(true);
            expect(window.Env.isNarrowViewport()).toBe(false);
            expect(window.Env.isConstrainedDevice()).toBe(true);
            expect(window.Env.shouldAutoOpenDesktopPanels()).toBe(false);
        });

        it('treats a narrow viewport as a constrained device', () => {
            window.matchMedia = (query) => ({
                matches: String(query).includes('max-width'),
                addListener() {},
                removeListener() {},
            });
            expect(window.Env.isNarrowViewport()).toBe(true);
            expect(window.Env.isCoarsePointer()).toBe(false);
            expect(window.Env.isConstrainedDevice()).toBe(true);
            expect(window.Env.shouldAutoOpenDesktopPanels()).toBe(false);
        });
    });
});
