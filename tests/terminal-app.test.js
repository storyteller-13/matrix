/**
 * TerminalApp tests – open helpers, dock, and missing window
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

const terminalAppDom = () => `
    <div class="window" id="terminal-window" style="display: none;">
        <input type="text" id="terminal-input-main" />
    </div>
    <div id="terminal-dock-item" class="dock-item"></div>
`;

describe('TerminalApp', () => {
    beforeAll(async () => {
        document.body.innerHTML = terminalAppDom();
        await import('../applications/terminal/terminal-app.js');
    });

    beforeEach(() => {
        document.body.innerHTML = terminalAppDom();
        window.WindowManager = undefined;
        window.bringToFront = undefined;
        window.TerminalApp = new window.TerminalAppClass();
    });

    it('exposes TerminalAppClass, TerminalApp, and openTerminalWindow', () => {
        expect(window.TerminalAppClass).toBeDefined();
        expect(window.TerminalApp).toBeDefined();
        expect(typeof window.openTerminalWindow).toBe('function');
    });

    it('init returns early when the window is missing', () => {
        document.body.innerHTML = '';
        const app = new window.TerminalAppClass();
        expect(app.window).toBeNull();
    });

    it('open uses WindowManager when present', () => {
        window.WindowManager = { open: vi.fn() };
        window.TerminalApp.open();
        expect(window.WindowManager.open).toHaveBeenCalledWith(
            document.getElementById('terminal-window'),
            document.getElementById('terminal-dock-item')
        );
        expect(document.getElementById('terminal-window').style.display).not.toBe('block');
    });

    it('open falls back when WindowManager is absent', () => {
        window.bringToFront = vi.fn();
        window.TerminalApp.open();
        const win = document.getElementById('terminal-window');
        expect(win.style.display).toBe('block');
        expect(document.getElementById('terminal-dock-item').classList.contains('active')).toBe(true);
        expect(window.bringToFront).toHaveBeenCalledWith(win);
    });

    it('open brings an already visible window to the front', () => {
        const win = document.getElementById('terminal-window');
        win.style.display = 'block';
        window.bringToFront = vi.fn();
        window.TerminalApp.open();
        expect(window.bringToFront).toHaveBeenCalledWith(win);
    });

    it('dock item click opens the terminal', () => {
        const openSpy = vi.spyOn(window.TerminalApp, 'open');
        document.getElementById('terminal-dock-item').click();
        expect(openSpy).toHaveBeenCalled();
    });

    it('openTerminalWindow opens TerminalApp when present', () => {
        const openSpy = vi.spyOn(window.TerminalApp, 'open');
        window.openTerminalWindow();
        expect(openSpy).toHaveBeenCalled();
    });

    it('openTerminalWindow no-ops when TerminalApp is missing', () => {
        window.TerminalApp = undefined;
        expect(() => window.openTerminalWindow()).not.toThrow();
    });

    it('setupEventListeners returns early without a dock item', () => {
        document.body.innerHTML = `<div class="window" id="terminal-window"></div>`;
        const app = new window.TerminalAppClass();
        expect(app.dockItem).toBeNull();
        expect(() => app.open()).not.toThrow();
    });

    it('open returns early without a window', () => {
        const app = new window.TerminalAppClass();
        app.window = null;
        expect(() => app.open()).not.toThrow();
    });

    it('openWithFallback resets offsets and skips bringToFront when missing', () => {
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
        const win = document.getElementById('terminal-window');
        win._xOffset = 10;
        win._yOffset = 20;
        window.TerminalApp.openWithFallback();
        expect(win._xOffset).toBe(0);
        expect(win._yOffset).toBe(0);
        expect(win.style.display).toBe('block');
    });

    it('openWithFallback works without a dock item', () => {
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
        window.TerminalApp.dockItem = null;
        expect(() => window.TerminalApp.openWithFallback()).not.toThrow();
    });

    it('focusInput no-ops without an input', () => {
        document.getElementById('terminal-input-main').remove();
        expect(() => window.TerminalApp.focusInput()).not.toThrow();
    });

    it('openWithWindowManager returns false without a manager', () => {
        expect(window.TerminalApp.openWithWindowManager()).toBe(false);
    });
});
