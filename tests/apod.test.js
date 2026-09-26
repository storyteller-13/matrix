/**
 * APOD panel – Eastern dates, video/unpublished fallback, stale cache.
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

const apodDom = () => `
    <div id="apod-box" style="display: none;">
        <span id="apod-box-title"></span>
        <div id="apod-box-image-container"></div>
        <button id="apod-box-close"></button>
    </div>
    <div id="apod-popup" style="display: none;">
        <span id="apod-title"></span>
        <img id="apod-popup-image" />
        <div id="apod-explanation"></div>
        <div id="apod-date"></div>
        <button id="apod-close"></button>
    </div>
`;

describe('APODPanel', () => {
    beforeAll(async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
        await import('../core/env.js');
        await import('../applications/apod/apod.js');
    });

    beforeEach(() => {
        document.body.innerHTML = apodDom();
        localStorage.clear();
        window.I18n = undefined;
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('formats APOD dates as YYYY-MM-DD and steps back one calendar day', () => {
        const panel = new window.APODPanelClass();
        expect(panel.easternDateString(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(panel.easternDateString(-1) < panel.easternDateString(0)).toBe(true);
    });

    it('walks back past an unpublished date and a video to the last image', async () => {
        const image = {
            date: '2026-09-08',
            media_type: 'image',
            url: 'https://example.com/saturn.jpg',
            title: 'Saturn',
            explanation: 'hexagon'
        };
        let n = 0;
        global.fetch = vi.fn(async () => {
            const i = n % 3;
            n += 1;
            if (i === 0) return { ok: false, status: 404 };
            if (i === 1) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({ date: '2026-09-09', media_type: 'video', url: 'https://youtube.com/x' })
                };
            }
            return { ok: true, status: 200, json: async () => image };
        });

        const panel = new window.APODPanelClass();
        const data = await panel.fetchAPOD();
        expect(data).toEqual(image);
        expect(global.fetch).toHaveBeenCalled();
    });

    it('keeps expired cache and uses it when the API is rate limited', async () => {
        const stale = {
            date: '2026-09-01',
            media_type: 'image',
            url: 'https://example.com/old.jpg',
            title: 'old'
        };
        localStorage.setItem('apod_cache', JSON.stringify({
            data: stale,
            timestamp: Date.now() - 48 * 60 * 60 * 1000
        }));
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 429 });

        const panel = new window.APODPanelClass();
        expect(panel.getCachedAPOD()).toBeNull();
        expect(panel.getCachedAPOD(true)).toEqual(stale);
        expect(await panel.fetchAPOD()).toEqual(stale);
    });

    it('displays a fetched image and caches it', async () => {
        const image = {
            date: '2026-09-08',
            media_type: 'image',
            url: 'https://example.com/saturn.jpg',
            title: 'Saturn',
            explanation: 'hexagon'
        };
        global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => image });
        const panel = new window.APODPanelClass();
        await panel.loadAPOD();
        const img = document.querySelector('#apod-box-image-container img');
        expect(img.src).toContain('saturn.jpg');
        expect(document.getElementById('apod-box-title').textContent).toBe("TODAY'S UNIVERSE");
        expect(document.getElementById('apod-popup-image').src).toContain('saturn.jpg');
        expect(document.getElementById('apod-explanation').textContent).toBe('hexagon');
        expect(panel.getCachedAPOD()).toEqual(image);
    });

    it('uses valid cache immediately and refreshes when the date changes', async () => {
        const cached = {
            date: '2026-09-01',
            media_type: 'image',
            url: 'https://example.com/old.jpg',
            title: 'old',
            explanation: 'old'
        };
        const fresh = { ...cached, date: '2026-09-08', url: 'https://example.com/new.jpg', title: 'new' };
        localStorage.setItem('apod_cache', JSON.stringify({ data: cached, timestamp: Date.now() }));
        let resolveFetch;
        global.fetch = vi.fn().mockImplementation(() => new Promise((resolve) => {
            resolveFetch = () => resolve({ ok: true, status: 200, json: async () => fresh });
        }));
        new window.APODPanelClass();
        await Promise.resolve();
        expect(document.querySelector('#apod-box-image-container img').src).toContain('old.jpg');
        resolveFetch();
        await new Promise((r) => setTimeout(r, 0));
        expect(document.querySelector('#apod-box-image-container img').src).toContain('new.jpg');
    });

    it('keeps cached display when refresh returns the same date', async () => {
        const cached = {
            date: '2026-09-01',
            media_type: 'image',
            url: 'https://example.com/old.jpg',
            title: 'old'
        };
        localStorage.setItem('apod_cache', JSON.stringify({ data: cached, timestamp: Date.now() }));
        global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => cached });
        const panel = new window.APODPanelClass();
        await panel.loadAPOD();
        expect(document.querySelector('#apod-box-image-container img').src).toContain('old.jpg');
    });

    it('ignores a failed background refresh of valid cache', async () => {
        const cached = {
            date: '2026-09-01',
            media_type: 'image',
            url: 'https://example.com/old.jpg',
            title: 'old'
        };
        localStorage.setItem('apod_cache', JSON.stringify({ data: cached, timestamp: Date.now() }));
        global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
        const panel = new window.APODPanelClass();
        await panel.loadAPOD();
        expect(document.querySelector('#apod-box-image-container img').src).toContain('old.jpg');
    });

    it('shows an error when nothing can be fetched or cached', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
        const panel = new window.APODPanelClass();
        await panel.loadAPOD();
        expect(document.querySelector('#apod-box-image-container .apod-error').innerHTML).toMatch(/loading/i);
    });

    it('falls back to stale cache after a failed fetch', async () => {
        const stale = {
            date: '2026-09-01',
            media_type: 'image',
            url: 'https://example.com/old.jpg',
            title: 'old'
        };
        localStorage.setItem('apod_cache', JSON.stringify({
            data: stale,
            timestamp: Date.now() - 48 * 60 * 60 * 1000
        }));
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
        const panel = new window.APODPanelClass();
        await panel.loadAPOD();
        expect(document.querySelector('#apod-box-image-container img').src).toContain('old.jpg');
    });

    it('fetchAPOD continues after network errors and invalid JSON', async () => {
        global.fetch = vi.fn()
            .mockRejectedValueOnce(new Error('net'))
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => { throw new Error('bad json'); } })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ date: '2026-09-08', media_type: 'image', url: 'https://example.com/ok.jpg', title: 'ok' })
            });
        const panel = new window.APODPanelClass();
        const data = await panel.fetchAPOD();
        expect(data.url).toContain('ok.jpg');
    });

    it('buildApiUrl uses the proxy base when present', () => {
        const panel = new window.APODPanelClass();
        panel.apiBase = '/api/apod';
        expect(panel.buildApiUrl('2026-01-01')).toBe('/api/apod?date=2026-01-01');
        panel.apiBase = null;
        expect(panel.buildApiUrl('2026-01-01')).toContain('api.nasa.gov');
    });

    it('image click, close buttons, backdrop, and Escape wire up', () => {
        vi.useFakeTimers();
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
        const panel = new window.APODPanelClass();
        document.getElementById('apod-box-image-container').click();
        expect(document.getElementById('apod-popup').style.display).toBe('flex');
        document.getElementById('apod-popup').click();
        expect(document.getElementById('apod-popup').style.display).toBe('none');

        panel.showPopup();
        document.getElementById('apod-close').click();
        expect(document.getElementById('apod-popup').style.display).toBe('none');

        panel.showPopup();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(document.getElementById('apod-popup').style.display).toBe('none');

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        vi.advanceTimersByTime(400);
        expect(document.getElementById('apod-box').style.display).toBe('none');
        document.getElementById('apod-box-close').click();
    });

    it('toggleVisibility hides and shows the box', () => {
        vi.useFakeTimers();
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
        const panel = new window.APODPanelClass();
        panel.toggleVisibility();
        vi.advanceTimersByTime(400);
        expect(document.getElementById('apod-box').style.display).toBe('none');
        panel.toggleVisibility();
        expect(document.getElementById('apod-box').style.display).toBe('block');
    });

    it('openApodWindow toggles the panel', () => {
        const panel = new window.APODPanelClass();
        window.APODPanel = panel;
        const spy = vi.spyOn(panel, 'toggleVisibility');
        window.openApodWindow();
        expect(spy).toHaveBeenCalled();
        window.APODPanel = undefined;
        expect(() => window.openApodWindow()).not.toThrow();
    });

    it('showError without a message renders an empty error node', () => {
        const panel = new window.APODPanelClass();
        panel.showError();
        expect(document.querySelector('#apod-box-image-container .apod-error')).toBeTruthy();
    });

    it('displayAPOD handles missing optional nodes and image errors', () => {
        document.body.innerHTML = `<div id="apod-box-image-container"></div>`;
        const panel = new window.APODPanelClass();
        panel.displayAPOD({ url: 'https://example.com/x.jpg' });
        const img = document.querySelector('#apod-box-image-container img');
        expect(img.alt).toMatch(/astronomical/i);
        img.onerror();
        expect(document.querySelector('.apod-error')).toBeTruthy();
        expect(() => panel.displayAPOD({ url: 'https://example.com/x.jpg' })).not.toThrow();
    });

    it('helpers no-op when nodes are missing', () => {
        document.body.innerHTML = '';
        const panel = new window.APODPanelClass();
        expect(() => panel.showPopup()).not.toThrow();
        expect(() => panel.hidePopup()).not.toThrow();
        expect(() => panel.showError('x')).not.toThrow();
        expect(() => panel.toggleVisibility()).not.toThrow();
        expect(() => panel.showBox()).not.toThrow();
        expect(() => panel.hideBox()).not.toThrow();
        expect(() => panel.displayAPOD({ url: 'https://example.com/x.jpg' })).not.toThrow();
    });

    it('getCachedAPOD returns null for invalid JSON', () => {
        localStorage.setItem('apod_cache', '{bad');
        const panel = new window.APODPanelClass();
        expect(panel.getCachedAPOD()).toBeNull();
    });

    it('cacheAPOD ignores storage errors', () => {
        const panel = new window.APODPanelClass();
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
        expect(() => panel.cacheAPOD({ url: 'x' })).not.toThrow();
        vi.restoreAllMocks();
    });

    it('showBox reloads unless reload is false', async () => {
        const panel = new window.APODPanelClass();
        const spy = vi.spyOn(panel, 'loadAPOD').mockResolvedValue();
        panel.showBox();
        expect(spy).toHaveBeenCalled();
        spy.mockClear();
        panel.showBox({ reload: false });
        expect(spy).not.toHaveBeenCalled();
    });

    it('stays closed on mobile init', () => {
        window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
        global.fetch.mockClear();
        const panel = new window.APODPanelClass();
        expect(panel.isMobile()).toBe(true);
        expect(panel.shouldAutoOpen()).toBe(false);
        expect(document.getElementById('apod-box').style.display).not.toBe('block');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('shouldAutoOpen falls back to !isMobile when Env is missing', () => {
        const panel = new window.APODPanelClass();
        const originalEnv = window.Env;
        window.Env = undefined;
        window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
        expect(panel.shouldAutoOpen()).toBe(true);
        window.Env = {};
        expect(panel.shouldAutoOpen()).toBe(true);
        window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
        expect(panel.shouldAutoOpen()).toBe(false);
        window.Env = originalEnv;
    });

    it('uses I18n fallbacks and re-renders on localechange', () => {
        window.I18n = {
            locale: 'ja',
            t(key) {
                if (key === 'apod.fallbackTitle') return 'きょうのてんたいしゃしん';
                if (key === 'panel.loading') return 'よみこみちゅう...';
                return key;
            },
        };
        const panel = new window.APODPanelClass();
        panel.displayAPOD({ url: 'https://example.com/x.jpg', date: '2026-01-15' });
        expect(document.querySelector('#apod-box-image-container img').alt).toBe('きょうのてんたいしゃしん');
        expect(document.getElementById('apod-title').textContent).toBe('きょうのてんたいしゃしん');
        document.dispatchEvent(new CustomEvent('localechange'));
        expect(panel.lastData.url).toBe('https://example.com/x.jpg');
        panel.showError();
        expect(document.querySelector('.apod-error').textContent).toBe('よみこみちゅう...');
        window.I18n = undefined;
    });

    it('skips localechange without lastData and formats dates in Japanese', () => {
        const panel = new window.APODPanelClass();
        const spy = vi.spyOn(panel, 'displayAPOD');
        panel.lastData = null;
        document.dispatchEvent(new CustomEvent('localechange'));
        expect(spy).not.toHaveBeenCalled();
        window.I18n = { locale: 'ja', t: (key) => key };
        const localeSpy = vi.spyOn(Date.prototype, 'toLocaleDateString');
        panel.displayAPOD({
            url: 'https://example.com/x.jpg',
            date: '2026-01-15',
            title: 'Saturn',
        });
        expect(localeSpy).toHaveBeenCalledWith('ja-JP', expect.objectContaining({
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }));
        expect(document.getElementById('apod-title').textContent).toBe('Saturn');
        localeSpy.mockRestore();
        window.I18n = undefined;
    });
});
