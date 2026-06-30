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

    it('isCenteredWindow returns true for terminal-window, artwork-window, notes-letter-window', () => {
        const wm = window.WindowManager;
        const term = document.createElement('div');
        term.className = 'window terminal-window';
        const art = document.createElement('div');
        art.className = 'window artwork-window';
        const notes = document.createElement('div');
        notes.className = 'window notes-letter-window';
        expect(wm.isCenteredWindow(term)).toBe(true);
        expect(wm.isCenteredWindow(art)).toBe(true);
        expect(wm.isCenteredWindow(notes)).toBe(true);
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
});
