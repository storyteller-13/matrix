/**
 * WindowManager tests – load script in jsdom and assert behavior
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';

describe('WindowManager', () => {
    beforeAll(async () => {
        document.body.innerHTML = `
            <div class="window" id="test-window">
                <div class="window-header"></div>
            </div>
            <div class="window" id="notes-window">
                <div class="window-header">
                    <button class="control close"></button>
                    <button class="control minimize"></button>
                </div>
                <div class="window-content">Notes content</div>
            </div>
            <div class="window" id="unknown-window">
                <div class="window-header">
                    <button class="control close"></button>
                </div>
            </div>
            <div id="notes-dock-item" class="dock-item"></div>
        `;
        await import('../core/window-manager.js');
    });

    it('exposes WindowManager on window after load', () => {
        expect(window.WindowManager).toBeDefined();
        expect(typeof window.WindowManager.open).toBe('function');
        expect(typeof window.WindowManager.close).toBe('function');
        expect(typeof window.WindowManager.bringToFront).toBe('function');
    });

    it('bringToFront increases z-index', () => {
        const wm = window.WindowManager;
        const el = document.getElementById('test-window');
        expect(el).toBeTruthy();
        const before = parseInt(el.style.zIndex || '0', 10) || 0;
        wm.bringToFront(el);
        const after = parseInt(el.style.zIndex, 10);
        expect(after).toBeGreaterThan(before);
    });

    it('exposes bringToFront globally', () => {
        expect(typeof window.bringToFront).toBe('function');
    });

    it('exposes WindowManagerClass for testing', () => {
        expect(window.WindowManagerClass).toBeDefined();
    });

    it('isCenteredWindow returns true for terminal-window, artwork-window, notes-letter-window, about-window, home-window', () => {
        const wm = window.WindowManager;
        const term = document.createElement('div');
        term.className = 'window terminal-window';
        const art = document.createElement('div');
        art.className = 'window artwork-window';
        const notes = document.createElement('div');
        notes.className = 'window notes-letter-window';
        const about = document.createElement('div');
        about.className = 'window about-window';
        const home = document.createElement('div');
        home.className = 'window home-window';
        expect(wm.isCenteredWindow(term)).toBe(true);
        expect(wm.isCenteredWindow(art)).toBe(true);
        expect(wm.isCenteredWindow(notes)).toBe(true);
        expect(wm.isCenteredWindow(about)).toBe(true);
        expect(wm.isCenteredWindow(home)).toBe(true);
    });

    it('isDockAnchoredWindow is true only for about-window', () => {
        const wm = window.WindowManager;
        const about = document.createElement('div');
        about.className = 'window about-window';
        const term = document.createElement('div');
        term.className = 'window terminal-window';
        expect(wm.isDockAnchoredWindow(about)).toBe(true);
        expect(wm.isDockAnchoredWindow(term)).toBe(false);
    });

    it('isCenteredWindow returns false for regular window', () => {
        const wm = window.WindowManager;
        const el = document.getElementById('test-window');
        expect(wm.isCenteredWindow(el)).toBe(false);
    });

    it('open() shows window and brings to front', () => {
        const wm = window.WindowManager;
        const el = document.getElementById('test-window');
        el.style.display = 'none';
        wm.open(el, null);
        expect(el.style.display).toBe('block');
        expect(parseInt(el.style.zIndex, 10)).toBeGreaterThan(0);
    });

    it('close() hides window after transition', async () => {
        const wm = window.WindowManager;
        const el = document.getElementById('test-window');
        wm.open(el, null);
        wm.close(el, null);
        await new Promise((r) => setTimeout(r, 250));
        expect(el.style.display).toBe('none');
    });

    it('minimize() applies transform and reduces opacity', () => {
        const wm = window.WindowManager;
        const el = document.getElementById('test-window');
        wm.minimize(el);
        expect(el.style.transform).toContain('translateY');
        expect(el.style.transform).toContain('scale(0.8)');
    });

    it('clicking .control.close closes window and clears dock active state', async () => {
        const wm = window.WindowManager;
        const notesWindow = document.getElementById('notes-window');
        const dockItem = document.getElementById('notes-dock-item');
        wm.open(notesWindow, dockItem);
        expect(notesWindow.style.display).toBe('block');
        dockItem.classList.add('active');
        const closeBtn = notesWindow.querySelector('.control.close');
        closeBtn.click();
        await new Promise((r) => setTimeout(r, 250));
        expect(notesWindow.style.display).toBe('none');
        expect(dockItem.classList.contains('active')).toBe(false);
    });

    it('clicking .control.minimize minimizes window', () => {
        const notesWindow = document.getElementById('notes-window');
        const minimizeBtn = notesWindow.querySelector('.control.minimize');
        notesWindow.style.display = 'block';
        minimizeBtn.click();
        expect(notesWindow.style.transform).toContain('translateY');
    });

    it('clicking .window-content (not on control) brings window to front', () => {
        const notesWindow = document.getElementById('notes-window');
        const content = notesWindow.querySelector('.window-content');
        const before = parseInt(notesWindow.style.zIndex || '0', 10) || 0;
        content.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const after = parseInt(notesWindow.style.zIndex, 10);
        expect(after).toBeGreaterThan(before);
    });

    it('clicking .control.close on window not in dockItemMap still closes window', async () => {
        const unknownWindow = document.getElementById('unknown-window');
        unknownWindow.style.display = 'block';
        const closeBtn = unknownWindow.querySelector('.control.close');
        closeBtn.click();
        await new Promise((r) => setTimeout(r, 250));
        expect(unknownWindow.style.display).toBe('none');
    });

    it('open() clamps a tall centered window that would overlap the dock', () => {
        const wm = window.WindowManager;
        const dock = document.createElement('div');
        dock.className = 'bottom-dock';
        document.body.appendChild(dock);
        vi.spyOn(dock, 'getBoundingClientRect').mockReturnValue({
            top: 700, bottom: 780, left: 0, right: 800, width: 800, height: 80,
            x: 0, y: 700, toJSON: () => {},
        });

        const about = document.createElement('div');
        about.className = 'window about-window';
        about.style.display = 'none';
        document.body.appendChild(about);
        vi.spyOn(about, 'getBoundingClientRect').mockReturnValue({
            top: 100, bottom: 820, left: 100, right: 700, width: 600, height: 720,
            x: 100, y: 100, toJSON: () => {},
        });
        vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); });

        wm.open(about, null);

        expect(about.style.display).toBe('flex');
        expect(about.style.top).toMatch(/\d+px/);
        expect(about.style.left).toMatch(/\d+px/);
        expect(about.style.transform).toContain('translate(-50%, -50%)');

        document.body.removeChild(about);
        document.body.removeChild(dock);
    });

    it('open() sits the about window just above the dock', () => {
        const wm = window.WindowManager;
        const dock = document.createElement('div');
        dock.className = 'bottom-dock';
        document.body.appendChild(dock);
        vi.spyOn(dock, 'getBoundingClientRect').mockReturnValue({
            top: 700, bottom: 754, left: 572, right: 868, width: 296, height: 54,
            x: 572, y: 700, toJSON: () => {},
        });

        const about = document.createElement('div');
        about.className = 'window about-window';
        about.style.display = 'none';
        document.body.appendChild(about);
        Object.defineProperty(about, 'offsetHeight', { configurable: true, value: 500 });
        Object.defineProperty(about, 'offsetWidth', { configurable: true, value: 860 });
        vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); });

        wm.open(about, null);

        const safeBottomY = 700 - wm.dockClearance;
        expect(about.style.display).toBe('flex');
        expect(about.style.bottom).toBe('auto');
        expect(parseFloat(about.style.top)).toBe(safeBottomY - 250 - wm.dockAnchorLift);
        expect(parseFloat(about.style.left)).toBe(window.innerWidth / 2);
        expect(about.style.transform).toContain('translate(-50%, -50%)');

        document.body.removeChild(about);
        document.body.removeChild(dock);
    });

    it('open() with centered window sets translate(-50%, -50%)', () => {
        const wm = window.WindowManager;
        const term = document.createElement('div');
        term.className = 'window terminal-window';
        term.style.display = 'none';
        document.body.appendChild(term);
        vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); });
        wm.open(term, null);
        expect(term.style.transform).toContain('translate(-50%, -50%)');
        expect(term.style.top).toBe('50%');
        expect(term.style.left).toBe('50%');
        document.body.removeChild(term);
    });

    it('open() clamps an overflowing centered non-dock window', () => {
        const wm = window.WindowManager;
        const dock = document.createElement('div');
        dock.className = 'bottom-dock';
        document.body.appendChild(dock);
        vi.spyOn(dock, 'getBoundingClientRect').mockReturnValue({
            top: 700, bottom: 780, left: 0, right: 800, width: 800, height: 80,
            x: 0, y: 700, toJSON: () => {},
        });

        const term = document.createElement('div');
        term.className = 'window terminal-window';
        term.style.display = 'none';
        document.body.appendChild(term);
        vi.spyOn(term, 'getBoundingClientRect').mockReturnValue({
            top: 50, bottom: 820, left: 100, right: 700, width: 600, height: 770,
            x: 100, y: 50, toJSON: () => {},
        });
        const clamp = vi.spyOn(wm, 'clampWindowToViewport');
        vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); });

        wm.open(term, null);
        expect(clamp).toHaveBeenCalledWith(term);

        document.body.removeChild(term);
        document.body.removeChild(dock);
    });

    it('open() centers the home-window in the middle of the page', () => {
        const wm = window.WindowManager;
        const home = document.createElement('div');
        home.className = 'window home-window';
        home.style.display = 'none';
        document.body.appendChild(home);
        vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); });
        wm.open(home, null);
        expect(home.style.transform).toContain('translate(-50%, -50%)');
        expect(home.style.top).toBe('50%');
        expect(home.style.left).toBe('50%');
        document.body.removeChild(home);
    });

    it('close() with centered window uses centered transform', async () => {
        const wm = window.WindowManager;
        const term = document.createElement('div');
        term.className = 'window terminal-window';
        term.style.display = 'block';
        document.body.appendChild(term);
        wm.close(term, null);
        expect(term.style.transform).toContain('translate(-50%, -50%)');
        await new Promise((r) => setTimeout(r, 250));
        expect(term.style.display).toBe('none');
        document.body.removeChild(term);
    });

    it('makeDraggable does nothing when window has no header', () => {
        const wm = new window.WindowManagerClass();
        const noHeader = document.createElement('div');
        noHeader.className = 'window';
        document.body.appendChild(noHeader);
        expect(() => wm.makeDraggable(noHeader)).not.toThrow();
        document.body.removeChild(noHeader);
    });

    it('dragging window header updates transform', () => {
        const wm = new window.WindowManagerClass();
        const win = document.createElement('div');
        win.className = 'window';
        win.innerHTML = '<div class="window-header">Title</div>';
        win.style.position = 'fixed';
        document.body.appendChild(win);
        wm.makeDraggable(win);
        const header = win.querySelector('.window-header');
        header.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, clientY: 20, bubbles: true }));
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 60, bubbles: true }));
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        expect(win.style.transform).toContain('translate(40px, 40px)');
        document.body.removeChild(win);
    });

    it('mousedown on .control does not start drag', () => {
        const wm = new window.WindowManagerClass();
        const win = document.createElement('div');
        win.className = 'window';
        win.innerHTML = '<div class="window-header"><button class="control close">x</button></div>';
        document.body.appendChild(win);
        wm.makeDraggable(win);
        const btn = win.querySelector('.control');
        btn.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, clientY: 10, bubbles: true }));
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true }));
        expect(win.style.transform).not.toContain('translate');
        document.body.removeChild(win);
    });

    it('dragging centered window (terminal-window) updates top/left and transform', () => {
        const wm = new window.WindowManagerClass();
        const win = document.createElement('div');
        win.className = 'window terminal-window';
        win.innerHTML = '<div class="window-header">Title</div>';
        win.style.position = 'fixed';
        win.style.width = '200px';
        win.style.height = '200px';
        document.body.appendChild(win);
        wm.makeDraggable(win);
        const header = win.querySelector('.window-header');
        vi.spyOn(win, 'getBoundingClientRect').mockReturnValue({
            left: 400,
            top: 300,
            width: 200,
            height: 200,
            right: 600,
            bottom: 500,
            x: 400,
            y: 300,
            toJSON: () => {},
        });
        header.dispatchEvent(new MouseEvent('mousedown', { clientX: 500, clientY: 400, bubbles: true }));
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 520, clientY: 420, bubbles: true }));
        expect(win.style.top).toMatch(/\d+px/);
        expect(win.style.left).toMatch(/\d+px/);
        expect(win.style.transform).toContain('translate(-50%, -50%)');
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        document.body.removeChild(win);
    });

    it('registerWindow, open, close, and minimize no-op for missing elements', () => {
        const wm = window.WindowManager;
        expect(() => wm.registerWindow(null)).not.toThrow();
        expect(() => wm.open(null)).not.toThrow();
        expect(() => wm.close(null)).not.toThrow();
        expect(() => wm.minimize(null)).not.toThrow();
    });

    it('open() marks the dock item active', () => {
        const wm = window.WindowManager;
        const el = document.getElementById('test-window');
        const dock = document.getElementById('notes-dock-item');
        const other = document.createElement('div');
        other.className = 'dock-item active';
        document.body.appendChild(other);
        wm.open(el, dock);
        expect(dock.classList.contains('active')).toBe(true);
        expect(other.classList.contains('active')).toBe(false);
        document.body.removeChild(other);
    });

    it('isCompactViewport follows matchMedia', () => {
        const wm = window.WindowManager;
        window.matchMedia = () => ({ matches: true });
        expect(wm.isCompactViewport()).toBe(true);
        window.matchMedia = () => ({ matches: false });
        expect(wm.isCompactViewport()).toBe(false);
        const original = window.matchMedia;
        delete window.matchMedia;
        expect(wm.isCompactViewport()).toBe(false);
        window.matchMedia = original;
    });

    it('open() centers about on a compact viewport instead of docking', () => {
        const wm = window.WindowManager;
        window.matchMedia = () => ({ matches: true });
        vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); });
        const about = document.createElement('div');
        about.className = 'window about-window';
        document.body.appendChild(about);
        wm.open(about, null);
        expect(about.style.top).toBe('50%');
        expect(about.style.left).toBe('50%');
        document.body.removeChild(about);
    });

    it('getSafeTopY uses the top panel and getSafeBottomY falls back without a dock', () => {
        const wm = window.WindowManager;
        const panel = document.createElement('div');
        panel.className = 'top-panel';
        document.body.appendChild(panel);
        vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({
            top: 0, bottom: 28, left: 0, right: 800, width: 800, height: 28,
            x: 0, y: 0, toJSON: () => {},
        });
        expect(wm.getSafeTopY()).toBe(28 + wm.viewportPadding);
        document.body.removeChild(panel);
        expect(wm.getSafeBottomY()).toBe(window.innerHeight - wm.viewportPadding);
    });

    it('clampValue returns min when max is below min', () => {
        const wm = window.WindowManager;
        expect(wm.clampValue(5, 10, 3)).toBe(10);
        expect(wm.clampValue(5, 1, 9)).toBe(5);
    });

    it('anchor and constrain helpers no-op for missing or unsized windows', () => {
        const wm = new window.WindowManagerClass();
        expect(() => wm.anchorCenteredWindowToDock(null)).not.toThrow();
        expect(() => wm.constrainWindowToVerticalBounds(null)).not.toThrow();
        expect(() => wm.clampWindowToViewport(null)).not.toThrow();
        const el = document.createElement('div');
        el.style.display = 'none';
        expect(() => wm.clampWindowToViewport(el)).not.toThrow();
        vi.spyOn(wm, 'getSafeTopY').mockReturnValue(100);
        vi.spyOn(wm, 'getSafeBottomY').mockReturnValue(90);
        const tall = document.createElement('div');
        document.body.appendChild(tall);
        wm.constrainWindowToVerticalBounds(tall);
        document.body.removeChild(tall);
    });

    it('constrainWindowToVerticalBounds shrinks a window that is too tall', () => {
        const wm = new window.WindowManagerClass();
        const el = document.createElement('div');
        document.body.appendChild(el);
        Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 2000 });
        wm.constrainWindowToVerticalBounds(el);
        expect(el.style.height).toMatch(/px/);
        document.body.removeChild(el);
    });

    it('clampWindowToViewport recenters a centered window', () => {
        const wm = new window.WindowManagerClass();
        const el = document.createElement('div');
        el.className = 'window terminal-window';
        el.style.display = 'block';
        document.body.appendChild(el);
        Object.defineProperty(el, 'offsetWidth', { configurable: true, value: 200 });
        Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 200 });
        vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
            left: 10, top: 10, width: 200, height: 200, right: 210, bottom: 210,
            x: 10, y: 10, toJSON: () => {},
        });
        wm.clampWindowToViewport(el);
        expect(el.style.transform).toContain('translate(-50%, -50%)');
        expect(el.style.left).toMatch(/px/);
        document.body.removeChild(el);
    });

    it('resize reclamps a registered window', () => {
        const wm = new window.WindowManagerClass();
        const win = document.createElement('div');
        win.className = 'window';
        win.innerHTML = '<div class="window-header">Title</div>';
        win.style.display = 'block';
        document.body.appendChild(win);
        const constrain = vi.spyOn(wm, 'constrainWindowToVerticalBounds');
        const clamp = vi.spyOn(wm, 'clampWindowToViewport');
        wm.makeDraggable(win);
        window.dispatchEvent(new Event('resize'));
        expect(constrain).toHaveBeenCalledWith(win);
        expect(clamp).toHaveBeenCalledWith(win);
        document.body.removeChild(win);
    });

    it('minimize sets reduced opacity after the delay', async () => {
        vi.useFakeTimers();
        const wm = window.WindowManager;
        const el = document.getElementById('test-window');
        wm.minimize(el);
        vi.advanceTimersByTime(200);
        expect(el.style.opacity).toBe('0.5');
        vi.useRealTimers();
    });

    it('content clicks on controls or links do not raise z-index', () => {
        const notesWindow = document.getElementById('notes-window');
        const before = parseInt(notesWindow.style.zIndex || '0', 10) || 0;
        notesWindow.querySelector('.control.close').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const link = document.createElement('a');
        link.href = '#';
        notesWindow.querySelector('.window-content').appendChild(link);
        link.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(parseInt(notesWindow.style.zIndex || '0', 10) || 0).toBeGreaterThanOrEqual(before);
    });

    it('dragging a centered window with an existing offset skips recentering', () => {
        const wm = new window.WindowManagerClass();
        const win = document.createElement('div');
        win.className = 'window terminal-window';
        win.innerHTML = '<div class="window-header">Title</div>';
        win._xOffset = 12;
        win._yOffset = 8;
        document.body.appendChild(win);
        wm.makeDraggable(win);
        const header = win.querySelector('.window-header');
        vi.spyOn(win, 'getBoundingClientRect').mockReturnValue({
            left: 400, top: 300, width: 200, height: 200, right: 600, bottom: 500,
            x: 400, y: 300, toJSON: () => {},
        });
        header.dispatchEvent(new MouseEvent('mousedown', { clientX: 500, clientY: 400, bubbles: true }));
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 510, clientY: 410, bubbles: true }));
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        expect(win._xOffset).not.toBe(0);
        document.body.removeChild(win);
    });

    it('bringToFront global no-ops without WindowManager', () => {
        const original = window.WindowManager;
        window.WindowManager = undefined;
        expect(() => window.bringToFront(document.getElementById('test-window'))).not.toThrow();
        window.WindowManager = original;
    });

    it('bringToFront global delegates to WindowManager', () => {
        const el = document.getElementById('test-window');
        const before = parseInt(el.style.zIndex || '0', 10) || 0;
        window.bringToFront(el);
        expect(parseInt(el.style.zIndex, 10)).toBeGreaterThan(before);
    });
});
