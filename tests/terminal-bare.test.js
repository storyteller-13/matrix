/**
 * Terminal fallbacks when it is not wrapped in a window.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';

describe('terminal without window chrome', () => {
    beforeAll(async () => {
        document.body.innerHTML = `
            <div class="terminal" id="main-terminal">
                <div id="terminal-output-container"></div>
                <span class="prompt">anon@nullstar:~$ </span>
                <input type="text" id="terminal-input-main" />
            </div>
        `;
        await import('../applications/terminal/terminal.js');
    });

    it('updates the sibling prompt and focuses input on click', () => {
        const input = document.getElementById('terminal-input-main');
        input.value = 'cd artwork';
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        const prompt = document.querySelector('#main-terminal > .prompt');
        expect(prompt.textContent).toBe('anon@nullstar:/artwork$ ');

        const focusSpy = vi.spyOn(input, 'focus');
        document.getElementById('main-terminal').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(focusSpy).toHaveBeenCalled();
    });

    it('ignores clicks on buttons and links', () => {
        const terminal = document.getElementById('main-terminal');
        const btn = document.createElement('button');
        btn.textContent = 'x';
        terminal.appendChild(btn);
        const input = document.getElementById('terminal-input-main');
        const focusSpy = vi.spyOn(input, 'focus');
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(focusSpy).not.toHaveBeenCalled();
    });
});
