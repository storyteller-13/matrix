/**
 * Notes app – list, letter window, formatting, and badges
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';

function makeFakeStorage() {
    const store = {};
    return {
        getItem(k) { return store[k] ?? null; },
        setItem(k, v) { store[k] = String(v); },
        removeItem(k) { delete store[k]; },
        clear() { for (const k of Object.keys(store)) delete store[k]; },
        get length() { return Object.keys(store).length; },
        key(i) { return Object.keys(store)[i] ?? null; },
    };
}

const notesDom = () => `
    <div id="notes-window" class="window" style="display: none;">
        <div id="notes-entries-list"></div>
        <div id="notes-footer"></div>
        <span id="notes-count"></span>
        <span id="notes-count-badge"></span>
        <span id="notes-menu-count"></span>
    </div>
    <div id="notes-dock-item" class="dock-item"></div>
    <div id="notes-letter-window" class="window notes-letter-window" style="display: none;">
        <div class="window-header">
            <span class="control close"></span>
        </div>
        <div class="window-content"></div>
        <div class="letter-container">
            <div id="letter-date"></div>
            <div id="letter-title"></div>
            <div id="letter-content"></div>
            <button type="button" id="letter-share" class="letter-share">
                <span class="letter-share-label">share</span>
            </button>
        </div>
    </div>
`;

describe('NotesApp', () => {
    beforeAll(async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        document.body.innerHTML = notesDom();
        await import('../core/base-app.js');
        await import('../applications/notes/notes-storage.js');
        await import('../applications/notes/notes.js');
    });

    beforeEach(() => {
        document.body.innerHTML = notesDom();
        localStorage.clear();
        delete window.WindowManager;
        delete window.bringToFront;
        window.I18n = undefined;
        history.replaceState(null, '', window.location.pathname);
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders dated entries and updates the badge', () => {
        const app = new window.NotesAppClass();
        expect(document.querySelectorAll('.notes-date-item').length).toBeGreaterThan(0);
        expect(app.elements.notesCount.textContent).toMatch(/entr/);
        expect(app.elements.badge.style.display).toBe('flex');
        expect(app.elements.menuCount.style.display).toBe('flex');
    });

    it('shows empty state and hides badges when there are no entries', () => {
        const app = new window.NotesAppClass();
        app.entries = [];
        app.render();
        expect(document.getElementById('notes-entries-list').innerHTML).toContain('notes-empty');
        expect(app.elements.badge.style.display).toBe('none');
        expect(app.elements.menuCount.style.display).toBe('none');
        expect(app.elements.notesFooter.style.display).toBe('none');
        expect(app.elements.notesCount.textContent).toBe('0 entries');
    });

    it('uses singular entry copy for a single note', () => {
        const app = new window.NotesAppClass();
        app.entries = [{ id: '1', title: 'one', content: 'x', createdAt: '2026-01-01T00:00:00.000Z', read: false }];
        app.render();
        expect(app.elements.notesCount.textContent).toBe('1 entry');
    });

    it('caps the badge at 99+', () => {
        const app = new window.NotesAppClass();
        app.entries = Array.from({ length: 120 }, (_, i) => ({
            id: String(i),
            title: `n${i}`,
            content: 'x',
            createdAt: `2026-01-01T00:00:00.000Z`,
            read: false,
        }));
        app.updateBadge();
        expect(app.elements.badge.textContent).toBe('99+');
    });

    it('clicking a date item opens the letter with WindowManager', () => {
        vi.useFakeTimers();
        window.WindowManager = { open: vi.fn(), bringToFront: vi.fn() };
        new window.NotesAppClass();
        document.querySelector('.notes-date-item').click();
        expect(window.WindowManager.open).toHaveBeenCalled();
        vi.advanceTimersByTime(50);
        expect(window.WindowManager.bringToFront).toHaveBeenCalled();
        expect(document.querySelector('.notes-date-item').classList.contains('read')).toBe(true);
        expect(document.getElementById('letter-content').innerHTML.length).toBeGreaterThan(0);
    });

    it('opens the letter with the fallback path', () => {
        window.bringToFront = vi.fn();
        const app = new window.NotesAppClass();
        const letter = document.getElementById('notes-letter-window');
        app.openLetterWindow(app.entries[0]);
        expect(letter.style.display).toBe('block');
        expect(window.bringToFront).toHaveBeenCalledWith(letter);
        expect(letter.querySelector('.window-content').scrollTop).toBe(0);
    });

    it('openLetterWindow no-ops without a letter window', () => {
        document.getElementById('notes-letter-window').remove();
        const app = new window.NotesAppClass();
        expect(() => app.openLetterWindow(app.entries[0])).not.toThrow();
    });

    it('formats italic markers and toggles letter classes', () => {
        const app = new window.NotesAppClass();
        expect(app.formatContent('plain')).toBe('plain');
        expect(app.formatContent('a «i»b\nc«/i» d')).toBe('a <em>b<br>c</em> d');
        expect(app.formatContent('«i»only«/i»')).toBe('<em>only</em>');

        const entry = {
            title: '',
            content: 'hello',
            createdAt: '2026-01-01T00:00:00.000Z',
            italic: true,
            asciiArt: true,
        };
        app.populateLetterContent(entry);
        expect(document.getElementById('letter-title').textContent).toBe('');
        expect(document.getElementById('letter-content').classList.contains('letter-content--italic')).toBe(true);
        expect(document.querySelector('.letter-container').classList.contains('letter-container--ascii')).toBe(true);
    });

    it('groups multiple entries on the same day', () => {
        const app = new window.NotesAppClass();
        app.entries = [
            { id: '1', title: 'newer', content: 'a', createdAt: '2026-02-02T00:00:00.000Z', read: true },
            { id: '2', title: 'older', content: 'b', createdAt: '2026-02-02T12:00:00.000Z', read: false },
            { id: '3', title: 'other', content: 'c', createdAt: '2026-01-01T00:00:00.000Z', read: false },
        ];
        app.render();
        expect(document.querySelectorAll('.notes-date-item').length).toBe(2);
        expect(document.querySelector('.notes-date-item.read')).toBeTruthy();
    });

    it('attachDateItemListeners ignores empty date groups', () => {
        const app = new window.NotesAppClass();
        const list = document.getElementById('notes-entries-list');
        list.innerHTML = `<div class="notes-date-item" data-date-key="missing"></div>`;
        app.entriesByDate = {};
        app.attachDateItemListeners(list);
        expect(() => list.querySelector('.notes-date-item').click()).not.toThrow();
    });

    it('render returns early without the entries list', () => {
        document.body.innerHTML = `<div id="notes-window" class="window"></div>`;
        const app = new window.NotesAppClass();
        expect(() => app.render()).not.toThrow();
    });

    it('init returns early when the window is missing', () => {
        document.body.innerHTML = '';
        const app = new window.NotesAppClass();
        expect(app.window).toBeNull();
    });

    it('open re-renders and openNotesWindow delegates', () => {
        const app = new window.NotesAppClass();
        const superOpen = vi.spyOn(window.BaseApp.prototype, 'open').mockImplementation(() => {});
        const renderSpy = vi.spyOn(app, 'render');
        app.open();
        expect(superOpen).toHaveBeenCalled();
        expect(renderSpy).toHaveBeenCalled();
        window.NotesApp = app;
        const openSpy = vi.spyOn(app, 'open');
        window.openNotesWindow();
        expect(openSpy).toHaveBeenCalled();
        window.NotesApp = undefined;
        expect(() => window.openNotesWindow()).not.toThrow();
    });

    it('openLetterWindowFallback works without bringToFront', () => {
        const app = new window.NotesAppClass();
        const letter = document.getElementById('notes-letter-window');
        app.openLetterWindowFallback(letter);
        expect(letter.style.display).toBe('block');
    });

    it('populateLetterContent skips missing nodes', () => {
        document.body.innerHTML = `
            <div id="notes-window" class="window">
                <div id="notes-entries-list"></div>
            </div>
            <div id="notes-letter-window"></div>
        `;
        const app = new window.NotesAppClass();
        expect(() => app.populateLetterContent({
            title: 't',
            content: '',
            createdAt: '2026-01-01T00:00:00.000Z',
        })).not.toThrow();
    });

    it('updateBadge skips missing badge nodes', () => {
        document.body.innerHTML = `<div id="notes-window" class="window"><div id="notes-entries-list"></div></div>`;
        const app = new window.NotesAppClass();
        expect(() => app.updateBadge()).not.toThrow();
    });

    it('scrollLetterToTop no-ops without window-content', () => {
        const app = new window.NotesAppClass();
        const letter = document.createElement('div');
        expect(() => app.scrollLetterToTop(letter)).not.toThrow();
    });

    it('uses I18n copy and re-renders on localechange', () => {
        window.I18n = {
            t(key, vars = {}) {
                if (key === 'notes.empty') return 'まだきろくがないよ';
                if (key === 'notes.entry' || key === 'notes.entries') return `${vars.count}けん`;
                return key;
            },
        };
        const app = new window.NotesAppClass();
        app.entries = [];
        app.render();
        expect(document.getElementById('notes-entries-list').innerHTML).toContain('まだきろくがないよ');
        app.entries = [{ id: '1', title: 'one', content: 'x', createdAt: '2026-01-01T00:00:00.000Z', read: false }];
        document.dispatchEvent(new CustomEvent('localechange'));
        expect(app.elements.notesCount.textContent).toBe('1けん');
    });

    it('renders translated default notes and refreshes an open letter', () => {
        window.I18n = {
            t(key, vars = {}) {
                if (key === 'notes.hello.title') return 'こんにちは、ほしぞらのせかい';
                if (key === 'notes.hello.content') return 'わたしはがくしゃ';
                if (key === 'notes.entry' || key === 'notes.entries') return `${vars.count}けん`;
                if (key && key.startsWith('notes.weekday.')) return 'にちようび';
                return key;
            },
        };
        const app = new window.NotesAppClass();
        expect(document.querySelector('.notes-date-title').textContent).toBe('こんにちは、ほしぞらのせかい');
        app.openLetterWindow(app.entries[0]);
        expect(document.getElementById('letter-title').textContent).toBe('こんにちは、ほしぞらのせかい');
        expect(document.getElementById('letter-content').textContent).toContain('がくしゃ');
        window.I18n = {
            t(key, vars = {}) {
                if (key === 'notes.hello.title') return 'hello starlit world';
                if (key === 'notes.hello.content') return 'i am a scholar';
                if (key === 'notes.entry' || key === 'notes.entries') return `${vars.count} entries`;
                return key;
            },
        };
        document.dispatchEvent(new CustomEvent('localechange'));
        expect(document.querySelector('.notes-date-title').textContent).toBe('hello starlit world');
        expect(document.getElementById('letter-title').textContent).toBe('hello starlit world');
        expect(document.getElementById('letter-content').textContent).toContain('scholar');
    });

    it('i18nLabel falls back when a key is missing and localizeEntry skips empty entries', () => {
        const app = new window.NotesAppClass();
        expect(app.localizeEntry(null)).toBeNull();
        expect(app.i18nLabel(null, 'fallback')).toBe('fallback');
        expect(app.i18nLabel('notes.hello.title', 'hello')).toBe('hello');
        window.I18n = {
            t(key, vars = {}) {
                if (key === 'notes.hello.title') return '';
                if (key === 'notes.entries') return `${vars.count}けん`;
                return key;
            },
        };
        expect(app.i18nLabel('notes.hello.title', 'hello')).toBe('hello');
        expect(app.i18nLabel('missing.key', 'hello')).toBe('hello');
        expect(app.i18nLabel('missing.key')).toBe('');
        app.entries = [
            { id: '1', title: 'one', content: 'x', createdAt: '2026-01-01T00:00:00.000Z', read: false },
            { id: '2', title: 'two', content: 'y', createdAt: '2026-01-02T00:00:00.000Z', read: false },
        ];
        app.render();
        expect(app.elements.notesCount.textContent).toBe('2けん');
    });

    it('assigns stable share ids and updates the url when a note opens', () => {
        const replaceSpy = vi.spyOn(history, 'replaceState');
        const app = new window.NotesAppClass();
        expect(app.entries[0].id).toBe('hello');
        expect(app.getShareUrl(app.entries[0])).toContain('note=hello');
        app.openLetterWindow(app.entries[0]);
        expect(replaceSpy).toHaveBeenCalled();
        const urlArg = String(replaceSpy.mock.calls.at(-1)[2]);
        expect(urlArg).toContain('note=hello');
        replaceSpy.mockRestore();
    });

    it('opens a note from ?note= on load and clears the url on close', () => {
        const url = new URL(window.location.href);
        url.searchParams.set('note', 'hello');
        history.replaceState(null, '', url);

        const app = new window.NotesAppClass();
        expect(app.activeLetterEntry?.id).toBe('hello');
        expect(document.getElementById('notes-letter-window').style.display).toBe('block');

        document.querySelector('#notes-letter-window .control.close').click();
        expect(app.activeLetterEntry).toBeNull();
        expect(new URLSearchParams(window.location.search).get('note')).toBeNull();
    });

    it('copies the share url from the letter button', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText },
        });
        vi.useFakeTimers();
        const app = new window.NotesAppClass();
        app.openLetterWindow(app.entries[0]);
        await app.copyShareUrl();
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining('note=hello'));
        expect(document.getElementById('letter-share').classList.contains('copied')).toBe(true);
        expect(document.querySelector('.letter-share-label').textContent).toBe('copied');
        vi.advanceTimersByTime(1600);
        expect(document.getElementById('letter-share').classList.contains('copied')).toBe(false);
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
        const app = new window.NotesAppClass();
        const copySpy = vi.spyOn(app, 'copyShareUrl').mockResolvedValue(undefined);
        app.openLetterWindow(app.entries[0]);
        expect(document.querySelector('.letter-share-label').textContent).toBe('シェア');

        document.getElementById('letter-share').click();
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
        const app = new window.NotesAppClass();
        app.openLetterWindow(app.entries[0]);
        await app.copyShareUrl();
        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(document.getElementById('letter-share').classList.contains('copied')).toBe(true);
    });

    it('falls back when clipboard.writeText rejects', async () => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
        });
        document.execCommand = vi.fn().mockReturnValue(true);
        const app = new window.NotesAppClass();
        app.openLetterWindow(app.entries[0]);
        await app.copyShareUrl();
        expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('copyShareUrl no-ops without an open letter and when fallback copy fails', async () => {
        const app = new window.NotesAppClass();
        await expect(app.copyShareUrl()).resolves.toBeUndefined();

        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: undefined,
        });
        document.execCommand = vi.fn().mockImplementation(() => {
            throw new Error('blocked');
        });
        app.openLetterWindow(app.entries[0]);
        await app.copyShareUrl();
        expect(document.getElementById('letter-share').classList.contains('copied')).toBe(false);
    });

    it('openNoteFromUrl ignores missing ids and skips reopening the same note', () => {
        const app = new window.NotesAppClass();
        const openSpy = vi.spyOn(app, 'openLetterWindow');

        expect(app.findEntryByShareId(null)).toBeNull();
        expect(app.findEntryByShareId('missing')).toBeNull();
        expect(app.findEntryByShareId('HELLO')?.id).toBe('hello');

        app.openNoteFromUrl();
        expect(openSpy).not.toHaveBeenCalled();

        const url = new URL(window.location.href);
        url.searchParams.set('note', 'missing');
        history.replaceState(null, '', url);
        app.openNoteFromUrl();
        expect(openSpy).not.toHaveBeenCalled();

        url.searchParams.set('note', 'hello');
        history.replaceState(null, '', url);
        app.openNoteFromUrl();
        expect(openSpy).toHaveBeenCalledTimes(1);

        app.openNoteFromUrl();
        expect(openSpy).toHaveBeenCalledTimes(1);
    });

    it('opens a shared note on popstate', () => {
        const app = new window.NotesAppClass();
        const url = new URL(window.location.href);
        url.searchParams.set('note', 'hello');
        history.replaceState(null, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(app.activeLetterEntry?.id).toBe('hello');
    });

    it('setNoteInUrl no-ops while syncing or when the id is unchanged', () => {
        const replaceSpy = vi.spyOn(history, 'replaceState');
        const app = new window.NotesAppClass();
        replaceSpy.mockClear();

        app.syncingFromUrl = true;
        app.setNoteInUrl(app.entries[0]);
        expect(replaceSpy).not.toHaveBeenCalled();
        app.syncingFromUrl = false;

        const url = new URL(window.location.href);
        url.searchParams.set('note', 'hello');
        history.replaceState(null, '', url);
        replaceSpy.mockClear();
        app.setNoteInUrl(app.entries[0]);
        expect(replaceSpy).not.toHaveBeenCalled();

        app.clearNoteFromUrl();
        expect(replaceSpy).toHaveBeenCalled();
        replaceSpy.mockClear();
        app.clearNoteFromUrl();
        expect(replaceSpy).not.toHaveBeenCalled();
        replaceSpy.mockRestore();
    });

    it('resetShareButton and showShareCopied tolerate a missing share button', () => {
        const app = new window.NotesAppClass();
        app.elements.shareButton = null;
        expect(() => app.resetShareButton()).not.toThrow();
        expect(() => app.showShareCopied()).not.toThrow();
    });
});
