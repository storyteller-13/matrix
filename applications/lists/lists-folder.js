/**
 * Curate lists folder browser – nested folders for books / movies / adventures / art / science / food / podcasts / games.
 * Every folder is linkable: ?folder=movies, ?folder=podcasts/zeitgeist-awards-2026 (a bare nested id also works).
 */

const FOLDER_PARAM = 'folder';

/** 24px list icons drawn inside a shared <svg> frame; `icon` on an entry picks one (book by default). */
const LIST_ICONS = {
    book: [
        '<path d="M4.5 4.2 h6.2 c1.3 0 2.3 1 2.3 2.3 v12.1 c0-1.1-0.9-2-2-2 H4.5 Z" fill="rgba(216, 70, 166, 0.18)" stroke="#E879A9" stroke-width="1.55" stroke-linejoin="round"/>',
        '<path d="M19.5 4.2 h-6.2 c-1.3 0-2.3 1-2.3 2.3 v12.1 c0-1.1 0.9-2 2-2 H19.5 Z" fill="rgba(216, 70, 166, 0.12)" stroke="#E879A9" stroke-width="1.55" stroke-linejoin="round"/>',
        '<path d="M12 6.6 V16.8" stroke="#E879A9" stroke-width="1.35" stroke-linecap="round" opacity="0.85"/>',
    ].join(''),
    movie: [
        '<rect x="3.5" y="5.5" width="17" height="13" rx="1.8" fill="rgba(216, 70, 166, 0.15)" stroke="#E879A9" stroke-width="1.55"/>',
        '<path d="M3.5 9 H20.5 M3.5 15 H20.5" stroke="#E879A9" stroke-width="1.2" opacity="0.8"/>',
        '<path d="M7 5.5 V9 M12 5.5 V9 M17 5.5 V9 M7 15 V18.5 M12 15 V18.5 M17 15 V18.5" stroke="#E879A9" stroke-width="1.2" opacity="0.8"/>',
        '<path d="M10.6 10.6 L14 12 L10.6 13.4 Z" fill="#E879A9" stroke="#E879A9" stroke-width="0.8" stroke-linejoin="round"/>',
    ].join(''),
    game: [
        '<path d="M7.2 7.5 H16.8 C19.4 7.5 21 10.2 21.2 13.6 C21.4 16.6 20.2 18.2 18.6 18.2 C17.2 18.2 16.4 16.9 15.6 15.6 H8.4 C7.6 16.9 6.8 18.2 5.4 18.2 C3.8 18.2 2.6 16.6 2.8 13.6 C3 10.2 4.6 7.5 7.2 7.5 Z" fill="rgba(216, 70, 166, 0.15)" stroke="#E879A9" stroke-width="1.55" stroke-linejoin="round"/>',
        '<path d="M7.6 10.2 V13.4 M6 11.8 H9.2" stroke="#E879A9" stroke-width="1.45" stroke-linecap="round"/>',
        '<circle cx="15.6" cy="11" r="1" fill="#E879A9"/>',
        '<circle cx="17.6" cy="12.9" r="1" fill="#E879A9"/>',
    ].join(''),
    map: [
        '<path d="M3.5 6.2 L9 4.2 L15 6.2 L20.5 4.2 V17.8 L15 19.8 L9 17.8 L3.5 19.8 Z" fill="rgba(216, 70, 166, 0.15)" stroke="#E879A9" stroke-width="1.55" stroke-linejoin="round"/>',
        '<path d="M9 4.2 V17.8 M15 6.2 V19.8" stroke="#E879A9" stroke-width="1.2" opacity="0.8"/>',
    ].join(''),
    pin: [
        '<path d="M12 21 C12 21 5.5 14.6 5.5 9.6 a6.5 6.5 0 0 1 13 0 C18.5 14.6 12 21 12 21 Z" fill="rgba(216, 70, 166, 0.15)" stroke="#E879A9" stroke-width="1.55" stroke-linejoin="round"/>',
        '<circle cx="12" cy="9.6" r="2.4" fill="#E879A9"/>',
    ].join(''),
    home: [
        '<path d="M4 11 L12 4.2 L20 11 V19.4 a1 1 0 0 1 -1 1 H5 a1 1 0 0 1 -1 -1 Z" fill="rgba(216, 70, 166, 0.15)" stroke="#E879A9" stroke-width="1.55" stroke-linejoin="round"/>',
        '<path d="M9.8 20.4 V14.6 H14.2 V20.4" fill="none" stroke="#E879A9" stroke-width="1.45" stroke-linejoin="round"/>',
    ].join(''),
    globe: [
        '<circle cx="12" cy="12" r="8.4" fill="rgba(216, 70, 166, 0.15)" stroke="#E879A9" stroke-width="1.55"/>',
        '<path d="M3.6 12 H20.4 M12 3.6 C9.2 6.4 9.2 17.6 12 20.4 M12 3.6 C14.8 6.4 14.8 17.6 12 20.4" fill="none" stroke="#E879A9" stroke-width="1.25" opacity="0.85"/>',
    ].join(''),
    podcast: [
        '<rect x="8.6" y="3.2" width="6.8" height="11" rx="3.4" fill="rgba(216, 70, 166, 0.18)" stroke="#E879A9" stroke-width="1.55"/>',
        '<path d="M5.8 11.2 a6.2 6.2 0 0 0 12.4 0" fill="none" stroke="#E879A9" stroke-width="1.55" stroke-linecap="round"/>',
        '<path d="M12 17.4 V20.6 M8.8 20.6 H15.2" stroke="#E879A9" stroke-width="1.55" stroke-linecap="round"/>',
        '<path d="M10.9 7.1 L13.8 8.7 L10.9 10.3 Z" fill="#E879A9" stroke="#E879A9" stroke-width="0.7" stroke-linejoin="round"/>',
    ].join(''),
};

