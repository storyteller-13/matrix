/**
 * Terminal tests – commands, history, and context menu (IIFE binds once)
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

const terminalDom = `
    <div class="window" id="terminal-window" style="display: none; z-index: 100;">
        <div class="window-content">
            <div class="terminal" id="main-terminal">
                <div id="terminal-output-container"></div>
                <div class="terminal-line">
                    <span class="prompt">anon@nullstar:~$ </span>
                    <input type="text" id="terminal-input-main" />
                </div>
            </div>
        </div>
    </div>
`;

function typeCommand(command) {
    const input = document.getElementById('terminal-input-main');
    input.value = command;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return input;
}

function lastOutput() {
    const nodes = document.querySelectorAll('#terminal-output-container .terminal-output');
    return nodes[nodes.length - 1]?.textContent ?? '';
}

function outputText() {
    return document.getElementById('terminal-output-container').textContent;
}

describe('Terminal', () => {
    beforeAll(async () => {
        document.body.innerHTML = terminalDom;
        await import('../applications/terminal/terminal.js');
    });

    beforeEach(() => {
        typeCommand('cd');
        document.getElementById('terminal-output-container').innerHTML = '';
        document.getElementById('terminal-input-main').value = '';
        document.querySelectorAll('.terminal-context-menu').forEach((el) => {
            el.style.display = 'none';
        });
    });

    it('help, pwd, echo, date, and unknown command print output', () => {
        typeCommand('help');
        expect(lastOutput()).toMatch(/available commands/i);
        typeCommand('pwd');
        expect(lastOutput()).toBe('~');
        typeCommand('echo hello world');
        expect(lastOutput()).toBe('hello world');
        typeCommand('date');
        expect(lastOutput()).toMatch(/\d{4}/);
        typeCommand('nope');
        expect(lastOutput()).toMatch(/command not found: nope/i);
        typeCommand('   ');
        expect(document.querySelectorAll('#terminal-output-container .terminal-line').length).toBe(5);
    });

    it('ls lists home entries and supports -la and missing paths', () => {
        typeCommand('ls');
        expect(lastOutput()).toContain('.secrets');
        expect(lastOutput()).toContain('artwork');
        typeCommand('ls -la');
        expect(lastOutput()).toContain('drwxr-xr-x');
        typeCommand('ls /nope');
        expect(lastOutput()).toMatch(/no such file or directory/i);
    });

    it('cd changes directory and ls/cat work in the new path', () => {
        typeCommand('cd artwork');
        typeCommand('pwd');
        expect(lastOutput()).toBe('/artwork');
        typeCommand('ls');
        expect(lastOutput()).toContain('summer.png');
        typeCommand('cd ..');
        typeCommand('pwd');
        expect(lastOutput()).toBe('~');
        typeCommand('cat .secrets');
        expect(lastOutput()).toBe("let's be in love with life");
        typeCommand('cat missing');
        expect(lastOutput()).toMatch(/no such file or directory/i);
        typeCommand('cat');
        expect(lastOutput()).toMatch(/missing file operand/i);
        typeCommand('cat artwork');
        expect(lastOutput()).toMatch(/is a directory/i);
    });

    it('cd into a missing directory prints an error', () => {
        typeCommand('cd nowhere');
        expect(lastOutput()).toMatch(/no such file or directory: nowhere/i);
    });

    it('clear empties the output container', () => {
        typeCommand('echo stay');
        expect(outputText()).toContain('stay');
        typeCommand('clear');
        expect(document.getElementById('terminal-output-container').innerHTML).toBe('');
    });

    it('arrow keys walk command history', () => {
        typeCommand('echo one');
        typeCommand('echo two');
        const input = document.getElementById('terminal-input-main');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        expect(input.value).toBe('echo two');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        expect(input.value).toBe('echo one');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        expect(input.value).toBe('echo two');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        expect(input.value).toBe('');
    });

    it('view without a file prints a missing operand error', () => {
        typeCommand('view');
        expect(lastOutput()).toMatch(/missing file operand/i);
    });

    it('clicking the terminal focuses input and raises z-index without bringToFront', () => {
        const terminal = document.getElementById('main-terminal');
        const win = document.getElementById('terminal-window');
        win.style.zIndex = '100';
        const focusSpy = vi.spyOn(document.getElementById('terminal-input-main'), 'focus');
        terminal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(focusSpy).toHaveBeenCalled();
        expect(Number(win.style.zIndex)).toBeGreaterThan(100);
    });

    it('context menu opens on right click and hides on document click', () => {
        const terminal = document.getElementById('main-terminal');
        terminal.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, pageX: 12, pageY: 20 }));
        const menu = document.querySelector('.terminal-context-menu');
        expect(menu).toBeTruthy();
        expect(menu.style.display).toBe('block');
        document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(menu.style.display).toBe('none');
    });

    it('ls and cat work on absolute paths, home shortcuts, and /etc', () => {
        typeCommand('ls /');
        expect(lastOutput()).toContain('bin');
        typeCommand('ls /artwork');
        expect(lastOutput()).toContain('summer.png');
        typeCommand('ls artwork');
        expect(lastOutput()).toContain('summer.png');
        typeCommand('ls /nope/');
        expect(lastOutput()).toMatch(/no such file or directory/i);
        typeCommand('cd /etc');
        typeCommand('pwd');
        expect(lastOutput()).toBe('/etc');
        typeCommand('ls -la');
        expect(lastOutput()).toContain('os-release');
        typeCommand('cat /etc/os-release');
        expect(lastOutput()).toContain('nullstar');
        typeCommand('cd ~');
        typeCommand('cat ~/.secrets');
        expect(lastOutput()).toBe("let's be in love with life");
        typeCommand('echo');
        expect(lastOutput()).toBe('');
        typeCommand('cd');
        typeCommand('pwd');
        expect(lastOutput()).toBe('~');
        typeCommand('cd /artwork');
        typeCommand('pwd');
        expect(lastOutput()).toBe('/artwork');
        typeCommand('cat /artwork/summer.png');
        expect(lastOutput()).toBe('file');
    });

    it('cd into artwork from home uses the filesystem directory entry', () => {
        typeCommand('cd artwork');
        typeCommand('pwd');
        expect(lastOutput()).toBe('/artwork');
    });

    it('view opens pictures through ArtworkApp or a modal', async () => {
        window.ArtworkApp = { openImage: vi.fn() };
        class MockImage {
            set src(value) {
                this._src = value;
                queueMicrotask(() => this.onload?.());
            }
            get src() { return this._src; }
        }
        vi.stubGlobal('Image', MockImage);
        typeCommand('view summer.png');
        await Promise.resolve();
        expect(window.ArtworkApp.openImage).toHaveBeenCalledWith('/pages/artwork/summer.png');
        typeCommand('view artwork/love.png');
        await Promise.resolve();
        expect(window.ArtworkApp.openImage).toHaveBeenCalledWith('/pages/artwork/love.png');
        typeCommand('view pages/artwork/lion.jpg');
        await Promise.resolve();
        expect(window.ArtworkApp.openImage).toHaveBeenCalledWith('pages/artwork/lion.jpg');

        window.ArtworkApp = undefined;
        typeCommand('view summer.png');
        await Promise.resolve();
        await Promise.resolve();
        const modal = document.getElementById('terminal-image-modal');
        expect(modal).toBeTruthy();
        expect(modal.style.display).toBe('flex');
        modal.querySelector('img').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(modal.style.display).toBe('flex');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await new Promise((r) => setTimeout(r, 310));
        expect(modal.style.display).toBe('none');
        modal.click();
        await new Promise((r) => setTimeout(r, 310));
        expect(modal.style.display).toBe('none');
        typeCommand('view summer.png');
        await Promise.resolve();
        expect(document.getElementById('terminal-image-modal')).toBe(modal);
        vi.unstubAllGlobals();
    });

    it('view reports missing image files', async () => {
        class FailImage {
            set src(value) {
                this._src = value;
                queueMicrotask(() => this.onerror?.());
            }
            get src() { return this._src; }
        }
        vi.stubGlobal('Image', FailImage);
        typeCommand('view missing.png');
        await Promise.resolve();
        expect(lastOutput()).toMatch(/file does not exist/i);
        vi.unstubAllGlobals();
    });

    it('context menu open picture uses prompt', async () => {
        class MockImage {
            set src(value) {
                this._src = value;
                queueMicrotask(() => this.onload?.());
            }
            get src() { return this._src; }
        }
        vi.stubGlobal('Image', MockImage);
        vi.stubGlobal('prompt', vi.fn().mockReturnValueOnce('/pages/artwork/summer.png').mockReturnValueOnce(''));
        window.ArtworkApp = { openImage: vi.fn() };
        const terminal = document.getElementById('main-terminal');
        terminal.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, pageX: 12, pageY: 20 }));
        document.querySelector('.context-menu-item').click();
        await Promise.resolve();
        expect(window.ArtworkApp.openImage).toHaveBeenCalledWith('/pages/artwork/summer.png');
        terminal.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, pageX: 12, pageY: 20 }));
        document.querySelector('.context-menu-item').click();
        expect(window.prompt).toHaveBeenCalledTimes(2);
        vi.unstubAllGlobals();
    });

    it('click uses bringToFront when available', () => {
        window.bringToFront = vi.fn();
        document.getElementById('main-terminal').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(window.bringToFront).toHaveBeenCalled();
        delete window.bringToFront;
    });
});
