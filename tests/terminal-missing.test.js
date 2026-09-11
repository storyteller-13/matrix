/**
 * Terminal IIFE returns early when required nodes are missing.
 */
import { describe, it, expect } from 'vitest';

describe('terminal without DOM', () => {
    it('does not throw when the terminal nodes are absent', async () => {
        document.body.innerHTML = '<div id="app"></div>';
        await import('../applications/terminal/terminal.js');
        expect(document.getElementById('main-terminal')).toBeNull();
    });
});