class ListsFolderApp extends BaseApp {
    constructor() {
        super({ windowId: 'lists-folder-window', dockItemId: 'lists-folder-dock-item' });
        this.path = [];
        this.elements = {};
        this.init();
    }

    init() {
        super.init();
        if (!this.window) return;
        this.cacheElements();
        this.setupUrlRouting();
        this.render();
        this.updateDockBadge();
        document.addEventListener('localechange', () => this.render());
        this.openFromUrl();
    }

    setupUrlRouting() {
        window.addEventListener('popstate', () => this.openFromUrl());
        // Capture phase: runs before the window manager's close handler stops propagation.
        this.window.addEventListener('click', (e) => {
            if (!e.target.closest('.control.close')) return;
            this.writeFolderToUrl(null);
        }, true);
    }

    getFolderFromUrl() {
        try {
            return new URLSearchParams(window.location.search).get(FOLDER_PARAM);
        } catch {
            return null;
        }
    }

    /** Puts the current folder path in the URL (or removes it for null / the root). */
    writeFolderToUrl(path) {
        try {
            const url = new URL(window.location.href);
            const value = path && path.length ? path.join('/') : null;
            if (url.searchParams.get(FOLDER_PARAM) === value) return;
            if (value) url.searchParams.set(FOLDER_PARAM, value);
            else url.searchParams.delete(FOLDER_PARAM);
            // Keep nested paths readable: ?folder=podcasts/zeitgeist-awards-2026
            url.search = url.search.replace(/%2F/gi, '/');
            history.replaceState(null, '', url);
        } catch {
            // Ignore URL update failures in non-browser test hosts
        }
    }

    syncUrl() {
        this.writeFolderToUrl(this.path.length ? this.path : null);
    }

    /** Depth-first search for a folder id; returns its full path from the root, or null. */
    findFolderPath(folderId, entries = this.rootEntries(), trail = []) {
        for (const entry of entries) {
            if (entry.kind !== 'folder') continue;
            const path = [...trail, entry.id];
            if (entry.id === folderId) return path;
            const nested = this.findFolderPath(folderId, this.entriesForFolder(entry.id), path);
            if (nested) return nested;
        }
        return null;
    }

