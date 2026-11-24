/**
 * Terminal on touch screens: the key bar sends the same keys as a keyboard, and the input is set up for phones.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';

describe('terminal touch key bar', () => {
    beforeAll(async () => {
        document.body.innerHTML = `
            <div class="window" id="terminal-window" style="display: block;">
                <div class="window-content">
                    <div class="terminal" id="main-terminal">
                        <div id="terminal-output-container"></div>
                        <div class="terminal-line">
                            <span class="prompt">anon@nullstar:~$ </span>
                            <input type="text" id="terminal-input-main" />
                        </div>
                    </div>
                </div>
            </div>`;
        window.matchMedia = vi.fn(() => ({ matches: true }));
        await import('../applications/terminal/terminal.js');
    });

    it('adds a labelled key bar after the terminal on coarse pointers', () => {
        const bar = document.querySelector('.terminal-touch-bar');
        expect(bar).not.toBeNull();
        expect(bar.getAttribute('role')).toBe('toolbar');
        expect(bar.querySelectorAll('button').length).toBe(5);
    });

    it('the ^C button cancels the typed line, like Ctrl+C', () => {
        const input = document.getElementById('terminal-input-main');
        input.value = 'half typed';
        document.querySelector('[aria-label="cancel line"]').click();
        expect(document.getElementById('terminal-output-container').textContent).toContain('half typed^C');
        expect(input.value).toBe('');
    });

    it('sets phone-friendly input attributes', () => {
        const input = document.getElementById('terminal-input-main');
        expect(input.getAttribute('autocapitalize')).toBe('off');
        expect(input.enterKeyHint).toBe('go');
    });
});
