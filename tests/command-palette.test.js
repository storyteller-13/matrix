/**
 * Command palette: search ranking, item building, and the Ctrl+K interaction.
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { searchItems, buildItems, listItems, runItem } from '../core/command-palette.js';

const sample = [
    { label: 'books', group: 'apps', fn: 'openBooksWindow' },
    { label: 'my favorite books', group: 'lists', fn: 'openBooksWindow', arg: 'x' },
    { label: 'chess puzzle', group: 'apps', fn: 'openChessWindow' },
];

describe('searchItems', () => {
    it('matches every word and ranks labels that start with the first word first', () => {
        expect(searchItems(sample, 'book').map((i) => i.label)).toEqual(['books', 'my favorite books']);
        expect(searchItems(sample, 'favorite book').map((i) => i.label)).toEqual(['my favorite books']);
        expect(searchItems(sample, 'nothing here')).toEqual([]);
    });

    it('matches the group as well as the label', () => {
        expect(searchItems(sample, 'lists').map((i) => i.label)).toEqual(['my favorite books']);
    });

    it('returns the first items for an empty query', () => {
        expect(searchItems(sample, '  ', 2).map((i) => i.label)).toEqual(['books', 'my favorite books']);
    });
});

describe('buildItems and listItems', () => {
    it('builds app, quote and reflection items with the right window functions', () => {
        const items = buildItems({
            apps: [{ id: 'quotes', label: 'quotes' }],
            quotes: [{ text: 'to be strong, you have to be like water.', author: 'lao tzu' }],
            notes: [{ title: 'grateful graceful memories' }],
        });
        expect(items[0]).toEqual({ label: 'quotes', group: 'apps', app: 'quotes' });
        expect(items[1].group).toBe('quotes · lao tzu');
        expect(items[1].app).toBe('quotes');
        expect(items[2]).toEqual({ label: 'grateful graceful memories', group: 'reflections', app: 'notes' });
    });

    it('shortens long quotes', () => {
        const long = 'x'.repeat(200);
        const [item] = buildItems({ quotes: [{ text: long, author: 'a' }] }).filter((i) => i.group.startsWith('quotes'));
        expect(item.label.length).toBeLessThan(100);
        expect(item.label.endsWith('…')).toBe(true);
    });

    it('walks the lists folder: lists open their book window, folders their folder, episodes their episode', () => {
        const app = {
            rootEntries: () => [
                { id: 'books', label: 'books', kind: 'folder' },
                { id: 'podcasts', label: 'podcasts', kind: 'folder' },
            ],
            entriesForFolder: (id) => ({
                books: [{ id: 'books-2026', label: 'books i read in 2026', kind: 'list' }],
                podcasts: [{ id: 'ep-1', label: 'episode one', kind: 'podcast' }],
            })[id] || [],
        };
        const items = listItems(app);
        expect(items).toContainEqual({ label: 'books', group: 'lists', fn: 'openListsFolderWindow', arg: 'books' });
        expect(items).toContainEqual({ label: 'books i read in 2026', group: 'lists › books', fn: 'openBooksWindow', arg: 'books-2026' });
        expect(items).toContainEqual({ label: 'episode one', group: 'podcasts', fn: 'openPodcastEpisode', arg: 'ep-1' });
        expect(listItems(undefined)).toEqual([]);
    });

    it('ignores malformed list sources and unknown entry kinds', () => {
        expect(listItems({ rootEntries: [] })).toEqual([]);
        expect(listItems({ rootEntries: () => [{ kind: 'unknown' }] })).toEqual([]);
    });

    it('runs apps and optional window functions with or without arguments', () => {
        window.openBooksWindow = vi.fn();
        expect(runItem({ app: 'books' })).toBe(true);
        expect(runItem({ fn: 'openBooksWindow', arg: 'favorites' })).toBe(true);
        expect(window.openBooksWindow).toHaveBeenCalledWith('favorites');
        expect(runItem({ fn: 'openBooksWindow' })).toBe(true);
        expect(window.openBooksWindow).toHaveBeenLastCalledWith();
        expect(runItem({ fn: 'missingWindow' })).toBe(false);
        window.openBooksWindow = null;
        expect(runItem({ fn: 'openBooksWindow' })).toBe(false);
    });
});

describe('Ctrl+K palette', () => {
    beforeAll(async () => {
        window.openBooksWindow = vi.fn();
        window.openQuotesWindow = vi.fn();
        window.QUOTES = [{ text: 'what you seek is seeking you.', author: 'rumi' }];
        await import('../core/command-palette.js');
    });

    beforeEach(() => {
        document.querySelectorAll('.command-palette').forEach((el) => el.remove());
    });

    const press = (key, options = {}) => document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }));
    const input = () => document.querySelector('.command-palette-input');

    it('opens with Ctrl+K, filters as you type, and runs the chosen item with Enter', () => {
        press('k', { ctrlKey: true });
        expect(document.querySelector('.command-palette').hidden).toBe(false);
        input().value = 'quotes';
        input().dispatchEvent(new Event('input'));
        expect(document.querySelectorAll('.command-palette-result').length).toBeGreaterThan(0);
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(window.openQuotesWindow).toHaveBeenCalled();
        expect(document.querySelector('.command-palette').hidden).toBe(true);
    });

    it('Escape closes without running anything', () => {
        window.openBooksWindow.mockClear();
        press('k', { ctrlKey: true });
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(document.querySelector('.command-palette').hidden).toBe(true);
        expect(window.openBooksWindow).not.toHaveBeenCalled();
    });

    it('shows a message when nothing matches', () => {
        press('k', { ctrlKey: true });
        input().value = 'zzzzqqq';
        input().dispatchEvent(new Event('input'));
        expect(document.querySelector('.command-palette-empty').textContent).toMatch(/nothing matches/);
    });
});

describe('Ctrl+K palette keyboard and mouse', () => {
    const press = (key, options = {}) => document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }));
    const input = () => document.querySelector('.command-palette-input');
    const selected = () => document.querySelector('.command-palette-result[aria-selected="true"]');

    beforeEach(() => {
        document.querySelectorAll('.command-palette').forEach((el) => el.remove());
        window.openQuotesWindow = vi.fn();
        window.openBooksWindow = vi.fn();
        window.QUOTES = [{ text: 'a', author: 'x' }, { text: 'b', author: 'y' }];
    });

    it('arrow keys move the selection and wrap around', () => {
        press('k', { ctrlKey: true });
        input().value = 'quotes';
        input().dispatchEvent(new Event('input'));
        const count = document.querySelectorAll('.command-palette-result').length;
        expect(count).toBeGreaterThan(1);
        expect(selected().dataset.index).toBe('0');
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        expect(selected().dataset.index).toBe('1');
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        expect(selected().dataset.index).toBe(String(count - 1));
    });

    it('clicking a result runs it and clicking the backdrop closes the palette', () => {
        press('k', { ctrlKey: true });
        input().value = 'books';
        input().dispatchEvent(new Event('input'));
        document.querySelector('.command-palette-result').click();
        expect(window.openBooksWindow).toHaveBeenCalled();

        press('k', { ctrlKey: true });
        document.querySelector('.command-palette').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(document.querySelector('.command-palette').hidden).toBe(true);
    });

    it('Ctrl+K again closes an open palette', () => {
        press('k', { ctrlKey: true });
        press('k', { ctrlKey: true });
        expect(document.querySelector('.command-palette').hidden).toBe(true);
    });

    it('Enter with nothing selected does nothing', () => {
        window.openQuotesWindow.mockClear();
        press('k', { ctrlKey: true });
        input().value = 'zzzz';
        input().dispatchEvent(new Event('input'));
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(window.openQuotesWindow).not.toHaveBeenCalled();
    });

    it('ignores modified shortcuts, restores focus, and handles empty navigation and outside list clicks', () => {
        const opener = document.createElement('button');
        document.body.appendChild(opener);
        opener.focus();
        press('k', { ctrlKey: true, shiftKey: true });
        expect(document.querySelector('.command-palette')).toBeNull();
        press('k', { ctrlKey: true, altKey: true });
        expect(document.querySelector('.command-palette')).toBeNull();

        press('k', { metaKey: true });
        expect(document.activeElement).toBe(input());
        input().value = 'no-match';
        input().dispatchEvent(new Event('input'));
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        document.querySelector('.command-palette-results').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        window.CommandPalette.close();
        expect(document.querySelector('.command-palette').hidden).toBe(true);
        expect(document.activeElement).toBe(opener);
        opener.remove();
    });
});