    /** Accepts "movies", "podcasts/zeitgeist-awards-2026" or a bare nested id like "zeitgeist-awards-2026". */
    resolveFolderPath(value) {
        const parts = String(value || '').toLowerCase().split('/').map((p) => p.trim()).filter(Boolean);
        if (!parts.length) return null;
        let entries = this.rootEntries();
        const path = [];
        for (const part of parts) {
            const folder = entries.find((e) => e.kind === 'folder' && e.id === part);
            if (!folder) return parts.length === 1 ? this.findFolderPath(parts[0]) : null;
            path.push(folder.id);
            entries = this.entriesForFolder(folder.id);
        }
        return path;
    }

    openFromUrl() {
        const value = this.getFolderFromUrl();
        if (!value) return;
        const path = this.resolveFolderPath(value);
        if (!path) return;
        this.open(path);
        // A shared ?list= opens on top of the folder, not behind it.
        const books = document.getElementById('books-window');
        if (books && books.style.display !== 'none' && getComputedStyle(books).display !== 'none') {
            if (window.bringToFront) window.bringToFront(books);
            else window.WindowManager?.bringToFront?.(books);
        }
    }

    cacheElements() {
        this.elements.title = this.window.querySelector('.window-title');
        this.elements.fileList = this.window.querySelector('.file-list');
        this.elements.dockBadge = document.getElementById('lists-folder-count-badge');
    }

