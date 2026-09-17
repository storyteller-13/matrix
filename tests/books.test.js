/**
 * Books 2026 reading list – render, share urls, and letter window
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';

const booksDom = () => `
    <div id="lists-folder-window" class="window" style="display: none;"></div>
    <div id="books-window" class="window books-window notes-letter-window" style="display: none;">
        <div class="window-header">
            <span class="control close"></span>
        </div>
        <div class="letter-container">
            <div class="letter-paper">
                <div class="letter-header">
                    <div class="letter-title" id="books-letter-title"></div>
                    <button type="button" id="books-letter-share" class="letter-share">
                        <span class="letter-share-label">share</span>
                    </button>
                </div>
                <div class="letter-text" id="books-letter-content"></div>
            </div>
        </div>
    </div>
`;

describe('BooksApp', () => {
    beforeAll(async () => {
        document.body.innerHTML = booksDom();
        await import('../core/base-app.js');
        await import('../applications/lists/books-data.js');
        await import('../applications/lists/books.js');
    });

    beforeEach(() => {
        document.body.innerHTML = booksDom();
        window.I18n = undefined;
        delete window.WindowManager;
        delete window.bringToFront;
        history.replaceState(null, '', window.location.pathname);
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('renders the reading list tables and backlog', () => {
        const app = new window.BooksAppClass();
        expect(document.getElementById('books-letter-title').textContent).toBe('books i am reading in 2026');
        expect(document.getElementById('books-letter-content').innerHTML).toContain('books-table');
        expect(document.getElementById('books-letter-content').innerHTML).toContain('books-backlog');
        expect(document.getElementById('books-letter-content').innerHTML).not.toContain('highlights');
        expect(app.shareId).toBe('books-2026');
    });

    it('uses i18n labels when rendering', () => {
        window.I18n = {
            t(key) {
                if (key === 'window.books') return '2026ねんによんでいるほん';
                if (key === 'lists.rating') return 'ひょうか';
                if (key === 'lists.notes') return 'メモ';
                if (key === 'lists.thoughts') return 'かんそう';
                if (key === 'lists.backlog') return 'マイバックログ';
                return key;
            },
        };
        new window.BooksAppClass();
        expect(document.getElementById('books-letter-title').textContent).toBe('2026ねんによんでいるほん');
        expect(document.getElementById('books-letter-content').innerHTML).toContain('ひょうか');
        expect(document.getElementById('books-letter-content').innerHTML).toContain('かんそう');
        expect(document.getElementById('books-letter-content').innerHTML).toContain('マイバックログ');
    });

    it('renders book notes, links, and string backlog entries', () => {
        const original = window.BOOKS_2026;
        window.BOOKS_2026 = {
            title: 'list',
            shareId: 'books-2026',
            months: [{
                id: 'jan',
                label: 'january',
                books: [
                    { title: 'linked', rating: '9/10', url: 'https://example.com/thoughts' },
                    { title: 'noted', rating: '7/10', note: 'another time <3' },
                    { title: 'placeholder', rating: '7/10', note: 'highlights' },
                    { title: 'bare' },
                    { title: 'titled', url: 'https://example.com/book' },
                ],
            }],
            backlog: ['plain backlog', { title: 'Linked Backlog', url: 'https://example.com/back' }, null],
        };
        try {
            new window.BooksAppClass();
            const html = document.getElementById('books-letter-content').innerHTML;
            expect(html).toContain('https://example.com/thoughts');
            expect(html).toContain('another time');
            expect(html).not.toContain('highlights');
            expect(html).not.toContain('—');
            expect(html).toMatch(/<td class="books-col-notes"><\/td>/);
            expect(html).toMatch(/<td class="books-col-rating"><\/td>/);
            expect(html).toContain('https://example.com/book');
            expect(html).toContain('plain backlog');
            expect(html).toContain('linked backlog');
            expect(html).toContain('https://example.com/back');
            expect(html).toContain('books-backlog-title');
            expect(html).toMatch(/<h2 class="books-backlog-title">my endeless ever-changing backlog<\/h2>/);
            expect(html).not.toMatch(/<th[^>]*>my endeless ever-changing backlog<\/th>/);
        } finally {
            window.BOOKS_2026 = original;
        }
    });

    it('skips render without data or content node', () => {
        const original = window.BOOKS_2026;
        window.BOOKS_2026 = undefined;
        const app = new window.BooksAppClass();
        expect(document.getElementById('books-letter-content').innerHTML).toBe('');
        window.BOOKS_2026 = original;

        document.getElementById('books-letter-content').remove();
        expect(() => app.render()).not.toThrow();
    });

    it('renderBacklog returns empty without entries', () => {
        const app = new window.BooksAppClass();
        expect(app.renderBacklog()).toBe('');
        expect(app.renderBacklog([])).toBe('');
    });

    it('assigns a stable share id and updates the url when the list opens', () => {
        const replaceSpy = vi.spyOn(history, 'replaceState');
        const app = new window.BooksAppClass();
        expect(app.getShareUrl()).toContain('list=books-2026');
        app.open();
        expect(replaceSpy).toHaveBeenCalled();
        const urlArg = String(replaceSpy.mock.calls.at(-1)[2]);
        expect(urlArg).toContain('list=books-2026');
        expect(app.shareOpen).toBe(true);
        replaceSpy.mockRestore();
    });

    it('opens the list from ?list= on load and clears the url on close', () => {
        const url = new URL(window.location.href);
        url.searchParams.set('list', 'books-2026');
        history.replaceState(null, '', url);

        const app = new window.BooksAppClass();
        expect(app.shareOpen).toBe(true);
        expect(document.getElementById('books-window').style.display).toBe('block');

        document.querySelector('#books-window .control.close').click();
        expect(app.shareOpen).toBe(false);
        expect(new URLSearchParams(window.location.search).get('list')).toBeNull();
    });

    it('copies the share url from the letter button', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText },
        });
        vi.useFakeTimers();
        const app = new window.BooksAppClass();
        app.open();
        await app.copyShareUrl();
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining('list=books-2026'));
        expect(document.getElementById('books-letter-share').classList.contains('copied')).toBe(true);
        expect(document.querySelector('.letter-share-label').textContent).toBe('copied');
        vi.advanceTimersByTime(1600);
        expect(document.getElementById('books-letter-share').classList.contains('copied')).toBe(false);
        expect(document.querySelector('.letter-share-label').textContent).toBe('share');
    });

    it('share button click copies the url and uses i18n labels', async () => {
        window.I18n = {
            t(key) {
                if (key === 'notes.share') return 'シェア';
                if (key === 'notes.shareCopied') return 'コピーしたよ';
                return key;
            },
        };
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText },
        });
        vi.useFakeTimers();
        const app = new window.BooksAppClass();
        const copySpy = vi.spyOn(app, 'copyShareUrl').mockResolvedValue(undefined);
        app.open();
        expect(document.querySelector('.letter-share-label').textContent).toBe('シェア');

        document.getElementById('books-letter-share').click();
        expect(copySpy).toHaveBeenCalled();
        copySpy.mockRestore();

        await app.copyShareUrl();
        expect(writeText).toHaveBeenCalled();
        expect(document.querySelector('.letter-share-label').textContent).toBe('コピーしたよ');
        vi.advanceTimersByTime(1600);
        expect(document.querySelector('.letter-share-label').textContent).toBe('シェア');
    });

    it('falls back to execCommand copy when clipboard is unavailable', async () => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: undefined,
        });
        document.execCommand = vi.fn().mockReturnValue(true);
        const app = new window.BooksAppClass();
        app.open();
        await app.copyShareUrl();
        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(document.getElementById('books-letter-share').classList.contains('copied')).toBe(true);
    });

    it('falls back when clipboard.writeText rejects', async () => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
        });
        document.execCommand = vi.fn().mockReturnValue(true);
        const app = new window.BooksAppClass();
        app.open();
        await app.copyShareUrl();
        expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('copyShareUrl no-ops without an open list and when fallback copy fails', async () => {
        const app = new window.BooksAppClass();
        await expect(app.copyShareUrl()).resolves.toBeUndefined();

        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: undefined,
        });
        document.execCommand = vi.fn().mockImplementation(() => {
            throw new Error('blocked');
        });
        app.open();
        await app.copyShareUrl();
        expect(document.getElementById('books-letter-share').classList.contains('copied')).toBe(false);
    });

    it('openListFromUrl ignores missing ids and skips reopening the same list', () => {
        const app = new window.BooksAppClass();
        const openSpy = vi.spyOn(app, 'open');

        expect(app.getListIdFromUrl()).toBeNull();
        app.openListFromUrl();
        expect(openSpy).not.toHaveBeenCalled();

        const url = new URL(window.location.href);
        url.searchParams.set('list', 'missing');
        history.replaceState(null, '', url);
        app.openListFromUrl();
        expect(openSpy).not.toHaveBeenCalled();

        url.searchParams.set('list', 'BOOKS-2026');
        history.replaceState(null, '', url);
        app.openListFromUrl();
        expect(openSpy).toHaveBeenCalledTimes(1);

        app.openListFromUrl();
        expect(openSpy).toHaveBeenCalledTimes(1);
    });

    it('opens a shared list on popstate', () => {
        const app = new window.BooksAppClass();
        const url = new URL(window.location.href);
        url.searchParams.set('list', 'books-2026');
        history.replaceState(null, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(app.shareOpen).toBe(true);
    });

    it('setListInUrl no-ops while syncing or when the id is unchanged', () => {
        const replaceSpy = vi.spyOn(history, 'replaceState');
        const app = new window.BooksAppClass();
        replaceSpy.mockClear();

        app.syncingFromUrl = true;
        app.setListInUrl();
        expect(replaceSpy).not.toHaveBeenCalled();
        app.syncingFromUrl = false;

        const url = new URL(window.location.href);
        url.searchParams.set('list', 'books-2026');
        history.replaceState(null, '', url);
        replaceSpy.mockClear();
        app.setListInUrl();
        expect(replaceSpy).not.toHaveBeenCalled();

        app.clearListFromUrl();
        expect(replaceSpy).toHaveBeenCalled();
        replaceSpy.mockClear();
        app.clearListFromUrl();
        expect(replaceSpy).not.toHaveBeenCalled();
        replaceSpy.mockRestore();
    });

    it('resetShareButton and showShareCopied tolerate a missing share button', () => {
        const app = new window.BooksAppClass();
        app.elements.shareButton = null;
        expect(() => app.resetShareButton()).not.toThrow();
        expect(() => app.showShareCopied()).not.toThrow();
    });

    it('i18nLabel falls back when i18n is missing or empty', () => {
        const app = new window.BooksAppClass();
        expect(app.i18nLabel('notes.share', 'share')).toBe('share');
        window.I18n = {
            t(key) {
                if (key === 'notes.share') return '';
                return key;
            },
        };
        expect(app.i18nLabel('notes.share', 'share')).toBe('share');
        expect(app.i18nLabel('', 'share')).toBe('share');
    });

    it('getListIdFromUrl and url writers tolerate constructor failures', () => {
        const app = new window.BooksAppClass();
        const OriginalParams = window.URLSearchParams;
        window.URLSearchParams = function () { throw new Error('bad params'); };
        expect(app.getListIdFromUrl()).toBeNull();
        window.URLSearchParams = OriginalParams;

        const OriginalURL = window.URL;
        window.URL = function () { throw new Error('bad url'); };
        expect(() => app.setListInUrl()).not.toThrow();
        expect(() => app.clearListFromUrl()).not.toThrow();
        window.URL = OriginalURL;
    });

    it('clearListFromUrl no-ops while syncing from the url', () => {
        const replaceSpy = vi.spyOn(history, 'replaceState');
        const app = new window.BooksAppClass();
        const url = new URL(window.location.href);
        url.searchParams.set('list', 'books-2026');
        history.replaceState(null, '', url);
        replaceSpy.mockClear();
        app.syncingFromUrl = true;
        app.clearListFromUrl();
        expect(replaceSpy).not.toHaveBeenCalled();
        replaceSpy.mockRestore();
    });

    it('refreshes copy on localechange and offsets over the lists folder', () => {
        const folder = document.getElementById('lists-folder-window');
        folder.style.display = 'block';
        window.bringToFront = vi.fn();
        const app = new window.BooksAppClass();
        app.open();
        expect(window.bringToFront).toHaveBeenCalledWith(document.getElementById('books-window'));
        expect(document.getElementById('books-window').style.top).toContain('28px');

        window.I18n = { t: (key) => (key === 'window.books' ? 'リスト' : key) };
        document.dispatchEvent(new Event('localechange'));
        expect(document.getElementById('books-letter-title').textContent).toBe('リスト');
    });

    it('uses WindowManager.bringToFront when the global helper is missing', () => {
        window.WindowManager = { open: vi.fn(), bringToFront: vi.fn() };
        const app = new window.BooksAppClass();
        app.open();
        expect(window.WindowManager.open).toHaveBeenCalled();
        expect(window.WindowManager.bringToFront).toHaveBeenCalled();
    });

    it('open no-ops without a window', () => {
        const app = new window.BooksAppClass();
        app.window = null;
        expect(() => app.open()).not.toThrow();
        expect(app.shareOpen).toBe(false);
    });

    it('renders without a title node or month book lists', () => {
        document.getElementById('books-letter-title').remove();
        const original = window.BOOKS_2026;
        window.BOOKS_2026 = { title: 'untitled', months: [{ label: 'january' }], backlog: [] };
        expect(() => new window.BooksAppClass()).not.toThrow();
        window.BOOKS_2026 = { title: 'untitled', months: null, backlog: [] };
        expect(() => new window.BooksAppClass()).not.toThrow();
        window.BOOKS_2026 = original;
    });

    it('init no-ops without a books window', () => {
        document.body.innerHTML = '';
        const app = new window.BooksAppClass();
        expect(app.window).toBeFalsy();
    });

    it('falls back to a default share id and skips a missing share button', () => {
        const original = window.BOOKS_2026;
        window.BOOKS_2026 = { ...original, shareId: undefined };
        document.getElementById('books-letter-share').remove();
        const app = new window.BooksAppClass();
        expect(app.shareId).toBe('books-2026');
        expect(app.elements.shareButton).toBeNull();
        window.BOOKS_2026 = original;
    });
});
