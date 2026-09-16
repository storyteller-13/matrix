/**
 * Import application data/entry modules so they are executed and included in coverage.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';

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

describe('Application modules (coverage)', () => {
    beforeAll(async () => {
        document.body.innerHTML = '<div id="app"></div>';
    });

    it('quotes-data loads and exposes QUOTES', async () => {
        await import('../applications/quotes/quotes-data.js');
        expect(window.QUOTES).toBeDefined();
        expect(Array.isArray(window.QUOTES)).toBe(true);
        expect(window.QUOTES.length).toBeGreaterThan(0);
        expect(window.QUOTES[0]).toHaveProperty('text');
        expect(window.QUOTES[0]).toHaveProperty('author');
    });

    it('about loads and exposes AboutAppClass and openAboutWindow', async () => {
        document.body.innerHTML = `
            <div id="about-window" class="window about-window"></div>
            <div id="about-dock-item" class="dock-item"></div>
            <div id="about-desktop-icon" class="desktop-icon"></div>
        `;
        await import('../core/base-app.js');
        await import('../applications/about/about.js');
        expect(window.AboutAppClass).toBeDefined();
        expect(window.AboutApp).toBeDefined();
        expect(typeof window.openAboutWindow).toBe('function');
        expect(document.getElementById('about-window').style.display).not.toBe('flex');
    });

    it('home loads and exposes HomeAppClass and openHomeWindow', async () => {
        document.body.innerHTML = `
            <div id="home-window" class="window"></div>
            <div id="home-dock-item" class="dock-item"></div>
        `;
        await import('../core/base-app.js');
        await import('../applications/home/home.js');
        expect(window.HomeAppClass).toBeDefined();
        expect(window.HomeApp).toBeDefined();
        expect(typeof window.openHomeWindow).toBe('function');
        expect(document.getElementById('home-window').style.display).not.toBe('block');
    });

    it('quotes.js loads and exposes QuotesPanel and openQuotesWindow', async () => {
        document.body.innerHTML = `
            <div id="quotes-box"></div>
            <button id="quotes-box-close"></button>
            <div id="quotes-quote-container"></div>
            <div id="quotes-quote-author"></div>
        `;
        if (!window.matchMedia) {
            window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
        }
        await import('../applications/quotes/quotes-data.js');
        await import('../applications/quotes/quotes.js');
        expect(window.QuotesPanel).toBeDefined();
        expect(typeof window.openQuotesWindow).toBe('function');
        expect(window.QuotesPanel.getRandomQuote()).toHaveProperty('text');
        expect(document.getElementById('quotes-box').style.display).toBe('block');
    });

    it('notes.js loads and exposes NotesAppClass and openNotesWindow', async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        document.body.innerHTML = `
            <div id="notes-window" class="window"><div id="notes-entries-list"></div><div id="notes-footer"></div><span id="notes-count"></span><span id="notes-count-badge"></span><span id="notes-menu-count"></span></div>
            <div id="notes-dock-item" class="dock-item"></div>
        `;
        await import('../core/base-app.js');
        await import('../applications/notes/notes-storage.js');
        await import('../applications/notes/notes.js');
        expect(window.NotesAppClass).toBeDefined();
        expect(window.NotesApp).toBeDefined();
        expect(typeof window.openNotesWindow).toBe('function');
        expect(document.getElementById('notes-window').style.display).not.toBe('block');
    });

    it('books loads and exposes BooksAppClass and openBooksWindow', async () => {
        document.body.innerHTML = `
            <div id="books-window" class="window books-window notes-letter-window">
                <div class="letter-title" id="books-letter-title"></div>
                <div class="letter-text" id="books-letter-content"></div>
            </div>
        `;
        await import('../core/base-app.js');
        await import('../applications/lists/books-data.js');
        await import('../applications/lists/books.js');
        expect(window.BOOKS_2026).toBeDefined();
        expect(window.BOOKS_2026.shareId).toBe('books-2026');
        expect(window.BooksAppClass).toBeDefined();
        expect(window.BooksApp).toBeDefined();
        expect(typeof window.openBooksWindow).toBe('function');
        expect(document.getElementById('books-letter-content').innerHTML).toContain('books-table');
        expect(document.getElementById('books-letter-content').innerHTML).toContain('books-backlog');
        const linked = window.BOOKS_2026.backlog.filter((b) => b.url);
        expect(linked.length).toBeGreaterThan(0);
        expect(window.BOOKS_2026.backlog.every((b) => b.title === b.title.toLowerCase())).toBe(true);
        expect(document.getElementById('books-letter-content').innerHTML).toContain('href=');
        expect(document.getElementById('books-window').style.display).not.toBe('block');
    });

    it('lists-folder loads and browses books / empty music folders', async () => {
        document.body.innerHTML = `
            <div id="lists-folder-window" class="window artwork-window lists-folder-window">
                <div class="window-title">CURATE LISTS</div>
                <div class="file-list"></div>
            </div>
            <div id="lists-folder-dock-item" class="dock-item"></div>
            <div id="books-window" class="window"></div>
        `;
        window.openBooksWindow = vi.fn();
        await import('../core/base-app.js');
        await import('../applications/lists/lists-folder.js');
        expect(window.ListsFolderAppClass).toBeDefined();
        expect(window.ListsFolderApp).toBeDefined();
        expect(typeof window.openListsFolderWindow).toBe('function');

        const app = window.ListsFolderApp;
        const list = app.window.querySelector('.file-list');
        expect(list.textContent).toContain('books');
        expect(list.textContent).toContain('movies');
        expect(list.textContent).toContain('places');
        expect(list.textContent).toContain('art');
        expect(list.textContent).toContain('articles');
        expect(list.textContent).toContain('food');

        [...list.querySelectorAll('.file-item')].find((el) => el.textContent.includes('books')).click();
        expect(list.textContent).toContain('books i am reading in 2026');
        [...list.querySelectorAll('.file-item')].find((el) => el.textContent.includes('books i am reading in 2026')).click();
        expect(window.openBooksWindow).toHaveBeenCalled();

        app.open('movies');
        expect(list.textContent).toContain('this folder is empty');

        app.open('articles');
        expect(app.window.querySelector('.window-title').textContent).toBe('ARTICLES');
        expect(list.textContent).toContain('this folder is empty');
    });

    it('apod.js loads and exposes APODPanelClass and buildApiUrl', async () => {
        document.body.innerHTML = `
            <div id="apod-box"><div id="apod-box-image-container"></div><button id="apod-box-close"></button></div>
            <div id="apod-popup"><button id="apod-close"></button></div>
        `;
        global.fetch = vi.fn().mockResolvedValue({ ok: false });
        await import('../core/env.js');
        await import('../applications/apod/apod.js');
        expect(window.APODPanelClass).toBeDefined();
        const panel = new window.APODPanelClass();
        expect(panel.buildApiUrl('2024-01-15')).toContain('date=2024-01-15');
        expect(typeof window.openApodWindow).toBe('function');
        expect(document.getElementById('apod-box').style.display).toBe('block');
    });

    it('chess.js loads and exposes ChessPanel and openChessWindow', async () => {
        document.body.innerHTML = `
            <div id="chess-box"><button id="chess-box-close"></button><div id="chess-loading"></div><div id="chess-puzzle-content"></div><div id="chess-error"></div><div id="chess-board-wrap"></div></div>
        `;
        global.fetch = vi.fn().mockResolvedValue({ ok: false });
        await import('../core/env.js');
        await import('../applications/chess/chess.js');
        expect(window.ChessPanel).toBeDefined();
        expect(typeof window.openChessWindow).toBe('function');
        expect(document.getElementById('chess-box').style.display).toBe('block');
    });

    it('sky.js loads and exposes SkyPanel and openSkyWindow', async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        document.body.innerHTML = `
            <div id="sky-box"><button id="sky-box-close"></button><ul id="sky-planet-list"></ul></div>
        `;
        global.fetch = vi.fn().mockResolvedValue({ ok: false });
        await import('../core/env.js');
        await import('../applications/sky/sky.js');
        expect(window.SkyPanel).toBeDefined();
        expect(typeof window.openSkyWindow).toBe('function');
        expect(document.getElementById('sky-box').style.display).not.toBe('block');
    });

    it('calendar.js loads and exposes CalendarPanel and openCalendarWindow', async () => {
        document.body.innerHTML = `
            <div id="calendar-box">
                <button id="calendar-box-close"></button>
                <button id="calendar-prev"></button>
                <span id="calendar-box-title"></span>
                <button id="calendar-next"></button>
                <div id="calendar-weekdays"></div>
                <div id="calendar-grid"></div>
            </div>
        `;
        if (!window.matchMedia) {
            window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
        }
        await import('../core/env.js');
        await import('../applications/calendar/calendar-events.js');
        await import('../applications/calendar/calendar.js');
        expect(window.CalendarPanel).toBeDefined();
        expect(window.CALENDAR_EVENTS.length).toBeGreaterThan(0);
        expect(typeof window.openCalendarWindow).toBe('function');
        expect(document.getElementById('calendar-box').style.display).not.toBe('block');
    });

    it('artwork.js loads and exposes ArtworkAppClass and openArtworkWindow', async () => {
        document.body.innerHTML = `
            <div id="artwork-window" class="window"><div class="file-list"></div></div>
            <div id="artwork-dock-item" class="dock-item"></div>
            <span id="artwork-count-badge"></span><span id="artwork-menu-count"></span>
        `;
        await import('../core/base-app.js');
        await import('../applications/artwork/artwork.js');
        expect(window.ArtworkAppClass).toBeDefined();
        expect(window.ArtworkApp).toBeDefined();
        expect(typeof window.openArtworkWindow).toBe('function');
        expect(document.getElementById('artwork-window').style.display).not.toBe('block');
    });
});