    /** Dock badge: items directly inside the top-level folders (nested folders' contents are not counted). */
    updateDockBadge() {
        const { dockBadge } = this.elements;
        if (!dockBadge) return;
        const count = this.rootEntries()
            .reduce((sum, entry) => sum + (entry.kind === 'folder' ? this.entriesForFolder(entry.id).length : 0), 0);
        dockBadge.textContent = String(count);
        dockBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    t(key, fallback) {
        return window.I18n?.t?.(key) || fallback;
    }

    folderSvg() {
        return `<svg width="48" height="48" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="2" y="5" width="12" height="9" rx="1.5" fill="rgba(216, 70, 166, 0.15)" stroke="#E879A9" stroke-width="1.2"/>
            <path d="M2 5 L6 5 L7.5 3.5 L12 3.5 L12 5" fill="#E879A9" opacity="0.8" stroke="#E879A9" stroke-width="1.2" stroke-linejoin="round"/>
        </svg>`;
    }

    listIconSvg(name) {
        const art = LIST_ICONS[name] || LIST_ICONS.book;
        return `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${art}</svg>`;
    }

    backSvg() {
        return `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="12" r="9.2" fill="rgba(216, 70, 166, 0.12)" stroke="#E879A9" stroke-width="1.55"/>
            <path d="M13.8 7.4 L8.6 12 l5.2 4.6" fill="none" stroke="#E879A9" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 12 H16.2" fill="none" stroke="#E879A9" stroke-width="1.9" stroke-linecap="round"/>
        </svg>`;
    }

    /** The open folder's own label (walked from the root), or the lists name at the root. */
    currentTitle() {
        let entries = this.rootEntries();
        let label = '';
        for (const id of this.path) {
            const folder = entries.find((entry) => entry.kind === 'folder' && entry.id === id);
            if (!folder) return this.t('menu.curateLists', 'my curated lists');
            label = folder.label;
            entries = this.entriesForFolder(id);
        }
        return label || this.t('menu.curateLists', 'my curated lists');
    }

    rootEntries() {
        return [
            { id: 'books', label: this.t('menu.listsBooks', 'books'), kind: 'folder' },
            { id: 'movies', label: this.t('menu.listsMovies', 'movies'), kind: 'folder' },
            { id: 'adventures', label: this.t('menu.listsPlaces', 'adventures'), kind: 'folder' },
            { id: 'podcasts', label: this.t('menu.listsPodcasts', 'podcasts'), kind: 'folder', empty: true },
            { id: 'games', label: this.t('menu.listsGames', 'games'), kind: 'folder' },
            { id: 'food', label: this.t('menu.listsFood', 'food'), kind: 'folder', empty: true },
            { id: 'art', label: this.t('menu.listsArt', 'art'), kind: 'folder', empty: true },
            { id: 'science', label: this.t('menu.listsScience', 'science'), kind: 'folder', empty: true },
        ];
    }

    /** Start adding entries for folders. */
    booksEntries() {
        return [
            {
                id: 'books-2026',
                label: this.t('menu.books2026', 'books i read in 2026'),
                kind: 'list',
                open: () => window.openBooksWindow?.('books-2026'),
            },
            {
                id: 'books-2027',
                label: this.t('menu.books2027', 'books i read in 2027'),
                kind: 'list',
                open: () => window.openBooksWindow?.('books-2027'),
            },
            {
                id: 'books-backlog',
                label: this.t('menu.booksBacklog', 'my endless ever-changing backlog'),
                kind: 'list',
                open: () => window.openBooksWindow?.('books-backlog'),
            },
            {
                id: 'kids-books',
                label: this.t('menu.kidsBooks', 'books our kids should read'),
                kind: 'list',
                open: () => window.openBooksWindow?.('kids-books'),
            },
        ];
    }

    moviesEntries() {
        return [
            {
                id: 'kids-movies',
                label: this.t('menu.kidsMovies', 'movies to watch with our kids'),
                kind: 'list',
                icon: 'movie',
                open: () => window.openBooksWindow?.('kids-movies'),
            },
            {
                id: 'winter-movies',
                label: this.t('menu.winterMovies', 'classic american movies for the winter holiday'),
                kind: 'list',
                icon: 'movie',
                open: () => window.openBooksWindow?.('winter-movies'),
            },
        ];
    }

    gamesEntries() {
        return [
            {
                id: 'games-youth',
                label: this.t('menu.gamesYouth', 'the games of my youth'),
                kind: 'list',
                icon: 'game',
                open: () => window.openBooksWindow?.('games-youth'),
            },
        ];
    }

    adventuresEntries() {
        return [
            { id: 'my-guides', label: this.t('menu.myGuides', 'my guides'), kind: 'folder' },
            {
                id: 'bucket-list',
                label: this.t('menu.bucketList', 'my bucket list'),
                kind: 'list',
                icon: 'pin',
                open: () => window.openBooksWindow?.('bucket-list'),
            },
            {
                id: 'cities-lived',
                label: this.t('menu.citiesLived', 'cities i have lived'),
                kind: 'list',
                icon: 'home',
                open: () => window.openBooksWindow?.('cities-lived'),
            },
            {
                id: 'countries-explored',
                label: this.t('menu.countriesExplored', 'countries i have explored'),
                kind: 'list',
                icon: 'globe',
                open: () => window.openBooksWindow?.('countries-explored'),
            },
        ];
    }

    guidesEntries() {
        return [
            {
                id: 'guide-alagoas',
                label: this.t('menu.guideAlagoas', 'alagoas, brazil'),
                kind: 'list',
                icon: 'map',
                open: () => window.openBooksWindow?.('guide-alagoas'),
            },
            {
                id: 'guide-iceland',
                label: this.t('menu.guideIceland', 'iceland'),
                kind: 'list',
                icon: 'map',
                open: () => window.openBooksWindow?.('guide-iceland'),
            },
            {
                id: 'guide-berlin',
                label: this.t('menu.guideBerlin', 'fun in berlin'),
                kind: 'list',
                icon: 'map',
                open: () => window.openBooksWindow?.('guide-berlin'),
            },
        ];
    }

    podcastsEntries() {
        return [];
    }

    podcastsZeitgeistEntries() {
        return (window.PODCAST_EPISODES || []).map((episode) => ({
            id: episode.id,
            label: episode.title,
            kind: 'podcast',
            open: () => window.openPodcastWindow?.({ title: episode.title, videoId: episode.videoId }),
        }));
    }

    /** Entries inside a sub-folder; folders without content return []. */
    entriesForFolder(folderId) {
        if (folderId === 'books') return this.booksEntries();
        if (folderId === 'movies') return this.moviesEntries();
        if (folderId === 'games') return this.gamesEntries();
        if (folderId === 'podcasts') return this.podcastsEntries();
        if (folderId === 'adventures') return this.adventuresEntries();
        if (folderId === 'my-guides') return this.guidesEntries();
        return [];
    }

    /** Optional note shown above a folder's items (takes the folder id); folders with a note get the larger window. */
    descriptionFor() {
        return '';
    }

    entriesForPath() {
        const leaf = this.path[this.path.length - 1];
        if (!leaf) return this.rootEntries();
        return this.entriesForFolder(leaf);
    }

    makeItem({ iconHtml, label, onActivate, count = 0 }) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'file-item lists-folder-item';
        const badge = count > 0 ? `<span class="lists-folder-count-badge">${count}</span>` : '';
        item.innerHTML = `<div class="lists-folder-icon"><span class="lists-folder-icon-art">${iconHtml}${badge}</span></div><div class="file-name"></div>`;
        item.querySelector('.file-name').textContent = label;
        item.addEventListener('click', (e) => {
            e.preventDefault();
            onActivate();
        });
        item.addEventListener('dblclick', (e) => {
            e.preventDefault();
            onActivate();
        });
        return item;
    }

