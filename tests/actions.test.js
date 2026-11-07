/**
 * core/actions.js – delegated data-action clicks (replaces inline onclick)
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Actions', () => {
    beforeAll(async () => {
        await import('../core/actions.js');
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <button type="button" id="plain" data-action="testOpen"><span id="inner">x</span></button>
            <button type="button" id="witharg" data-action="testOpen" data-arg="books-2026"></button>
            <button type="button" id="missing" data-action="doesNotExist"></button>
            <button type="button" id="none"></button>
        `;
        window.testOpen = vi.fn();
    });

    it('calls the named window function with no argument', () => {
        document.getElementById('plain').click();
        expect(window.testOpen).toHaveBeenCalledTimes(1);
        expect(window.testOpen).toHaveBeenCalledWith();
    });

    it('passes data-arg through', () => {
        document.getElementById('witharg').click();
        expect(window.testOpen).toHaveBeenCalledWith('books-2026');
    });

    it('resolves clicks on nested elements to the control', () => {
        document.getElementById('inner').click();
        expect(window.testOpen).toHaveBeenCalledTimes(1);
    });

    it('ignores unknown actions and plain elements', () => {
        const missing = new MouseEvent('click', { bubbles: true, cancelable: true });
        document.getElementById('missing').dispatchEvent(missing);
        expect(missing.defaultPrevented).toBe(false);
        document.getElementById('none').click();
        expect(window.testOpen).not.toHaveBeenCalled();
    });

    it('does not fire when a handler on the control stops propagation', () => {
        const el = document.getElementById('plain');
        el.addEventListener('click', (e) => e.stopPropagation());
        el.click();
        expect(window.testOpen).not.toHaveBeenCalled();
    });

    it('ignores events whose target is not an element', () => {
        expect(() => window.Actions.handleAction({ target: document })).not.toThrow();
    });
});

describe('index.html has no inline script', () => {
    const html = readFileSync(join(__dirname, '../index.html'), 'utf8');

    it('has no inline event handlers or javascript: URLs', () => {
        expect(html).not.toMatch(/\son[a-z]+="/);
        expect(html).not.toContain('javascript:');
    });

    it('has no inline <script> blocks', () => {
        const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
        for (const [, attrs, body] of scripts) {
            expect(attrs).toMatch(/\ssrc="/);
            expect(body.trim()).toBe('');
        }
    });

    it('points every data-action at a function an app defines', () => {
        const actions = new Set([...html.matchAll(/data-action="(\w+)"/g)].map((m) => m[1]));
        expect(actions.size).toBeGreaterThan(5);
        const sources = ['core', 'applications'].flatMap((dir) => {
            return readdirSync(join(__dirname, '..', dir), { recursive: true })
                .filter((f) => f.endsWith('.js'))
                .map((f) => readFileSync(join(__dirname, '..', dir, f), 'utf8'));
        }).join('\n');
        for (const name of actions) {
            expect(sources, name).toMatch(new RegExp(`window\\.${name}\\s*=`));
        }
    });
});
