/**
 * Bird of the Day panel – Eastern dates, cache, direct fetch, UI wiring.
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

const birdDom = () => `
    <div id="bird-box" style="display: none;">
        <span id="bird-box-title"></span>
        <div id="bird-box-image-container"></div>
        <button id="bird-box-close"></button>
    </div>
    <div id="bird-popup" style="display: none;">
        <span id="bird-title"></span>
        <img id="bird-popup-image" />
        <div id="bird-scientific"></div>
        <div id="bird-explanation"></div>
        <div id="bird-date"></div>
        <a id="bird-learn-link" href="#"></a>
        <button id="bird-close"></button>
    </div>
`;

const sampleBird = {
    date: '2026-09-12',
    title: 'Common Sandpiper',
    scientific_name: 'Actitis hypoleucos',
    url: 'https://example.com/sandpiper.jpg',
    explanation: 'a small shorebird',
    wikipedia_url: 'https://en.wikipedia.org/wiki/Common_sandpiper',
};

describe('BirdPanel', () => {
    beforeAll(async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
        await import('../core/env.js');
        await import('../applications/bird/bird.js');
    });

    beforeEach(() => {
        document.body.innerHTML = birdDom();
        localStorage.clear();
        window.I18n = undefined;
        window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
        if (window.Env) {
            vi.spyOn(window.Env, 'shouldAutoOpenDesktopPanels').mockReturnValue(false);
        }
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('formats Eastern dates as YYYY-MM-DD and steps back one calendar day', () => {
        const panel = new window.BirdPanelClass();
        expect(panel.easternDateString(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(panel.easternDateString(-1) < panel.easternDateString(0)).toBe(true);
    });

    it('picks a stable page/hash for a given date', () => {
        const panel = new window.BirdPanelClass();
        expect(panel.dayOfYearFromDate('2026-01-01')).toBe(1);
        expect(panel.dayOfYearFromDate('2026-12-31')).toBe(365);
        expect(panel.hashDate('2026-09-12')).toBe(panel.hashDate('2026-09-12'));
        expect(panel.hashDate('2026-09-12')).not.toBe(panel.hashDate('2026-09-13'));
    });

    it('buildApiUrl uses the proxy base when present', () => {
        const panel = new window.BirdPanelClass();
        panel.apiBase = '/api/bird';
        expect(panel.buildApiUrl('2026-01-01')).toBe('/api/bird?date=2026-01-01');
        panel.apiBase = null;
        expect(panel.buildApiUrl('2026-01-01')).toBeNull();
    });

    it('photoUrl prefers large then medium then url', () => {
        const panel = new window.BirdPanelClass();
        expect(panel.photoUrl(null)).toBeNull();
        expect(panel.photoUrl({ large_url: 'L', medium_url: 'M' })).toBe('L');
        expect(panel.photoUrl({ medium_url: 'M', url: 'U' })).toBe('M');
        expect(panel.photoUrl({ url: 'U' })).toBe('U');
    });

    it('wikipediaTitleFromUrl decodes titles and tolerates bad urls', () => {
        const panel = new window.BirdPanelClass();
        expect(panel.wikipediaTitleFromUrl('http://en.wikipedia.org/wiki/Common_sandpiper'))
            .toBe('Common sandpiper');
        expect(panel.wikipediaTitleFromUrl('http://en.wikipedia.org/wiki/Anna%27s_Hummingbird'))
            .toBe("Anna's Hummingbird");
        expect(panel.wikipediaTitleFromUrl(null)).toBeNull();
        expect(panel.wikipediaTitleFromUrl('not a url')).toBeNull();
    });

    it('loads and displays a bird from the proxy payload', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => sampleBird,
        });
        const panel = new window.BirdPanelClass();
        panel.apiBase = '/api/bird';
        await panel.loadBird();

        const img = document.querySelector('#bird-box-image-container img');
        expect(img.src).toContain('sandpiper.jpg');
        expect(document.getElementById('bird-box-title').textContent).toBe("TODAY'S BIRD");
        expect(document.getElementById('bird-title').textContent).toBe('Common Sandpiper');
        expect(document.getElementById('bird-scientific').textContent).toBe('Actitis hypoleucos');
        expect(document.getElementById('bird-explanation').textContent).toBe('a small shorebird');
        expect(document.getElementById('bird-learn-link').href).toContain('Common_sandpiper');
        expect(panel.getCachedBird()).toEqual(sampleBird);
    });

    it('uses rate-limit and network failures to return stale cache', async () => {
        const stale = { ...sampleBird, date: '2026-09-10', url: 'https://example.com/old.jpg' };
        localStorage.setItem('bird_cache', JSON.stringify({
            data: stale,
            timestamp: Date.now() - 48 * 60 * 60 * 1000,
        }));

        const panel = new window.BirdPanelClass();
        panel.apiBase = '/api/bird';
        expect(panel.getCachedBird()).toBeNull();
        expect(panel.getCachedBird(true)).toEqual(stale);

        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 429 });
        expect(await panel.fetchBird()).toEqual(stale);

        global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
        expect(await panel.fetchBird()).toEqual(stale);
    });

    it('fetchBirdDirect skips birds without photos and enriches from Wikipedia', async () => {
        const taxa = {
            results: [
                { id: 1, name: 'NoPhoto bird', preferred_common_name: 'Nope', default_photo: null },
                {
                    id: 42,
                    name: 'Actitis hypoleucos',
                    preferred_common_name: 'Common Sandpiper',
                    wikipedia_url: 'http://en.wikipedia.org/wiki/Common_sandpiper',
                    default_photo: { medium_url: 'https://example.com/bird.jpg' },
                },
            ],
        };
        const wiki = {
            extract: 'a small shorebird',
            content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Common_sandpiper' } },
        };
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => taxa })
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => wiki });

        const panel = new window.BirdPanelClass();
        panel.apiBase = null;
        const data = await panel.fetchBirdDirect('2026-09-12');
        expect(data.title).toBe('Common Sandpiper');
        expect(data.url).toContain('bird.jpg');
        expect(data.explanation).toBe('a small shorebird');
        expect(data.avibase_url).toContain('Actitis');
        expect(data.inaturalist_url).toContain('/taxa/42');
    });

    it('fetchBirdDirect tolerates wikipedia failure and empty results', async () => {
        const panel = new window.BirdPanelClass();
        panel.apiBase = null;

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                results: [{
                    id: 7,
                    name: 'Turdus migratorius',
                    preferred_common_name: 'American Robin',
                    wikipedia_url: 'http://en.wikipedia.org/wiki/American_robin',
                    default_photo: { url: 'https://example.com/robin.jpg' },
                }],
            }),
        });
        // second fetch (wiki) fails
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    results: [{
                        id: 7,
                        name: 'Turdus migratorius',
                        preferred_common_name: 'American Robin',
                        wikipedia_url: 'http://en.wikipedia.org/wiki/American_robin',
                        default_photo: { url: 'https://example.com/robin.jpg' },
                    }],
                }),
            })
            .mockRejectedValueOnce(new Error('wiki down'));

        const data = await panel.fetchBirdDirect('2026-03-01');
        expect(data.title).toBe('American Robin');
        expect(data.explanation).toBe('');

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ results: [] }),
        });
        await expect(panel.fetchBirdDirect('2026-03-01')).rejects.toThrow(/no birds/i);

        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
        await expect(panel.fetchBirdDirect('2026-03-01')).rejects.toThrow(/inaturalist/i);
    });

    it('uses valid cache immediately and refreshes when url/date changes', async () => {
        const cached = { ...sampleBird, date: '2026-09-01', url: 'https://example.com/old.jpg', title: 'old' };
        const fresh = { ...sampleBird, date: '2026-09-12', url: 'https://example.com/new.jpg', title: 'new' };
        localStorage.setItem('bird_cache', JSON.stringify({ data: cached, timestamp: Date.now() }));

        let resolveFetch;
        global.fetch = vi.fn().mockImplementation(() => new Promise((resolve) => {
            resolveFetch = () => resolve({ ok: true, status: 200, json: async () => fresh });
        }));

        const panel = new window.BirdPanelClass();
        panel.apiBase = '/api/bird';
        await panel.loadBird();
        expect(document.querySelector('#bird-box-image-container img').src).toContain('old.jpg');
        resolveFetch();
        await new Promise((r) => setTimeout(r, 0));
        expect(document.querySelector('#bird-box-image-container img').src).toContain('new.jpg');
    });

    it('keeps cached display when refresh returns the same bird', async () => {
        localStorage.setItem('bird_cache', JSON.stringify({ data: sampleBird, timestamp: Date.now() }));
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => sampleBird,
        });
        const panel = new window.BirdPanelClass();
        panel.apiBase = '/api/bird';
        await panel.loadBird();
        expect(document.querySelector('#bird-box-image-container img').src).toContain('sandpiper.jpg');
    });

    it('ignores a failed background refresh of valid cache', async () => {
        localStorage.setItem('bird_cache', JSON.stringify({ data: sampleBird, timestamp: Date.now() }));
        global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
        const panel = new window.BirdPanelClass();
        panel.apiBase = '/api/bird';
        await panel.loadBird();
        expect(document.querySelector('#bird-box-image-container img').src).toContain('sandpiper.jpg');
    });

    it('shows an error when nothing can be fetched or cached', async () => {
        const panel = new window.BirdPanelClass();
        panel.apiBase = '/api/bird';
        await panel.loadBird();
        expect(document.querySelector('#bird-box-image-container .bird-error').innerHTML).toMatch(/loading/i);
    });

    it('falls back to stale cache after a failed fetch', async () => {
        const stale = { ...sampleBird, url: 'https://example.com/old.jpg' };
        localStorage.setItem('bird_cache', JSON.stringify({
            data: stale,
            timestamp: Date.now() - 48 * 60 * 60 * 1000,
        }));
        const panel = new window.BirdPanelClass();
        panel.apiBase = '/api/bird';
        await panel.loadBird();
        expect(document.querySelector('#bird-box-image-container img').src).toContain('old.jpg');
    });

    it('image click, close buttons, backdrop, and Escape wire up', () => {
        vi.useFakeTimers();
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
        const panel = new window.BirdPanelClass();
        document.getElementById('bird-box-image-container').click();
        expect(document.getElementById('bird-popup').style.display).toBe('flex');
        document.getElementById('bird-popup').click();
        expect(document.getElementById('bird-popup').style.display).toBe('none');

        panel.showPopup();
        document.getElementById('bird-close').click();
        expect(document.getElementById('bird-popup').style.display).toBe('none');

        panel.showPopup();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(document.getElementById('bird-popup').style.display).toBe('none');

        panel.showBox({ reload: false });
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        vi.advanceTimersByTime(400);
        expect(document.getElementById('bird-box').style.display).toBe('none');
        document.getElementById('bird-box-close').click();
    });

    it('toggleVisibility hides and shows the box', () => {
        vi.useFakeTimers();
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
        const panel = new window.BirdPanelClass();
        panel.showBox({ reload: false });
        expect(document.getElementById('bird-box').style.display).toBe('block');
        panel.toggleVisibility();
        vi.advanceTimersByTime(400);
        expect(document.getElementById('bird-box').style.display).toBe('none');
        panel.toggleVisibility();
        expect(document.getElementById('bird-box').style.display).toBe('block');
    });

    it('openBirdWindow toggles the panel', () => {
        const panel = new window.BirdPanelClass();
        window.BirdPanel = panel;
        const spy = vi.spyOn(panel, 'toggleVisibility');
        window.openBirdWindow();
        expect(spy).toHaveBeenCalled();
        window.BirdPanel = undefined;
        expect(() => window.openBirdWindow()).not.toThrow();
    });

    it('showError without a message renders an empty error node', () => {
        const panel = new window.BirdPanelClass();
        panel.showError();
        expect(document.querySelector('#bird-box-image-container .bird-error')).toBeTruthy();
    });

    it('displayBird handles missing optional nodes and image errors', () => {
        document.body.innerHTML = `<div id="bird-box-image-container"></div>`;
        const panel = new window.BirdPanelClass();
        panel.displayBird({ url: 'https://example.com/x.jpg' });
        const img = document.querySelector('#bird-box-image-container img');
        expect(img.alt).toMatch(/bird of the day/i);
        img.onerror();
        expect(document.querySelector('.bird-error')).toBeTruthy();
    });

    it('helpers no-op when nodes are missing', () => {
        document.body.innerHTML = '';
        const panel = new window.BirdPanelClass();
        expect(() => panel.showPopup()).not.toThrow();
        expect(() => panel.hidePopup()).not.toThrow();
        expect(() => panel.showError('x')).not.toThrow();
        expect(() => panel.toggleVisibility()).not.toThrow();
        expect(() => panel.showBox()).not.toThrow();
        expect(() => panel.hideBox()).not.toThrow();
        expect(() => panel.displayBird({ url: 'https://example.com/x.jpg' })).not.toThrow();
    });

    it('getCachedBird returns null for invalid JSON', () => {
        localStorage.setItem('bird_cache', '{bad');
        const panel = new window.BirdPanelClass();
        expect(panel.getCachedBird()).toBeNull();
    });

    it('cacheBird ignores storage errors', () => {
        const panel = new window.BirdPanelClass();
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
        expect(() => panel.cacheBird({ url: 'x' })).not.toThrow();
    });

    it('showBox reloads unless reload is false', async () => {
        const panel = new window.BirdPanelClass();
        const spy = vi.spyOn(panel, 'loadBird').mockResolvedValue();
        panel.showBox();
        expect(spy).toHaveBeenCalled();
        spy.mockClear();
        panel.showBox({ reload: false });
        expect(spy).not.toHaveBeenCalled();
    });

    it('stays closed on mobile init', () => {
        window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
        if (window.Env?.shouldAutoOpenDesktopPanels?.mockRestore) {
            window.Env.shouldAutoOpenDesktopPanels.mockRestore();
        }
        vi.spyOn(window.Env, 'shouldAutoOpenDesktopPanels').mockReturnValue(false);
        global.fetch.mockClear();
        const panel = new window.BirdPanelClass();
        expect(panel.isMobile()).toBe(true);
        expect(panel.shouldAutoOpen()).toBe(false);
        expect(document.getElementById('bird-box').style.display).not.toBe('block');
    });

    it('uses I18n fallbacks and re-renders on localechange', () => {
        window.I18n = {
            locale: 'ja',
            t(key) {
                if (key === 'bird.fallbackTitle') return 'きょうのとり';
                if (key === 'panel.birdTitle') return 'きょうのとり';
                if (key === 'panel.loading') return 'よみこみちゅう...';
                return key;
            },
        };
        const panel = new window.BirdPanelClass();
        panel.displayBird({ url: 'https://example.com/x.jpg', date: '2026-01-15' });
        expect(document.querySelector('#bird-box-image-container img').alt).toBe('きょうのとり');
        expect(document.getElementById('bird-box-title').textContent).toBe('きょうのとり');
        expect(document.getElementById('bird-title').textContent).toBe('きょうのとり');
        document.dispatchEvent(new CustomEvent('localechange'));
        expect(panel.lastData.url).toBe('https://example.com/x.jpg');
        panel.showError();
        expect(document.querySelector('.bird-error').textContent).toBe('よみこみちゅう...');
        window.I18n = undefined;
    });

    it('skips localechange without lastData and formats dates in Japanese', () => {
        const panel = new window.BirdPanelClass();
        const spy = vi.spyOn(panel, 'displayBird');
        panel.lastData = null;
        document.dispatchEvent(new CustomEvent('localechange'));
        expect(spy).not.toHaveBeenCalled();
        window.I18n = { locale: 'ja', t: (key) => key };
        const localeSpy = vi.spyOn(Date.prototype, 'toLocaleDateString');
        panel.displayBird({
            url: 'https://example.com/x.jpg',
            date: '2026-01-15',
            title: 'Sandpiper',
            scientific_name: 'Actitis hypoleucos',
        });
        expect(localeSpy).toHaveBeenCalledWith('ja-JP', expect.objectContaining({
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }));
        expect(document.getElementById('bird-title').textContent).toBe('Sandpiper');
        localeSpy.mockRestore();
        window.I18n = undefined;
    });

    it('hides scientific name when missing and falls back learn link', () => {
        const panel = new window.BirdPanelClass();
        panel.displayBird({
            url: 'https://example.com/x.jpg',
            date: '2026-01-15',
            title: 'Mystery bird',
        });
        expect(document.getElementById('bird-scientific').style.display).toBe('none');
        expect(document.getElementById('bird-learn-link').href).toContain('allaboutbirds.org');
    });

    it('shouldAutoOpen falls back to !isMobile when Env is missing', () => {
        const panel = new window.BirdPanelClass();
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

    it('fetchBird ignores proxy payloads without a url and uses direct path', async () => {
        const panel = new window.BirdPanelClass();
        panel.apiBase = '/api/bird';
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ title: 'nope' }),
        });
        expect(await panel.fetchBird()).toBeNull();

        panel.apiBase = null;
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    results: [{
                        name: 'Solo bird',
                        wikipedia_url: 'http://en.wikipedia.org/',
                        default_photo: { medium_url: 'https://example.com/solo.jpg' },
                    }],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ extract: 'alone', content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Solo' } } }),
            });
        const data = await panel.fetchBird();
        expect(data.url).toContain('solo.jpg');
        expect(data.avibase_url).toContain('Solo');
        expect(data.inaturalist_url).toBeNull();
    });

    it('fetchBirdDirect throws when no candidate has a photo url', async () => {
        const panel = new window.BirdPanelClass();
        panel.apiBase = null;
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                results: [{ id: 1, name: 'Ghost', default_photo: {} }],
            }),
        });
        await expect(panel.fetchBirdDirect('2026-09-12')).rejects.toThrow(/no bird with photo/i);

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ results: { broken: true } }),
        });
        await expect(panel.fetchBirdDirect('2026-09-12')).rejects.toThrow(/no birds/i);
    });

    it('fetchBirdDirect skips wiki when title is empty and tolerates non-ok wiki', async () => {
        const panel = new window.BirdPanelClass();
        panel.apiBase = null;
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                results: [{
                    wikipedia_url: 'http://en.wikipedia.org/',
                    default_photo: { url: 'https://example.com/untitled.jpg' },
                }],
            }),
        });
        const untitled = await panel.fetchBirdDirect('2026-09-12');
        expect(untitled.url).toContain('untitled.jpg');
        expect(untitled.explanation).toBe('');
        expect(untitled.avibase_url).toBeNull();
        expect(untitled.inaturalist_url).toBeNull();
        expect(global.fetch).toHaveBeenCalledTimes(1);

        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    results: [{
                        id: 3,
                        name: 'X',
                        preferred_common_name: 'Named',
                        wikipedia_url: 'http://en.wikipedia.org/wiki/Named',
                        default_photo: { url: 'https://example.com/named.jpg' },
                    }],
                }),
            })
            .mockResolvedValueOnce({ ok: false, status: 404 });
        const named = await panel.fetchBirdDirect('2026-09-12');
        expect(named.title).toBe('Named');
        expect(named.explanation).toBe('');
    });

    it('wikipediaTitleFromUrl returns null for empty wiki paths', () => {
        const panel = new window.BirdPanelClass();
        expect(panel.wikipediaTitleFromUrl('http://en.wikipedia.org/')).toBeNull();
        expect(panel.wikipediaTitleFromUrl('http://en.wikipedia.org/?x=1')).toBeNull();
    });
});
