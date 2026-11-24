/**
 * Window manager keyboard access: labelled controls, Enter/Space on controls, Escape to close.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('window keyboard access', () => {
    beforeAll(async () => {
        await import('../core/window-manager.js');
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="window" id="todo-window" style="display: block; z-index: 200;">
                <div class="window-header">
                    <div class="window-controls"><span class="control close"></span></div>
                    <div class="window-title">todo</div>
                </div>
                <div class="window-content"></div>
            </div>
            <div class="window" id="notes-window" style="display: block; z-index: 300;">
                <div class="window-header"><div class="window-title">notes</div></div>
                <div class="window-content"><input id="note-field" /></div>
            </div>
            <div id="todo-dock-item" class="dock-item active"></div>
        `;
        new window.WindowManagerClass();
    });

    it('labels and focuses the window controls and names each window', () => {
        const close = document.querySelector('.control.close');
        expect(close.getAttribute('role')).toBe('button');
        expect(close.getAttribute('tabindex')).toBe('0');
        expect(close.getAttribute('aria-label')).toBe('close window');
        expect(document.getElementById('todo-window').getAttribute('aria-label')).toBe('todo');
    });

    it('Enter on a control triggers its click', () => {
        const close = document.querySelector('.control.close');
        close.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(document.getElementById('todo-window').style.opacity).toBe('0');
        expect(document.getElementById('notes-window').style.opacity).not.toBe('0');
    });

    it('Escape closes the top-most open window and releases its dock item', async () => {
        const notes = document.getElementById('notes-window');
        const todo = document.getElementById('todo-window');
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await wait(220);
        expect(notes.style.display).toBe('none');
        expect(todo.style.display).toBe('block');

        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await wait(220);
        expect(todo.style.display).toBe('none');
        expect(document.getElementById('todo-dock-item').classList.contains('active')).toBe(false);
    });

    it('Escape typed in a field does not close the window', async () => {
        const notes = document.getElementById('notes-window');
        document.getElementById('note-field').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await wait(220);
        expect(notes.style.display).toBe('block');
    });
});