    render() {
        const { title, fileList } = this.elements;
        if (!fileList) return;
        if (title) title.textContent = this.currentTitle().toUpperCase();

        fileList.replaceChildren();

        const description = this.descriptionFor(this.path[this.path.length - 1]);
        this.window.classList.toggle('lists-folder-window--wide', Boolean(description));
        if (description) {
            const note = document.createElement('p');
            note.className = 'lists-folder-description';
            note.textContent = description;
            fileList.appendChild(note);
        }

        if (this.path.length > 0) {
            fileList.appendChild(this.makeItem({
                iconHtml: this.backSvg(),
                label: this.t('lists.back', 'back'),
                onActivate: () => {
                    this.path.pop();
                    this.render();
                    this.syncUrl();
                },
            }));
        }

        const entries = this.entriesForPath();
        if (!entries.length) {
            const empty = document.createElement('div');
            empty.className = 'lists-folder-empty';
            empty.innerHTML = '<div class="lists-folder-empty-text"></div>';
            empty.querySelector('.lists-folder-empty-text').textContent =
                this.t('lists.folderEmpty', 'this folder is empty');
            fileList.appendChild(empty);
            return;
        }

        for (const entry of entries) {
            let iconHtml = this.folderSvg();
            if (entry.kind === 'list') iconHtml = this.listIconSvg(entry.icon);
            if (entry.kind === 'podcast') iconHtml = this.listIconSvg('podcast');
            fileList.appendChild(this.makeItem({
                iconHtml,
                label: entry.label,
                count: entry.kind === 'folder' ? this.entriesForFolder(entry.id).length : 0,
                onActivate: () => {
                    if (entry.kind === 'folder') {
                        this.path.push(entry.id);
                        this.render();
                        this.syncUrl();
                        return;
                    }
                    entry.open?.();
                },
            }));
        }
    }

    /** Opens the root, a folder id ("movies", "zeitgeist-awards-2026"), a "a/b" path string or a path array. */
    open(folder = null) {
        if (Array.isArray(folder)) this.path = [...folder];
        else if (folder) this.path = this.resolveFolderPath(folder) || [folder];
        else this.path = [];
        this.render();
        super.open();
        this.syncUrl();
    }
}

window.ListsFolderAppClass = ListsFolderApp;

const initListsFolderApp = () => {
    window.ListsFolderApp = new ListsFolderApp();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListsFolderApp);
} else {
    initListsFolderApp();
}

window.openListsFolderWindow = (folderId = null) => window.ListsFolderApp?.open(folderId);
