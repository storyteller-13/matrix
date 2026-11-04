/**
 * Curate lists folder browser – nested folders for books / movies / adventures / art / articles / food / podcasts / games.
 */

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
        this.render();
        document.addEventListener('localechange', () => this.render());
    }

    cacheElements() {
        this.elements.title = this.window.querySelector('.window-title');
        this.elements.fileList = this.window.querySelector('.file-list');
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

    backSvg() {
        return `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="12" r="9.2" fill="rgba(216, 70, 166, 0.12)" stroke="#E879A9" stroke-width="1.55"/>
            <path d="M13.8 7.4 L8.6 12 l5.2 4.6" fill="none" stroke="#E879A9" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 12 H16.2" fill="none" stroke="#E879A9" stroke-width="1.9" stroke-linecap="round"/>
        </svg>`;
    }

    emptyFolderSvg() {
        return this.folderSvg();
    }

    bookListSvg() {
        return `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4.5 4.2 h6.2 c1.3 0 2.3 1 2.3 2.3 v12.1 c0-1.1-0.9-2-2-2 H4.5 Z" fill="rgba(216, 70, 166, 0.18)" stroke="#E879A9" stroke-width="1.55" stroke-linejoin="round"/>
            <path d="M19.5 4.2 h-6.2 c-1.3 0-2.3 1-2.3 2.3 v12.1 c0-1.1 0.9-2 2-2 H19.5 Z" fill="rgba(216, 70, 166, 0.12)" stroke="#E879A9" stroke-width="1.55" stroke-linejoin="round"/>
            <path d="M12 6.6 V16.8" stroke="#E879A9" stroke-width="1.35" stroke-linecap="round" opacity="0.85"/>
        </svg>`;
    }

    movieListSvg() {
        return `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="3.5" y="5.5" width="17" height="13" rx="1.8" fill="rgba(216, 70, 166, 0.15)" stroke="#E879A9" stroke-width="1.55"/>
            <path d="M3.5 9 H20.5 M3.5 15 H20.5" stroke="#E879A9" stroke-width="1.2" opacity="0.8"/>
            <path d="M7 5.5 V9 M12 5.5 V9 M17 5.5 V9 M7 15 V18.5 M12 15 V18.5 M17 15 V18.5" stroke="#E879A9" stroke-width="1.2" opacity="0.8"/>
            <path d="M10.6 10.6 L14 12 L10.6 13.4 Z" fill="#E879A9" stroke="#E879A9" stroke-width="0.8" stroke-linejoin="round"/>
        </svg>`;
    }

    currentTitle() {
        const leaf = this.path[this.path.length - 1];
        if (leaf === 'books') return this.t('menu.listsBooks', 'books');
        if (leaf === 'movies') return this.t('menu.listsMovies', 'movies');
        if (leaf === 'games') return this.t('menu.listsGames', 'games');
        if (leaf === 'music') return this.t('menu.listsMusic', 'music');
        if (leaf === 'adventures') return this.t('menu.listsPlaces', 'adventures');
        if (leaf === 'art') return this.t('menu.listsArt', 'art');
        if (leaf === 'articles') return this.t('menu.listsArticles', 'articles');
        if (leaf === 'food') return this.t('menu.listsFood', 'food');
        if (leaf === 'podcasts') return this.t('menu.listsPodcasts', 'podcasts');
        return this.t('menu.curateLists', 'my curated lists');
    }

    rootEntries() {
        return [
            { id: 'art', label: this.t('menu.listsArt', 'art'), kind: 'folder', empty: true },
            { id: 'articles', label: this.t('menu.listsArticles', 'articles'), kind: 'folder', empty: true },
            { id: 'games', label: this.t('menu.listsGames', 'games'), kind: 'folder', empty: true },
            { id: 'food', label: this.t('menu.listsFood', 'food'), kind: 'folder', empty: true },
            { id: 'books', label: this.t('menu.listsBooks', 'books'), kind: 'folder' },
            { id: 'movies', label: this.t('menu.listsMovies', 'movies'), kind: 'folder' },
            { id: 'adventures', label: this.t('menu.listsPlaces', 'adventures'), kind: 'folder', empty: true },
            { id: 'podcasts', label: this.t('menu.listsPodcasts', 'podcasts'), kind: 'folder', empty: true },
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
        ];
    }

    moviesEntries() {
        return [
            {
                id: 'zeitgeist-2026',
                label: this.t('menu.zeitgeist2026', 'zeitgeist awards 2026'),
                kind: 'list',
                icon: 'movie',
                open: () => window.openBooksWindow?.('zeitgeist-2026'),
            },
        ];
    }

    /** Entries inside a sub-folder; folders without content return []. */
    entriesForFolder(folderId) {
        if (folderId === 'books') return this.booksEntries();
        if (folderId === 'movies') return this.moviesEntries();
        return [];
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

        if (this.path.length > 0) {
            fileList.appendChild(this.makeItem({
                iconHtml: this.backSvg(),
                label: this.t('lists.back', 'back'),
                onActivate: () => {
                    this.path.pop();
                    this.render();
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
            if (entry.kind === 'list') iconHtml = entry.icon === 'movie' ? this.movieListSvg() : this.bookListSvg();
            fileList.appendChild(this.makeItem({
                iconHtml,
                label: entry.label,
                count: entry.kind === 'folder' ? this.entriesForFolder(entry.id).length : 0,
                onActivate: () => {
                    if (entry.kind === 'folder') {
                        this.path.push(entry.id);
                        this.render();
                        return;
                    }
                    entry.open?.();
                },
            }));
        }
    }

    open(folderId = null) {
        this.path = folderId ? [folderId] : [];
        this.render();
        super.open();
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
