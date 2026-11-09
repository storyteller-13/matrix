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
        expect(document.getElementById('books-letter-content').innerHTML).not.toContain('books-backlog');
        expect(window.BOOKS_2026.backlog).toBeUndefined();
        expect(window.BOOKS_2027).toEqual({ title: 'books i read in 2027', shareId: 'books-2027', months: [] });
        expect(window.BOOKS_2027.backlog).toBeUndefined();
        expect(window.BOOKS_BACKLOG.shareId).toBe('books-backlog');
        expect(window.BOOKS_BACKLOG.backlog.length).toBeGreaterThan(0);
        expect(window.BOOKS_BACKLOG.backlog.every((b) => b.title === b.title.toLowerCase())).toBe(true);
        expect(document.getElementById('books-letter-content').innerHTML).toContain('href=');
        expect(document.getElementById('books-window').style.display).not.toBe('block');
    });

    it('lists-folder loads and browses books / empty music folders', async () => {
        document.body.innerHTML = `
            <div id="lists-folder-window" class="window artwork-window lists-folder-window">
                <div class="window-title">CURATE LISTS</div>
                <div class="file-list"></div>
            </div>
            <div id="lists-folder-dock-item" class="dock-item"><span id="lists-folder-count-badge" style="display: none;">0</span></div>
            <div id="books-window" class="window"></div>
        `;
        window.openBooksWindow = vi.fn();
        await import('../core/base-app.js');
        await import('../applications/lists/podcast-player.js');
        await import('../applications/lists/lists-folder.js');
        const dockBadge = document.getElementById('lists-folder-count-badge');
        expect(dockBadge.textContent).toBe('13');
        expect(dockBadge.style.display).toBe('flex');
        expect(window.ListsFolderAppClass).toBeDefined();
        expect(window.ListsFolderApp).toBeDefined();
        expect(typeof window.openListsFolderWindow).toBe('function');

        const app = window.ListsFolderApp;
        const list = app.window.querySelector('.file-list');
        expect(list.textContent).toContain('books');
        expect(list.textContent).toContain('movies');
        expect(list.textContent).toContain('games');
        expect(list.textContent).toContain('adventures');
        expect(list.textContent).toContain('art');
        expect(list.textContent).toContain('science');
        expect(list.textContent).toContain('food');
        expect(list.textContent).toContain('podcasts');

        const badgeFor = (label) => [...list.querySelectorAll('.file-item')]
            .find((el) => el.querySelector('.file-name').textContent === label)
            .querySelector('.lists-folder-count-badge');
        expect(badgeFor('books').textContent).toBe('4');
        expect(badgeFor('movies').textContent).toBe('3');
        expect(badgeFor('podcasts').textContent).toBe('1');
        expect(badgeFor('games').textContent).toBe('1');
        expect(badgeFor('adventures').textContent).toBe('4');
        ['art', 'science', 'food'].forEach((label) => {
            expect(badgeFor(label)).toBeNull();
        });

        [...list.querySelectorAll('.file-item')].find((el) => el.textContent.includes('books')).click();
        expect(list.querySelector('.lists-folder-count-badge')).toBeNull();
        expect(list.textContent).toContain('books i read in 2026');
        expect(list.textContent).toContain('books i read in 2027');
        expect(list.textContent).toContain('my endless ever-changing backlog');
        const clickList = (label) => [...list.querySelectorAll('.file-item')].find((el) => el.textContent.includes(label)).click();
        clickList('books i read in 2026');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('books-2026');
        clickList('books i read in 2027');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('books-2027');
        clickList('my endless ever-changing backlog');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('books-backlog');
        clickList('books our kids should read');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('kids-books');

        app.open('movies');
        expect(app.window.querySelector('.window-title').textContent).toBe('MOVIES');
        expect(list.textContent).toContain('zeitgeist awards 2026');
        expect(list.textContent).not.toContain('this folder is empty');
        expect(list.querySelectorAll('.file-item')[1].innerHTML).toContain('M10.6 10.6');
        clickList('zeitgeist awards 2026');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('zeitgeist-2026');
        clickList('movies to watch with our kids');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('kids-movies');
        clickList('classic american movies for the winter holiday');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('winter-movies');

        app.open('adventures');
        expect(app.window.querySelector('.window-title').textContent).toBe('ADVENTURES');
        expect(list.querySelectorAll('.file-item')[2].innerHTML).toContain('circle cx="12" cy="9.6"');
        clickList('my bucket list');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('bucket-list');
        expect(list.querySelectorAll('.file-item')[3].innerHTML).toContain('M9.8 20.4');
        clickList('cities i have lived');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('cities-lived');
        expect(list.querySelectorAll('.file-item')[4].innerHTML).toContain('M3.6 12 H20.4');
        clickList('countries i have explored');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('countries-explored');
        clickList('my guides');
        expect(app.window.querySelector('.window-title').textContent).toBe('MY GUIDES');
        expect(list.querySelectorAll('.file-item').length).toBe(4);
        expect(list.querySelector('.file-item:nth-child(2)').innerHTML).toContain('M9 4.2 V17.8');
        clickList('alagoas, brazil');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('guide-alagoas');
        clickList('reykjavík, iceland');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('guide-iceland');
        clickList('berlin, germany');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('guide-berlin');

        app.open('art');
        expect(list.textContent).toContain('this folder is empty');

        app.open('science');
        expect(app.window.querySelector('.window-title').textContent).toBe('SCIENCE');
        expect(list.textContent).toContain('this folder is empty');

        app.open('podcasts');
        expect(list.textContent).not.toContain('this folder is empty');
        expect(list.textContent).toContain('zeitgeist awards 2026');
        expect(window.location.search).toBe('?folder=podcasts');
        expect(list.querySelector('.lists-folder-description')).toBeNull();
        expect(app.window.classList.contains('lists-folder-window--wide')).toBe(false);

        window.openPodcastWindow = vi.fn();
        clickList('zeitgeist awards 2026');
        expect(app.path).toEqual(['podcasts', 'zeitgeist-awards-2026']);
        expect(app.window.querySelector('.window-title').textContent).toBe('ZEITGEIST AWARDS 2026');
        expect(window.location.search).toBe('?folder=podcasts/zeitgeist-awards-2026');
        clickList('father chad ripperger on shawn ryan');
        expect(window.openPodcastWindow).toHaveBeenLastCalledWith({ title: 'father chad ripperger on shawn ryan', videoId: 'XKNMThu3jQI' });
        clickList('dr. fei-fei li on andrew huberman');
        expect(window.openPodcastWindow).toHaveBeenLastCalledWith({ title: 'dr. fei-fei li on andrew huberman', videoId: 'N5AQFYtqx8Q' });
        clickList('arthur brooks on the daily stoic');
        expect(window.openPodcastWindow).toHaveBeenLastCalledWith({ title: 'arthur brooks on the daily stoic', videoId: '9oI3NcbwEjI' });
        expect(app.window.classList.contains('lists-folder-window--wide')).toBe(true);
        clickList('pastor greg laurie on tetragrammaton');
        expect(window.openPodcastWindow).toHaveBeenLastCalledWith({ title: 'pastor greg laurie on tetragrammaton', videoId: 'KGR27hIf8Ow' });
        clickList('back');
        expect(app.path).toEqual(['podcasts']);
        expect(window.location.search).toBe('?folder=podcasts');

        // Links: ?folder=<name>, nested paths, bare nested ids, and unknown folders are ignored.
        expect(app.resolveFolderPath('movies')).toEqual(['movies']);
        expect(app.resolveFolderPath('Podcasts/Zeitgeist-Awards-2026')).toEqual(['podcasts', 'zeitgeist-awards-2026']);
        expect(app.resolveFolderPath('zeitgeist-awards-2026')).toEqual(['podcasts', 'zeitgeist-awards-2026']);
        expect(app.resolveFolderPath('nope')).toBeNull();
        expect(app.resolveFolderPath('movies/nope')).toBeNull();
        history.replaceState(null, '', '/?folder=zeitgeist-awards-2026');
        app.openFromUrl();
        expect(app.path).toEqual(['podcasts', 'zeitgeist-awards-2026']);
        expect(window.location.search).toBe('?folder=podcasts/zeitgeist-awards-2026');
        history.replaceState(null, '', '/?folder=nope');
        app.open('books');
        history.replaceState(null, '', '/?folder=nope');
        app.openFromUrl();
        expect(app.path).toEqual(['books']);
        app.open();
        expect(window.location.search).toBe('');
        app.open('movies');
        app.window.insertAdjacentHTML('afterbegin', '<span class="control close"></span>');
        app.window.querySelector('.control.close').click();
        expect(window.location.search).toBe('');
        history.replaceState(null, '', '/');

        app.open('games');
        expect(list.textContent).not.toContain('this folder is empty');
        expect(list.querySelectorAll('.file-item')[1].innerHTML).toContain('M7.6 10.2');
        clickList('the videogames of my youth');
        expect(window.openBooksWindow).toHaveBeenLastCalledWith('games-youth');
    });

    it('podcast-player plays a youtube episode and stops on close', async () => {
        document.body.innerHTML = `
            <div id="podcast-window" class="window">
                <span class="control close"></span>
                <div class="window-title">PODCAST</div>
                <iframe id="podcast-iframe" src="about:blank"></iframe>
            </div>
        `;
        await import('../core/base-app.js');
        await import('../applications/lists/podcast-player.js');
        expect(window.PodcastPlayerAppClass).toBeDefined();
        expect(typeof window.openPodcastWindow).toBe('function');
        const app = new window.PodcastPlayerAppClass();
        const iframe = document.getElementById('podcast-iframe');

        app.open({ title: 'bad', videoId: 'javascript:alert(1)' });
        expect(iframe.getAttribute('src')).toBe('about:blank');

        app.open({ title: 'robert greene on andrew huberman', videoId: 'y-fRFiTrrg4' });
        expect(iframe.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/y-fRFiTrrg4?autoplay=1&rel=0&modestbranding=1&playsinline=1');
        expect(iframe.getAttribute('title')).toBe('robert greene on andrew huberman');
        expect(document.querySelector('.window-title').textContent).toBe('ROBERT GREENE ON ANDREW HUBERMAN');

        document.querySelector('.control.close').click();
        expect(iframe.getAttribute('src')).toBe('about:blank');

        window.PodcastPlayerApp = app;
        window.openPodcastWindow = (episode) => app.open(episode);
        window.openPodcastEpisode('ripperger-shawn-ryan');
        expect(iframe.getAttribute('src')).toContain('/embed/XKNMThu3jQI?');
        expect(document.querySelector('.window-title').textContent).toBe('FATHER CHAD RIPPERGER ON SHAWN RYAN');
        window.openPodcastEpisode('nope');
        expect(iframe.getAttribute('src')).toContain('/embed/XKNMThu3jQI?');
    });

    it('podcast-player builds the episode menu from PODCAST_EPISODES', async () => {
        document.body.innerHTML = '<div id="podcast-menu-episodes"><button>stale</button></div>';
        vi.resetModules();
        await import('../core/base-app.js');
        await import('../applications/lists/podcast-player.js');
        const menu = document.getElementById('podcast-menu-episodes');
        const buttons = menu.querySelectorAll('button.menu-item');
        expect(buttons.length).toBe(window.PODCAST_EPISODES.length);
        expect(menu.querySelectorAll('.menu-separator').length).toBe(buttons.length - 1);
        expect(buttons[0].dataset.action).toBe('openPodcastEpisode');
        expect(buttons[0].dataset.arg).toBe('ripperger-shawn-ryan');
        expect(buttons[6].textContent).toBe('lyn alden on natalie brunell');
        expect(menu.textContent).not.toContain('stale');
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
