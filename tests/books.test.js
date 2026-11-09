/**
 * Books 2026 reading list – render, share urls, and letter window
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';

const booksDom = () => `
    <div id="lists-folder-window" class="window" style="display: none;"></div>
    <div id="books-window" class="window books-window notes-letter-window" style="display: none;">
        <div class="window-header">
            <span class="control close"></span>
            <div class="window-title">BOOKS I READ IN 2026</div>
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
        await import('../applications/lists/movies-data.js');
        await import('../applications/lists/guides-data.js');
        await import('../applications/lists/adventures-data.js');
        await import('../applications/lists/games-data.js');
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

    it('renders the 2026 reading list tables without the backlog', () => {
        const app = new window.BooksAppClass();
        expect(document.getElementById('books-letter-title').textContent).toBe('books i read in 2026');
        expect(document.getElementById('books-letter-content').innerHTML).toContain('books-table');
        expect(document.getElementById('books-letter-content').innerHTML).not.toContain('books-backlog');
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
    });

    it('opens the empty 2027 list with the same layout and an empty note', () => {
        const app = new window.BooksAppClass();
        app.open('books-2027');
        const title = 'books i read in 2027';
        expect(document.getElementById('books-letter-title').textContent).toBe(title);
        expect(document.querySelector('#books-window .window-title').textContent).toBe(title.toUpperCase());
        const html = document.getElementById('books-letter-content').innerHTML;
        expect(html).toContain('books-tables');
        expect(html).toContain('no books here yet');
        expect(html).not.toContain('books-backlog');
        expect(app.getShareUrl()).toContain('list=books-2027');
        expect(new URLSearchParams(window.location.search).get('list')).toBe('books-2027');
    });

    it('opens the backlog as its own list without repeating its name as a heading', () => {
        window.I18n = { t: (key) => (key === 'window.booksBacklog' ? 'マイバックログ' : key) };
        const app = new window.BooksAppClass();
        app.open('books-backlog');
        expect(document.getElementById('books-letter-title').textContent).toBe('マイバックログ');
        const html = document.getElementById('books-letter-content').innerHTML;
        expect(html).toContain('books-table--backlog');
        expect(html).toContain('the warmth of other suns');
        expect(html).not.toContain('books-backlog-title');
        expect(html).not.toContain('books-month');
        expect(app.shareId).toBe('books-backlog');
    });

    it('switches lists in the same window and opens shared 2027/backlog links', () => {
        const app = new window.BooksAppClass();
        app.open('books-backlog');
        app.open('books-2026');
        expect(document.getElementById('books-letter-title').textContent).toBe('books i read in 2026');
        expect(new URLSearchParams(window.location.search).get('list')).toBe('books-2026');

        app.open('unknown-list');
        expect(app.shareId).toBe('books-2026');

        const url = new URL(window.location.href);
        url.searchParams.set('list', 'books-backlog');
        history.replaceState(null, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(app.shareId).toBe('books-backlog');
        expect(document.getElementById('books-letter-content').innerHTML).toContain('books-table--backlog');
    });

    it('renders award cards with medals, credits, comments and to-be-revealed slots', () => {
        window.I18n = { t: (key) => (key === 'lists.zeitgeistReveal' ? 'はっぴょう' : key) };
        const original = window.ZEITGEIST_2026;
        window.ZEITGEIST_2026 = {
            ...original,
            categories: [
                {
                    label: 'monsters',
                    emoji: '👹',
                    size: 6,
                    movies: [
                        'plain <b>',
                        { title: 'linked (some one, 2026)', url: 'https://example.com/m', comment: 'so <good>' },
                        { title: 'good omens (S3) (rachel talalay, 2026)' },
                    ],
                },
                { label: 'no size' },
            ],
        };
        try {
            const app = new window.BooksAppClass();
            app.open('zeitgeist-2026');
            const content = document.getElementById('books-letter-content');
            expect(content.querySelector('.books-subtitle').textContent).toBe('はっぴょう');
            const [monsters, unsized] = content.querySelectorAll('.award-category');
            expect(monsters.classList.contains('award-category--featured')).toBe(true);
            expect(unsized.classList.contains('award-category--featured')).toBe(false);
            expect(monsters.querySelector('.award-emoji').textContent).toBe('👹');
            const entries = monsters.querySelectorAll('.award-entry');
            expect(entries.length).toBe(6);
            expect(entries[0].classList.contains('award-entry--gold')).toBe(true);
            expect(entries[0].innerHTML).toContain('plain &lt;b&gt;');
            expect(entries[1].classList.contains('award-entry--silver')).toBe(true);
            expect(entries[1].querySelector('a').getAttribute('href')).toBe('https://example.com/m');
            expect(entries[1].querySelector('a').textContent).toBe('linked');
            expect(entries[1].querySelector('.award-credit').textContent).toBe('some one, 2026');
            expect(entries[1].querySelector('.award-comment').innerHTML).toBe('so &lt;good&gt;');
            expect(entries[2].querySelector('.award-title').textContent).toBe('good omens (S3)');
            expect(entries[3].classList.contains('award-entry--empty')).toBe(true);
            expect(entries[3].querySelector('.award-pending').textContent).toBe('to be revealed');
            expect(unsized.querySelectorAll('.award-entry').length).toBe(0);
            expect(content.querySelector('.books-table--award')).toBeNull();
        } finally {
            window.ZEITGEIST_2026 = original;
        }
    });

    it('gives every zeitgeist movie a credit and a one-line comment', () => {
        const app = new window.BooksAppClass();
        app.open('zeitgeist-2026');
        const entries = document.querySelectorAll('#books-letter-content .award-entry');
        expect(entries.length).toBe(36);
        entries.forEach((entry) => {
            expect(entry.querySelector('.award-comment')?.textContent).toBeTruthy();
        });
    });

    it('renders the videogames of my youth as unnumbered tables, one per console', () => {
        const app = new window.BooksAppClass();
        app.open('games-youth');
        expect(app.shareId).toBe('games-youth');
        expect(document.getElementById('books-letter-title').textContent).toBe('the videogames of my youth');
        const content = document.getElementById('books-letter-content');
        const tables = content.querySelectorAll('.books-table--plain');
        expect(tables.length).toBe(5);
        expect(content.querySelector('.books-tables--columns')).not.toBeNull();
        expect(tables[0].querySelector('th').textContent).toBe('atari 2600 / arcades');
        expect(tables[3].querySelectorAll('tbody tr').length).toBe(25);
        expect(content.querySelector('.books-col-rank')).toBeNull();
        expect(content.textContent).toContain('duke nukem 3d');
        expect(content.textContent).not.toContain('never played them');
    });

    it('renders movies to watch with our kids in era columns without a note', () => {
        const app = new window.BooksAppClass();
        app.open('kids-movies');
        expect(app.shareId).toBe('kids-movies');
        const content = document.getElementById('books-letter-content');
        expect(content.querySelector('.books-subtitle')).toBeNull();
        expect(content.querySelector('.books-tables--columns')).not.toBeNull();
        expect(content.querySelectorAll('.books-table--plain').length).toBe(4);
        expect(content.querySelectorAll('tbody tr').length).toBe(23);
        expect(content.textContent).toContain('the wizard of oz (victor fleming, 1939)');
    });

    it('renders books our kids should read in age columns', () => {
        const app = new window.BooksAppClass();
        app.open('kids-books');
        expect(app.shareId).toBe('kids-books');
        expect(document.getElementById('books-letter-title').textContent).toBe('books our kids should read');
        const content = document.getElementById('books-letter-content');
        expect(content.querySelector('.books-subtitle')).toBeNull();
        expect(content.querySelector('.books-tables--columns')).not.toBeNull();
        const tables = content.querySelectorAll('.books-table--plain');
        expect(tables.length).toBe(3);
        expect(tables[0].querySelector('th').textContent).toBe('3-6 years-old');
        expect(content.querySelectorAll('tbody tr').length).toBe(33);
        expect(content.textContent).toContain('goodnight moon (margaret wise brown)');
    });

    it('renders the alagoas guide as region columns with notes', () => {
        const app = new window.BooksAppClass();
        app.open('guide-alagoas');
        expect(app.shareId).toBe('guide-alagoas');
        expect(document.getElementById('books-letter-title').textContent).toBe('alagoas, brazil');
        const content = document.getElementById('books-letter-content');
        expect(content.querySelector('.books-tables--columns')).not.toBeNull();
        const tables = content.querySelectorAll('.books-table--plain');
        expect(tables.length).toBe(5);
        expect(tables[0].querySelector('th').textContent).toBe('☀️ north — litoral norte');
        expect(tables[0].querySelector('.books-category-note').textContent).toContain('natural pools');
        expect(content.querySelectorAll('.books-col-title').length).toBe(16);
        expect(content.querySelector('.books-category-footnote').textContent).toContain('canindé de são francisco');
    });

    it('renders the iceland guide as full-width sections with details, a table and tips', () => {
        const app = new window.BooksAppClass();
        app.open('guide-iceland');
        expect(app.shareId).toBe('guide-iceland');
        expect(document.getElementById('books-letter-title').textContent).toBe('reykjavík, iceland');
        const content = document.getElementById('books-letter-content');
        expect(content.querySelector('.books-subtitle').textContent).toContain('witchcraft & sorcery');
        expect(content.querySelector('.guide-intro').textContent).toContain('male-dominated');
        expect(content.querySelector('.books-tables--columns')).toBeNull();
        const sections = content.querySelectorAll('.guide-section');
        expect(sections.length).toBe(6);
        expect(sections[0].querySelector('.guide-heading').textContent).toContain('museum of icelandic sorcery');
        expect(sections[0].querySelector('.guide-place').textContent).toBe('hólmavík, westfjords');
        expect(sections[4].querySelector('.guide-tip').textContent).toContain('heart of icelandic witch country');
        expect(sections[5].querySelectorAll('.guide-table tbody tr').length).toBe(4);
        expect(sections[5].querySelector('.guide-table caption').textContent).toBe('best times to experience it');
        expect(sections[5].querySelectorAll('.guide-list li').length).toBe(3);
        expect(sections[2].querySelector('.guide-details')).toBeNull();
    });

    it('renders guide sections with only a heading', () => {
        const app = new window.BooksAppClass();
        const html = app.renderGuideSection({ table: { rows: [['a']] }, lists: [{ items: ['b'] }] });
        expect(html).toContain('<td>a</td>');
        expect(html).toContain('<li>b</li>');
        expect(html).not.toContain('caption');
        expect(html).not.toContain('guide-list-heading');
    });

    it('renders the winter holiday movies as a single list without a heading', () => {
        const app = new window.BooksAppClass();
        app.open('winter-movies');
        expect(app.shareId).toBe('winter-movies');
        expect(document.getElementById('books-letter-title').textContent).toBe('classic american movies for the winter holiday');
        const content = document.getElementById('books-letter-content');
        expect(content.querySelector('.books-backlog-title')).toBeNull();
        expect(content.querySelectorAll('tbody tr').length).toBe(6);
        expect(content.textContent).toContain('it\'s a wonderful life (frank capra, 1946)');
    });

    it('renders the bucket list as continents of country cards with place pills', () => {
        const app = new window.BooksAppClass();
        app.open('bucket-list');
        expect(app.shareId).toBe('bucket-list');
        expect(document.getElementById('books-letter-title').textContent).toBe('my bucket list');
        const content = document.getElementById('books-letter-content');
        const regions = content.querySelectorAll('.bucket-region');
        expect(regions.length).toBe(5);
        expect(regions[0].querySelector('.bucket-region-title').textContent).toContain('americas');
        expect(regions[0].querySelector('.bucket-region-count').textContent).toBe('11 countries · 43 places');
        const jamaica = [...content.querySelectorAll('.bucket-card')].find((card) => card.textContent === 'jamaica');
        expect(jamaica.querySelector('.bucket-places')).toBeNull();
    });

    it('renders a bucket region without emoji or countries', () => {
        const app = new window.BooksAppClass();
        const html = app.renderBucketRegion({ label: 'nowhere' });
        expect(html).toContain('0 countries · 0 places');
        expect(html).not.toContain('bucket-region-emoji');
        expect(app.renderStats({})).toBe('');
        expect(app.renderStats({ regions: [{ label: 'x' }] })).toContain('0 countries · 0 places');
    });

    it('renders the cities i have lived as numbered city cards', () => {
        const app = new window.BooksAppClass();
        app.open('cities-lived');
        expect(app.shareId).toBe('cities-lived');
        expect(document.getElementById('books-letter-title').textContent).toBe('cities i have lived');
        const content = document.getElementById('books-letter-content');
        expect(content.querySelector('.books-subtitle').textContent).toContain('more than a month');
        expect(content.querySelector('.list-stats')).toBeNull();
        const cards = content.querySelectorAll('.city-card');
        expect(cards.length).toBe(37);
        expect(cards[0].querySelector('.city-number').textContent).toBe('01');
        expect(cards[0].querySelector('.city-name').textContent).toBe('curitiba, brazil');
        expect(cards[0].querySelector('.city-where').textContent).toBe(', brazil');
        expect(cards[29].querySelector('.city-name').textContent).toBe('malta');
        expect(cards[29].querySelector('.city-where')).toBeNull();
        expect(app.renderCities([{}])).toContain('city-name"></span>');
    });

    it('renders berlin, germany as category columns', () => {
        const app = new window.BooksAppClass();
        app.open('guide-berlin');
        expect(app.shareId).toBe('guide-berlin');
        expect(document.getElementById('books-letter-title').textContent).toBe('berlin, germany');
        const content = document.getElementById('books-letter-content');
        expect(content.querySelector('.books-tables--columns')).not.toBeNull();
        const tables = content.querySelectorAll('.books-table--plain');
        expect(tables[0].querySelector('th').textContent).toBe('🏛️ museums');
        expect(tables[1].querySelector('th').textContent).toBe('🖼️ galleries & collections');
    });

    it('renders countries i have explored as flag cards', () => {
        const app = new window.BooksAppClass();
        app.open('countries-explored');
        expect(app.shareId).toBe('countries-explored');
        expect(document.getElementById('books-letter-title').textContent).toBe('countries i have explored');
        const content = document.getElementById('books-letter-content');
        expect(content.querySelector('.list-stats').textContent).toBe('30 countries');
        const cards = content.querySelectorAll('.country-card');
        expect(cards.length).toBe(30);
        expect(cards[0].querySelector('.country-flag').textContent).toBe('🇧🇷');
        expect(cards[0].querySelector('.city-name').textContent).toBe('brazil');
        expect(app.renderVisited([{}])).not.toContain('country-flag');
    });

    it('openBooksWindow forwards the list id', () => {
        const open = vi.fn();
        const previous = window.BooksApp;
        window.BooksApp = { open };
        window.openBooksWindow('books-2027');
        expect(open).toHaveBeenCalledWith('books-2027');
        window.openBooksWindow();
        expect(open).toHaveBeenLastCalledWith(null);
        window.BooksApp = previous;
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
            expect(html).toMatch(/<h2 class="books-backlog-title">my endless ever-changing backlog<\/h2>/);
            expect(html).not.toMatch(/<th[^>]*>my endless ever-changing backlog<\/th>/);
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
