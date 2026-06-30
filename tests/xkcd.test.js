/**
 * XKCDPanel tests – constructor apiUrl, cache, display, showError, popup/box, ensureAbsoluteImageUrl
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

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

const xkcdDom = () => `
    <div id="xkcd-box" class="xkcd-box" style="display: none;">
        <div id="xkcd-box-title"></div>
        <div id="xkcd-box-image-container"></div>
        <button id="xkcd-box-close">Close</button>
    </div>
    <div id="xkcd-popup" style="display: none;">
        <img id="xkcd-popup-image" />
        <span id="xkcd-title"></span>
        <span id="xkcd-alt"></span>
        <button id="xkcd-close">Close</button>
    </div>
`;

describe('XKCDPanel', () => {
    let realLocation;

    beforeAll(async () => {
        realLocation = window.location;
        vi.stubGlobal('localStorage', makeFakeStorage());
        document.body.innerHTML = xkcdDom();
        await import('../core/env.js');
        await import('../applications/xkcd/xkcd.js');
    });

    beforeEach(() => {
        document.body.innerHTML = xkcdDom();
        if (typeof localStorage !== 'undefined' && typeof localStorage.clear === 'function') {
            localStorage.clear();
        }
        vi.stubGlobal('location', { ...realLocation, hostname: 'example.com' });
        global.fetch = vi.fn().mockResolvedValue({ ok: false });
    });

    it('exposes XKCDPanelClass and openXkcdWindow on window', () => {
        expect(window.XKCDPanelClass).toBeDefined();
        expect(typeof window.openXkcdWindow).toBe('function');
    });

    it('constructor sets apiUrl to /api/xkcd in production', () => {
        vi.stubGlobal('location', { ...realLocation, hostname: 'example.com' });
        const panel = new window.XKCDPanelClass();
        expect(panel.apiUrl).toBe('/api/xkcd');
    });

    it('constructor sets apiUrl with CORS proxy on localhost', () => {
        vi.stubGlobal('location', { ...realLocation, hostname: 'localhost' });
        const panel = new window.XKCDPanelClass();
        expect(panel.apiUrl).toContain('allorigins.win');
        expect(panel.apiUrl).toContain('xkcd.com');
    });

    it('getCachedXKCD returns null when cache empty', () => {
        const panel = new window.XKCDPanelClass();
        expect(panel.getCachedXKCD()).toBeNull();
    });

    it('getCachedXKCD returns data when cache valid', () => {
        const panel = new window.XKCDPanelClass();
        const data = { img: 'https://example.com/1.png', title: 'Test' };
        panel.cacheXKCD(data);
        expect(panel.getCachedXKCD()).toEqual(data);
    });

    it('getCachedXKCD returns null when cache expired', () => {
        const panel = new window.XKCDPanelClass();
        panel.cacheExpiry = 0;
        panel.cacheXKCD({ img: 'x', title: 'y' });
        expect(panel.getCachedXKCD()).toBeNull();
    });

    it('displayXKCD renders image and title', () => {
        const panel = new window.XKCDPanelClass();
        const data = { img: 'https://example.com/c.png', title: 'Comic', alt: 'Alt text' };
        panel.displayXKCD(data);
        const container = document.getElementById('xkcd-box-image-container');
        const img = container.querySelector('img');
        expect(img).toBeTruthy();
        expect(img.src).toContain('example.com/c.png');
        expect(document.getElementById('xkcd-box-title').textContent).toBe('XKCD');
    });

    it('displayXKCD calls showError when data invalid', () => {
        const panel = new window.XKCDPanelClass();
        const showErrorSpy = vi.spyOn(panel, 'showError').mockImplementation(() => {});
        panel.displayXKCD(null);
        expect(showErrorSpy).toHaveBeenCalled();
        panel.displayXKCD({});
        expect(showErrorSpy).toHaveBeenCalledTimes(2);
    });

    it('showError sets error message in container', () => {
        const panel = new window.XKCDPanelClass();
        panel.showError();
        const container = document.getElementById('xkcd-box-image-container');
        expect(container.innerHTML).toContain('xkcd-error');
        expect(container.innerHTML).toContain('failed to load');
    });

    it('showPopup shows popup and sets body overflow hidden', () => {
        const panel = new window.XKCDPanelClass();
        panel.showPopup();
        const popup = document.getElementById('xkcd-popup');
        expect(popup.style.display).toBe('flex');
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('hidePopup hides popup and restores body overflow', () => {
        const panel = new window.XKCDPanelClass();
        panel.showPopup();
        panel.hidePopup();
        const popup = document.getElementById('xkcd-popup');
        expect(popup.style.display).toBe('none');
        expect(document.body.style.overflow).toBe('');
    });

    it('hideBox sets box display none after timeout', async () => {
        const panel = new window.XKCDPanelClass();
        const box = document.getElementById('xkcd-box');
        box.style.display = 'block';
        panel.hideBox();
        await new Promise((r) => setTimeout(r, 450));
        expect(box.style.display).toBe('none');
    });

    it('ensureAbsoluteImageUrl prepends base for relative path', () => {
        const panel = new window.XKCDPanelClass();
        const data = { img: 'foo.png', title: 'x' };
        panel.ensureAbsoluteImageUrl(data);
        expect(data.img).toBe('https://imgs.xkcd.com/comics/foo.png');
    });

    it('ensureAbsoluteImageUrl leaves absolute url unchanged', () => {
        const panel = new window.XKCDPanelClass();
        const data = { img: 'https://imgs.xkcd.com/bar.png', title: 'x' };
        panel.ensureAbsoluteImageUrl(data);
        expect(data.img).toBe('https://imgs.xkcd.com/bar.png');
    });

    it('fetchWithTimeout returns response when fetch succeeds', async () => {
        const panel = new window.XKCDPanelClass();
        const mockRes = { ok: true, json: () => Promise.resolve({}) };
        global.fetch = vi.fn().mockResolvedValue(mockRes);
        const res = await panel.fetchWithTimeout('https://example.com', 5000);
        expect(res).toBe(mockRes);
    });

    it('fetchWithTimeout throws on abort', async () => {
        const panel = new window.XKCDPanelClass();
        const err = new Error('abort');
        err.name = 'AbortError';
        global.fetch = vi.fn().mockRejectedValue(err);
        await expect(panel.fetchWithTimeout('https://example.com', 10)).rejects.toThrow('Request timeout');
    });

    it('loadXKCD uses cache when available', async () => {
        const panel = new window.XKCDPanelClass();
        const cached = { img: 'https://cached.png', title: 'Cached' };
        panel.cacheXKCD(cached);
        const displaySpy = vi.spyOn(panel, 'displayXKCD').mockImplementation(() => {});
        await panel.loadXKCD();
        expect(displaySpy).toHaveBeenCalledWith(cached);
    });

    it('displayXKCD img.onload removes error/loading div', () => {
        const panel = new window.XKCDPanelClass();
        const container = document.getElementById('xkcd-box-image-container');
        container.innerHTML = '<div class="xkcd-loading">loading</div>';
        const data = { img: 'https://example.com/1.png', title: 'T', alt: 'A' };
        panel.displayXKCD(data);
        const img = container.querySelector('img');
        expect(img).toBeTruthy();
        img.onload();
        expect(container.querySelector('.xkcd-loading')).toBeNull();
    });

    it('displayXKCD img.onerror removes img and calls showError', () => {
        const panel = new window.XKCDPanelClass();
        const showErrorSpy = vi.spyOn(panel, 'showError').mockImplementation(() => {});
        const data = { img: 'https://example.com/bad.png', title: 'T' };
        panel.displayXKCD(data);
        const container = document.getElementById('xkcd-box-image-container');
        const img = container.querySelector('img');
        img.onerror();
        expect(showErrorSpy).toHaveBeenCalled();
    });

    it('toggleVisibility hides box when visible', async () => {
        const panel = new window.XKCDPanelClass();
        const box = document.getElementById('xkcd-box');
        box.style.display = 'block';
        panel.toggleVisibility();
        await new Promise((r) => setTimeout(r, 450));
        expect(box.style.display).toBe('none');
    });

    it('toggleVisibility shows box when hidden', () => {
        const panel = new window.XKCDPanelClass();
        const box = document.getElementById('xkcd-box');
        box.style.display = 'none';
        vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); });
        const loadSpy = vi.spyOn(panel, 'loadXKCD').mockResolvedValue(undefined);
        panel.toggleVisibility();
        expect(box.style.display).toBe('block');
        expect(loadSpy).toHaveBeenCalled();
    });

    it('showBox sets display and animates', () => {
        const panel = new window.XKCDPanelClass();
        const box = document.getElementById('xkcd-box');
        box.style.display = 'none';
        vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); });
        vi.spyOn(panel, 'loadXKCD').mockResolvedValue(undefined);
        panel.showBox();
        expect(box.style.display).toBe('block');
    });

    it('openXkcdWindow calls toggleVisibility when XKCDPanel exists', () => {
        const panel = new window.XKCDPanelClass();
        window.XKCDPanel = panel;
        const toggleSpy = vi.spyOn(panel, 'toggleVisibility').mockImplementation(() => {});
        window.openXkcdWindow();
        expect(toggleSpy).toHaveBeenCalled();
    });
});
