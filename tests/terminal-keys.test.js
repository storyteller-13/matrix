/**
 * terminal.js – keyboard shortcuts, tab completion, persisted history and the view effect.
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

const dom = `
    <div class="window" id="terminal-window" style="display: none;">
        <div class="window-content">
            <div class="terminal" id="main-terminal">
                <div id="terminal-output-container" role="log" aria-live="polite"></div>
                <div class="terminal-line">
                    <span class="prompt">anon@nullstar:~$ </span>
                    <input type="text" id="terminal-input-main" aria-label="terminal command" />
                </div>
            </div>
        </div>
    </div>
`;

const input = () => document.getElementById('terminal-input-main');
const output = () => document.getElementById('terminal-output-container');
const press = (key, options = {}) => input().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }));
const type = (value) => { input().value = value; };
const enter = (value) => { type(value); press('Enter'); };
const lastOutput = () => {
    const nodes = output().querySelectorAll('.terminal-output');
    return nodes[nodes.length - 1]?.textContent ?? '';
};

describe('terminal keys', () => {
    beforeAll(async () => {
        document.body.innerHTML = dom;
        localStorage.clear();
        await import('../applications/terminal/terminal.js');
    });

    beforeEach(() => {
        enter('clear');
        type('');
    });

    it('exposes the output as a live log', () => {
        expect(output().getAttribute('role')).toBe('log');
    });

    it('Ctrl+L clears the output but keeps the typed text', () => {
        enter('echo one');
        type('half typed');
        press('l', { ctrlKey: true });
        expect(output().innerHTML).toBe('');
        expect(input().value).toBe('half typed');
    });

    it('Ctrl+C prints the cancelled line and empties the input', () => {
        type('echo nope');
        press('c', { ctrlKey: true });
        expect(output().querySelector('.command').textContent).toBe('echo nope^C');
        expect(input().value).toBe('');
    });

    it('Tab completes a unique match and adds a space', () => {
        type('cat /etc/o');
        press('Tab');
        expect(input().value).toBe('cat /etc/os-release ');
        type('');
    });

    it('Tab completes a directory with a trailing slash and no space', () => {
        type('cd /ar');
        press('Tab');
        expect(input().value).toBe('cd /artwork/');
        type('');
    });

    it('Tab with several matches prints them and leaves the input alone', () => {
        type('cat /artwork/');
        press('Tab');
        expect(input().value).toBe('cat /artwork/');
        expect(lastOutput()).toBe('/artwork/lion.jpg  /artwork/love.jpg  /artwork/memories.jpg  /artwork/summer.jpg');
        type('');
    });

    it('Tab on a single directory match completes it', () => {
        type('ls /ho');
        press('Tab');
        expect(input().value).toBe('ls /home/');
        type('');
    });

    it('stores history in localStorage and restores it on the next page load', async () => {
        enter('echo remembered');
        expect(JSON.parse(localStorage.getItem('terminal-history'))).toContain('echo remembered');
        vi.resetModules();
        document.body.innerHTML = dom;
        await import('../applications/terminal/terminal.js');
        press('ArrowUp');
        expect(input().value).toBe('echo remembered');
    });

    it('ignores history that is not a list of strings', () => {
        localStorage.setItem('terminal-history', '{"nope": true}');
        vi.resetModules();
        document.body.innerHTML = dom;
        return import('../applications/terminal/terminal.js').then(() => {
            press('ArrowUp');
            expect(input().value).toBe('');
        });
    });

    it('view runs the picture effect through ArtworkApp', async () => {
        window.ArtworkApp = { openImage: vi.fn() };
        class OkImage {
            set src(value) { this._src = value; queueMicrotask(() => this.onload?.()); }
            get src() { return this._src; }
        }
        vi.stubGlobal('Image', OkImage);
        enter('view love.jpg');
        await Promise.resolve();
        expect(window.ArtworkApp.openImage).toHaveBeenCalledWith('/pages/artwork/love.jpg');
        vi.unstubAllGlobals();
        delete window.ArtworkApp;
    });
});

describe('terminal fun commands in the UI', () => {
    beforeEach(() => {
        document.body.innerHTML = dom;
        enter('clear');
    });

    it('open calls the window function for the app', async () => {
        vi.resetModules();
        window.openBooksWindow = vi.fn();
        window.openListsFolderWindow = vi.fn();
        await import('../applications/terminal/terminal.js');
        enter('open books');
        expect(window.openBooksWindow).toHaveBeenCalledWith();
        enter('open lists/adventures');
        expect(window.openListsFolderWindow).toHaveBeenCalledWith('adventures');
        delete window.openBooksWindow;
        delete window.openListsFolderWindow;
    });

    it('open says when the app is not loaded', async () => {
        vi.resetModules();
        await import('../applications/terminal/terminal.js');
        enter('open notes');
        expect(lastOutput()).toBe('open: notes is not loaded');
    });

    it('matrix toggles the matrix theme on and back off', async () => {
        vi.resetModules();
        window.matchMedia = vi.fn(() => ({ matches: false }));
        await import('../applications/terminal/terminal.js');
        enter('matrix');
        expect(document.documentElement.classList.contains('matrix-theme')).toBe(true);
        expect(lastOutput()).toMatch(/wake up, anon/);
        enter('matrix');
        expect(document.documentElement.classList.contains('matrix-theme')).toBe(false);
        expect(lastOutput()).toBe('back to the simulation.');
        delete window.matchMedia;
    });

    it('matrix clears earlier output so only its message remains', async () => {
        vi.resetModules();
        window.matchMedia = vi.fn(() => ({ matches: false }));
        await import('../applications/terminal/terminal.js');
        enter('echo before the rain');
        expect(output().textContent).toContain('before the rain');
        enter('matrix');
        expect(output().textContent).not.toContain('before the rain');
        expect(output().querySelectorAll('.terminal-output').length).toBe(1);
        expect(lastOutput()).toMatch(/wake up, anon/);
        enter('matrix');
        delete window.matchMedia;
    });
});
