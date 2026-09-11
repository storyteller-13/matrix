/**
 * Sky panel – CosmyDay sky_summary planets, cache, and visibility
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';

function makeFakeStorage() {
    const store = {};
    return {
        getItem(k) { return store[k] ?? null; },
        setItem(k, v) { store[k] = String(v); },
        removeItem(k) { delete store[k]; },
        clear() { for (const k of Object.keys(store)) delete store[k]; },
        get length() { return Object.keys(store).length; },
        key(i) { return Object.keys(store)[i] ?? null; },
    };
}

const SAMPLE = {
    date: '2026-09-11',
    sky_summary: {
        sun: { sign: 'Virgo', degree: 18.8 },
        moon: { sign: 'Virgo', degree: 23.3 },
        mercury: { sign: 'Libra', degree: 1.4 },
        saturn: { sign: 'Aries', degree: 13.0, retrograde: true },
        stelliums: [],
        top_aspects: [{ planet1: 'Sun', planet2: 'Mars', type: 'sextile', orb: 1.19 }],
        mystery: { sign: 'Leo', degree: 4.2 },
    },
};

const skyDom = () => `
    <div id="sky-box" style="display: none;">
        <button id="sky-box-close"></button>
        <ul id="sky-planet-list"><li class="sky-error">loading...</li></ul>
    </div>
`;

describe('SkyPanel', () => {
    beforeAll(async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        window.matchMedia = window.matchMedia || (() => ({
            matches: false,
            addListener() {},
            removeListener() {},
        }));
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });
        document.body.innerHTML = skyDom();
        await import('../core/env.js');
        await import('../applications/sky/sky.js');
    });

    beforeEach(() => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        document.body.innerHTML = skyDom();
        window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => SAMPLE,
        });
        window.I18n = undefined;
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('formats degrees as sign angles and rounds minutes', () => {
        const panel = new window.SkyPanelClass();
        expect(panel.formatDegree(18.8)).toBe('18°48′');
        expect(panel.formatDegree(0.7)).toBe('0°42′');
        expect(panel.formatDegree(20)).toBe('20°00′');
        expect(panel.formatDegree(19.999)).toBe('20°00′');
        expect(panel.formatDegree('nope')).toBe('');
        expect(panel.formatDegree(NaN)).toBe('');
    });

    it('extracts planet items and skips non-planet keys', () => {
        const panel = new window.SkyPanelClass();
        const planets = panel.extractPlanets(SAMPLE.sky_summary);
        expect(planets.map((p) => p.key)).toEqual([
            'sun', 'moon', 'mercury', 'saturn', 'mystery',
        ]);
        expect(planets[0]).toMatchObject({
            name: 'sun',
            signShort: 'vir',
            degree: '18°48′',
            retrograde: false,
        });
        expect(planets.find((p) => p.key === 'saturn').retrograde).toBe(true);
        expect(panel.extractPlanets(null)).toEqual([]);
        expect(panel.extractPlanets('nope')).toEqual([]);
    });

    it('labels nodes and unknown keys', () => {
        const panel = new window.SkyPanelClass();
        expect(panel.planetLabel('north_node')).toBe('n. node');
        expect(panel.planetLabel('southnode')).toBe('s. node');
        expect(panel.planetLabel('south_node')).toBe('s. node');
        expect(panel.planetLabel('true_node')).toBe('true node');
        expect(panel.planetLabel('')).toBe('');
    });

    it('renders each sky_summary planet with sign and angle', async () => {
        const panel = new window.SkyPanelClass();
        await panel.loadSky();
        const rows = document.querySelectorAll('.sky-planet');
        expect(rows.length).toBe(5);
        expect(document.querySelector('.sky-planet-name').textContent).toBe('sun');
        expect(document.querySelector('.sky-planet-sign').textContent).toBe('vir');
        expect(document.querySelector('.sky-planet-angle').textContent).toBe('18°48′');
        expect(document.querySelectorAll('.sky-planet-rx').length).toBe(5);
        expect(document.querySelector('.sky-planet--saturn .sky-planet-rx').textContent).toBe('rx');
        expect(document.querySelector('.sky-planet--sun .sky-planet-rx').textContent).toBe('');
    });

    it('shows a loading error when sky_summary is empty', () => {
        const panel = new window.SkyPanelClass();
        panel.displaySky({ sky_summary: {} });
        expect(document.querySelector('.sky-error').textContent).toBe('loading...');
        panel.displaySky(null);
        expect(document.querySelector('.sky-error')).toBeTruthy();
    });

    it('uses cached sky then refreshes in the background', async () => {
        localStorage.setItem('sky_cache', JSON.stringify({
            data: { sky_summary: { sun: { sign: 'Leo', degree: 1 } } },
            timestamp: Date.now(),
        }));
        let resolveFetch;
        global.fetch = vi.fn().mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));
        new window.SkyPanelClass();
        expect(document.querySelector('.sky-planet-sign').textContent).toBe('leo');
        resolveFetch({ ok: true, json: async () => SAMPLE });
        await vi.waitFor(() => {
            expect(document.querySelector('.sky-planet-sign').textContent).toBe('vir');
        });
    });

    it('falls back to stale cache when fetch fails', async () => {
        localStorage.setItem('sky_cache', JSON.stringify({
            data: { sky_summary: { moon: { sign: 'Cancer', degree: 10 } } },
            timestamp: Date.now() - 48 * 60 * 60 * 1000,
        }));
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
        const panel = new window.SkyPanelClass();
        await panel.loadSky();
        expect(document.querySelector('.sky-planet-name').textContent).toBe('moon');
    });

    it('shows an error when there is no cache and fetch fails', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
        const panel = new window.SkyPanelClass();
        await panel.loadSky();
        expect(document.querySelector('.sky-error').textContent).toBe('loading...');
    });

    it('ignores responses without sky_summary', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ date: '2026-09-11' }) });
        const panel = new window.SkyPanelClass();
        await panel.loadSky();
        expect(document.querySelector('.sky-error')).toBeTruthy();
    });

    it('returns stale cache from fetchSky when the request is not ok', async () => {
        localStorage.setItem('sky_cache', JSON.stringify({
            data: { sky_summary: { venus: { sign: 'Taurus', degree: 2 } } },
            timestamp: Date.now() - 48 * 60 * 60 * 1000,
        }));
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) });
        const panel = new window.SkyPanelClass();
        const data = await panel.fetchSky();
        expect(data.sky_summary.venus.sign).toBe('Taurus');
    });

    it('getCachedSky rejects expired entries unless allowed', () => {
        const panel = new window.SkyPanelClass();
        expect(panel.getCachedSky()).toBeNull();
        localStorage.setItem('sky_cache', '{not json');
        expect(panel.getCachedSky(true)).toBeNull();
        localStorage.setItem('sky_cache', JSON.stringify({
            data: { sky_summary: { sun: { sign: 'Aries', degree: 1 } } },
            timestamp: Date.now() - 48 * 60 * 60 * 1000,
        }));
        expect(panel.getCachedSky()).toBeNull();
        expect(panel.getCachedSky(true).sky_summary.sun.sign).toBe('Aries');
    });

    it('cacheSky swallows storage errors', () => {
        const panel = new window.SkyPanelClass();
        vi.stubGlobal('localStorage', {
            getItem() { return null; },
            setItem() { throw new Error('quota'); },
        });
        expect(() => panel.cacheSky({ sky_summary: {} })).not.toThrow();
    });

    it('starts minimized and close, Escape, and toggle hide and show the box', () => {
        vi.useFakeTimers();
        const panel = new window.SkyPanelClass();
        expect(document.getElementById('sky-box').style.display).toBe('none');
        panel.toggleVisibility();
        expect(document.getElementById('sky-box').style.display).toBe('block');
        panel.toggleVisibility();
        vi.advanceTimersByTime(400);
        expect(document.getElementById('sky-box').style.display).toBe('none');
        panel.toggleVisibility();
        expect(document.getElementById('sky-box').style.display).toBe('block');
        document.getElementById('sky-box-close').click();
        vi.advanceTimersByTime(400);
        expect(document.getElementById('sky-box').style.display).toBe('none');

        panel.toggleVisibility();
        expect(document.getElementById('sky-box').style.display).toBe('block');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        vi.advanceTimersByTime(400);
        expect(document.getElementById('sky-box').style.display).toBe('none');
        panel.toggleVisibility();
        expect(document.getElementById('sky-box').style.display).toBe('block');
    });

    it('openSkyWindow toggles the panel and no-ops when missing', () => {
        const panel = new window.SkyPanelClass();
        window.SkyPanel = panel;
        const spy = vi.spyOn(panel, 'toggleVisibility');
        window.openSkyWindow();
        expect(spy).toHaveBeenCalled();
        window.SkyPanel = undefined;
        expect(() => window.openSkyWindow()).not.toThrow();
    });

    it('uses a centered transform on mobile', () => {
        window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
        const panel = new window.SkyPanelClass();
        expect(panel.isMobile()).toBe(true);
        expect(document.getElementById('sky-box').style.display).toBe('none');
        panel.showBox({ reload: false });
        expect(document.getElementById('sky-box').style.transform).toContain('translate(-50%, -50%)');
    });

    it('isMobile is false when matchMedia is missing', () => {
        const original = window.matchMedia;
        delete window.matchMedia;
        const panel = new window.SkyPanelClass();
        expect(panel.isMobile()).toBe(false);
        window.matchMedia = original;
    });

    it('helpers no-op without required nodes', () => {
        document.body.innerHTML = '';
        const panel = new window.SkyPanelClass();
        expect(() => panel.displaySky(SAMPLE)).not.toThrow();
        expect(() => panel.showError()).not.toThrow();
        expect(() => panel.toggleVisibility()).not.toThrow();
        expect(() => panel.showBox()).not.toThrow();
        expect(() => panel.hideBox()).not.toThrow();
    });

    it('init skips the close button when it is missing', () => {
        document.body.innerHTML = `<div id="sky-box"><ul id="sky-planet-list"></ul></div>`;
        expect(() => new window.SkyPanelClass()).not.toThrow();
    });

    it('uses the proxy API URL off localhost', () => {
        const orig = window.Env;
        window.Env = { getApiBase: () => '/api/sky' };
        const panel = new window.SkyPanelClass();
        expect(panel.buildApiUrl()).toBe('/api/sky');
        window.Env = orig;
    });

    it('uses the direct CosmyDay URL on localhost', () => {
        const orig = window.Env;
        window.Env = { getApiBase: () => null };
        const panel = new window.SkyPanelClass();
        expect(panel.buildApiUrl()).toBe('https://api.cosmyday.com/content/transit');
        window.Env = orig;
    });

    it('background refresh ignores failures after a cache hit', async () => {
        localStorage.setItem('sky_cache', JSON.stringify({
            data: { sky_summary: { sun: { sign: 'Leo', degree: 1 } } },
            timestamp: Date.now(),
        }));
        global.fetch = vi.fn().mockRejectedValue(new Error('later'));
        const panel = new window.SkyPanelClass();
        await panel.loadSky();
        await Promise.resolve();
        expect(document.querySelector('.sky-planet-sign').textContent).toBe('leo');
    });

    it('translates planets and re-renders on localechange', () => {
        window.I18n = {
            has: (key) => key.startsWith('sky.') || key === 'panel.loading',
            t(key) {
                if (key === 'sky.planet.sun') return 'たいよう';
                if (key === 'sky.sign.virgo') return 'おとめ';
                if (key === 'sky.rx') return '逆行';
                if (key === 'sky.retrograde') return '逆行';
                if (key === 'panel.loading') return 'よみこみちゅう...';
                return key;
            },
        };
        const panel = new window.SkyPanelClass();
        panel.displaySky(SAMPLE);
        expect(document.querySelector('.sky-planet-name').textContent).toBe('たいよう');
        expect(document.querySelector('.sky-planet-sign').textContent).toBe('おとめ');
        expect(document.querySelector('.sky-planet--saturn .sky-planet-rx').textContent).toBe('逆行');
        document.dispatchEvent(new CustomEvent('localechange'));
        expect(document.querySelector('.sky-planet-name').textContent).toBe('たいよう');
        panel.lastSky = null;
        document.dispatchEvent(new CustomEvent('localechange'));
        expect(document.querySelector('.sky-error').textContent).toBe('よみこみちゅう...');
        window.I18n = undefined;
    });

    it('falls back to short planet and sign labels when I18n has no key', () => {
        window.I18n = {
            has: () => false,
            t: () => 'よみこみちゅう...',
        };
        const panel = new window.SkyPanelClass();
        expect(panel.signLabel('Virgo')).toBe('vir');
        expect(panel.signLabel('')).toBe('');
        expect(panel.planetLabel('north_node')).toBe('n. node');
        expect(panel.planetLabel('true_node')).toBe('true node');
        panel.showError();
        expect(document.querySelector('.sky-error').textContent).toBe('よみこみちゅう...');
        window.I18n = undefined;
    });
});
