/**
 * Deep links: parsing ?open= and ?item=, building shareable links, and opening the right window.
 */
import { describe, it, expect, vi } from 'vitest';
import { parseDeepLink, deepLinkFor, openFromLocation } from '../core/deep-link.js';

describe('deep links', () => {
    it('parses an app and an optional item, and rejects unknown apps and odd item ids', () => {
        expect(parseDeepLink('?open=quotes')).toEqual({ app: 'quotes', item: undefined });
        expect(parseDeepLink('?open=books&item=books-2026')).toEqual({ app: 'books', item: 'books-2026' });
        expect(parseDeepLink('?open=nope')).toBeNull();
        expect(parseDeepLink('?open=books&item=../etc')).toEqual({ app: 'books', item: undefined });
        expect(parseDeepLink('')).toBeNull();
    });

    it('builds shareable links', () => {
        expect(deepLinkFor('books', 'books-2026', 'https://example.test/?old=1')).toBe('https://example.test/?open=books&item=books-2026');
        expect(deepLinkFor('quotes', undefined, 'https://example.test/')).toBe('https://example.test/?open=quotes');
    });

    it('opens the app from the current location, leaving ?folder= to the lists app', () => {
        const win = {
            location: { search: '?open=books&item=books-2026' },
            openBooksWindow: vi.fn(),
        };
        expect(openFromLocation(win)).toBe(true);
        expect(win.openBooksWindow).toHaveBeenCalledWith('books-2026');

        const folder = { location: { search: '?open=lists&folder=movies' }, openListsFolderWindow: vi.fn() };
        expect(openFromLocation(folder)).toBe(false);
        expect(folder.openListsFolderWindow).not.toHaveBeenCalled();

        const terminal = {
            location: { search: '?open=terminal&folder=movies' },
            openTerminalWindow: vi.fn(),
        };
        expect(openFromLocation(terminal)).toBe(true);
        expect(terminal.openTerminalWindow).toHaveBeenCalledOnce();
    });
});

describe('deep link openers', () => {
    it('does not toggle an app that is already showing', () => {
        document.body.innerHTML = '<div id="quotes-box" style="display: block;"></div>';
        const win = { getComputedStyle: window.getComputedStyle.bind(window), openQuotesWindow: vi.fn() };
        return import('../core/app-catalog.js').then(({ openApp: open }) => {
            expect(open('quotes', undefined, { win, doc: document })).toBe(true);
            expect(win.openQuotesWindow).not.toHaveBeenCalled();
            document.getElementById('quotes-box').style.display = 'none';
            expect(open('quotes', undefined, { win, doc: document })).toBe(true);
            expect(win.openQuotesWindow).toHaveBeenCalledTimes(1);
            expect(open('nope', undefined, { win, doc: document })).toBe(false);
        });
    });
});
