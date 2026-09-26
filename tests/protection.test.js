/**
 * Protection tests – context menu, keyboard shortcuts, and image drag are prevented
 */
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';

describe('Protection', () => {
    beforeAll(async () => {
        document.body.innerHTML = '<div id="root"><img id="test-img" alt="test" /></div>';
        await import('../core/protection.js');
    });

    beforeEach(() => {
        document.body.innerHTML = '<div id="root"><img id="test-img" alt="test" /></div>';
    });

    it('contextmenu is prevented on document', () => {
        const e = new MouseEvent('contextmenu', { bubbles: true });
        const preventSpy = vi.spyOn(e, 'preventDefault');
        document.dispatchEvent(e);
        expect(preventSpy).toHaveBeenCalled();
    });

    it('F12 keydown is prevented', () => {
        const e = new KeyboardEvent('keydown', { key: 'F12', bubbles: true });
        const preventSpy = vi.spyOn(e, 'preventDefault');
        document.dispatchEvent(e);
        expect(preventSpy).toHaveBeenCalled();
    });

    it('Ctrl+Shift+I (DevTools) keydown is prevented', () => {
        const e = new KeyboardEvent('keydown', {
            key: 'I',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true
        });
        const preventSpy = vi.spyOn(e, 'preventDefault');
        document.dispatchEvent(e);
        expect(preventSpy).toHaveBeenCalled();
    });

    it('Ctrl+U (View Source) keydown is prevented', () => {
        const e = new KeyboardEvent('keydown', {
            key: 'u',
            ctrlKey: true,
            bubbles: true
        });
        const preventSpy = vi.spyOn(e, 'preventDefault');
        document.dispatchEvent(e);
        expect(preventSpy).toHaveBeenCalled();
    });

    it('dragstart on IMG is prevented', () => {
        const img = document.getElementById('test-img');
        // jsdom has no DragEvent; use Event and set target so handler sees e.target.tagName === 'IMG'
        const e = new Event('dragstart', { bubbles: true });
        Object.defineProperty(e, 'target', { value: img, configurable: true });
        const preventSpy = vi.spyOn(e, 'preventDefault');
        document.dispatchEvent(e);
        expect(preventSpy).toHaveBeenCalled();
    });

    it('Ctrl+Shift+J (Console) keydown is prevented', () => {
        const e = new KeyboardEvent('keydown', {
            key: 'J',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true
        });
        const preventSpy = vi.spyOn(e, 'preventDefault');
        document.dispatchEvent(e);
        expect(preventSpy).toHaveBeenCalled();
    });

    it('Ctrl+Shift+C (Element Inspector) keydown is prevented', () => {
        const e = new KeyboardEvent('keydown', {
            key: 'C',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true
        });
        const preventSpy = vi.spyOn(e, 'preventDefault');
        document.dispatchEvent(e);
        expect(preventSpy).toHaveBeenCalled();
    });

    it('Ctrl+S (Save Page) keydown is prevented', () => {
        const e = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true });
        const preventSpy = vi.spyOn(e, 'preventDefault');
        document.dispatchEvent(e);
        expect(preventSpy).toHaveBeenCalled();
    });

    it('unblocked keydown does not call preventDefault', () => {
        const e = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
        const preventSpy = vi.spyOn(e, 'preventDefault');
        document.dispatchEvent(e);
        expect(preventSpy).not.toHaveBeenCalled();
    });

    it('dragstart on non-IMG target does not call preventDefault', () => {
        const div = document.createElement('div');
        div.id = 'non-img';
        document.body.appendChild(div);
        const e = new Event('dragstart', { bubbles: true });
        Object.defineProperty(e, 'target', { value: div, configurable: true });
        const preventSpy = vi.spyOn(e, 'preventDefault');
        document.dispatchEvent(e);
        expect(preventSpy).not.toHaveBeenCalled();
        document.body.removeChild(div);
    });
});
