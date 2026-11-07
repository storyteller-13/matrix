/**
 * Curated lists window (notes letter styles): books read in 2026, books read in 2027,
 * the book backlog, the books our kids should read, the zeitgeist movie awards, the games of my youth
 * and my travel guides. One window shows whichever list was opened.
 */

const BOOK_LISTS = [
    { id: 'books-2026', dataKey: 'BOOKS_2026', titleKey: 'window.books' },
    { id: 'books-2027', dataKey: 'BOOKS_2027', titleKey: 'window.books2027' },
    { id: 'books-backlog', dataKey: 'BOOKS_BACKLOG', titleKey: 'window.booksBacklog' },
    { id: 'kids-books', dataKey: 'KIDS_BOOKS', titleKey: 'window.kidsBooks' },
    { id: 'zeitgeist-2026', dataKey: 'ZEITGEIST_2026', titleKey: 'window.zeitgeist2026', subtitleKey: 'lists.zeitgeistReveal' },
    { id: 'kids-movies', dataKey: 'KIDS_MOVIES', titleKey: 'window.kidsMovies' },
    { id: 'winter-movies', dataKey: 'WINTER_MOVIES', titleKey: 'window.winterMovies' },
    { id: 'games-youth', dataKey: 'GAMES_YOUTH', titleKey: 'window.gamesYouth' },
    { id: 'guide-alagoas', dataKey: 'GUIDE_ALAGOAS', titleKey: 'window.guideAlagoas' },
    { id: 'guide-iceland', dataKey: 'GUIDE_ICELAND', titleKey: 'window.guideIceland' },
    { id: 'guide-berlin', dataKey: 'GUIDE_BERLIN', titleKey: 'window.guideBerlin' },
    { id: 'bucket-list', dataKey: 'BUCKET_LIST', titleKey: 'window.bucketList' },
    { id: 'cities-lived', dataKey: 'CITIES_LIVED', titleKey: 'window.citiesLived' },
    { id: 'countries-explored', dataKey: 'COUNTRIES_EXPLORED', titleKey: 'window.countriesExplored' },
];
const DEFAULT_BOOK_LIST = 'books-2026';

class BooksApp extends BaseApp {
    constructor() {
        super({ windowId: 'books-window' });
        this.elements = {};
        this.shareResetTimer = null;
        this.syncingFromUrl = false;
        this.shareOpen = false;
        this.listId = DEFAULT_BOOK_LIST;
        this.init();
    }

    /** Known lists whose data is loaded, keyed by their share id. */
    lists() {
        return BOOK_LISTS
            .map((list) => ({ ...list, data: window[list.dataKey], id: window[list.dataKey]?.shareId || list.id }))
            .filter((list) => list.data);
    }

    findList(id) {
        const wanted = String(id || '').toLowerCase();
        return this.lists().find((list) => list.id.toLowerCase() === wanted) || null;
    }

    currentList() {
        return this.findList(this.listId);
    }

    get shareId() {
        return this.currentList()?.id || DEFAULT_BOOK_LIST;
    }

    init() {
        super.init();
        if (!this.window) return;
        this.cacheElements();
        this.setupShareRouting();
        this.render();
        document.addEventListener('localechange', () => {
            this.render();
            this.resetShareButton();
        });
        this.openListFromUrl();
    }

    cacheElements() {
        this.elements.shareButton = document.getElementById('books-letter-share');
    }

    setupShareRouting() {
        window.addEventListener('popstate', () => this.openListFromUrl());

        if (this.window) {
            this.window.addEventListener('click', (e) => {
                if (!e.target.closest('.control.close')) return;
                this.shareOpen = false;
                this.clearListFromUrl();
                this.resetShareButton();
            }, true);
        }

        const { shareButton } = this.elements;
        if (shareButton) {
            shareButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.copyShareUrl();
            });
        }
    }

    getListIdFromUrl() {
        try {
            return new URLSearchParams(window.location.search).get('list');
        } catch {
            return null;
        }
    }

    getShareUrl() {
        const url = new URL(window.location.href);
        url.searchParams.set('list', this.shareId);
        return url.toString();
    }

    setListInUrl() {
        if (this.syncingFromUrl) return;
        try {
            const url = new URL(window.location.href);
            const currentId = url.searchParams.get('list');
            if (currentId === this.shareId) return;
            url.searchParams.set('list', this.shareId);
            history.replaceState(null, '', url);
        } catch {
            // Ignore URL update failures in non-browser test hosts
        }
    }

    clearListFromUrl() {
        if (this.syncingFromUrl) return;
        try {
            const url = new URL(window.location.href);
            if (!url.searchParams.has('list')) return;
            url.searchParams.delete('list');
            history.replaceState(null, '', url);
        } catch {
            // Ignore URL update failures in non-browser test hosts
        }
    }

    openListFromUrl() {
        const shareId = this.getListIdFromUrl();
        if (!shareId) return;
        const list = this.findList(shareId);
        if (!list) return;
        if (this.shareOpen && list.id === this.shareId) return;

        this.syncingFromUrl = true;
        try {
            this.open(list.id);
        } finally {
            this.syncingFromUrl = false;
        }
    }

    i18nLabel(key, fallback) {
        if (!key || !window.I18n) return fallback || '';
        const translated = window.I18n.t(key);
        return !translated || translated === key ? (fallback || '') : translated;
    }

    async copyShareUrl() {
        if (!this.shareOpen) return;
        const shareUrl = this.getShareUrl();
        let copied = false;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
                copied = true;
            }
        } catch {
            copied = false;
        }

        if (!copied) {
            copied = this.copyShareUrlFallback(shareUrl);
        }
        if (copied) {
            this.showShareCopied();
        }
    }

    copyShareUrlFallback(text) {
        try {
            const input = document.createElement('textarea');
            input.value = text;
            input.setAttribute('readonly', '');
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(input);
            return ok;
        } catch {
            return false;
        }
    }

    showShareCopied() {
        const { shareButton } = this.elements;
        if (!shareButton) return;
        const label = shareButton.querySelector('.letter-share-label');
        const copied = this.i18nLabel('notes.shareCopied', 'copied');
        shareButton.classList.add('copied');
        if (label) label.textContent = copied;
        shareButton.setAttribute('title', copied);
        shareButton.setAttribute('aria-label', copied);
        clearTimeout(this.shareResetTimer);
        this.shareResetTimer = setTimeout(() => this.resetShareButton(), 1600);
    }

    resetShareButton() {
        const { shareButton } = this.elements;
        if (!shareButton) return;
        const label = shareButton.querySelector('.letter-share-label');
        const share = this.i18nLabel('notes.share', 'share');
        shareButton.classList.remove('copied');
        if (label) label.textContent = share;
        shareButton.setAttribute('title', share);
        shareButton.setAttribute('aria-label', share);
    }

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    renderBookTitle(book) {
        const title = this.escapeHtml(book.title);
        if (!book.url) return title;
        return `<a href="${this.escapeHtml(book.url)}" target="_blank" rel="noopener noreferrer">${title}</a>`;
    }

    renderMonthTable(month) {
        const label = this.escapeHtml(month.label);
        const ratingLabel = this.escapeHtml(window.I18n?.t?.('lists.rating') || 'rating');
        const notesLabel = this.escapeHtml(window.I18n?.t?.('lists.notes') || 'notes');

        const rows = (month.books || []).map((book) => {
            const rating = this.escapeHtml(book.rating || '');
            let notes = '';
            if (book.url) {
                notes = `<a href="${this.escapeHtml(book.url)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(window.I18n?.t?.('lists.thoughts') || 'my thoughts')}</a>`;
            } else if (book.note && !/^highlights?$/i.test(String(book.note).trim())) {
                notes = this.escapeHtml(book.note);
            }
            return `<tr>
                <td class="books-col-title">${this.renderBookTitle(book)}</td>
                <td class="books-col-rating">${rating}</td>
                <td class="books-col-notes">${notes}</td>
            </tr>`;
        }).join('');

        return `<section class="books-month">
            <table class="books-table">
                <colgroup>
                    <col class="books-col-title">
                    <col class="books-col-rating">
                    <col class="books-col-notes">
                </colgroup>
                <thead>
                    <tr>
                        <th scope="col">${label}</th>
                        <th scope="col">${ratingLabel}</th>
                        <th scope="col">${notesLabel}</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </section>`;
    }

    renderBacklog(backlog, { heading = true } = {}) {
        if (!backlog?.length) return '';
        const label = this.escapeHtml(window.I18n?.t?.('lists.backlog') || 'my endless ever-changing backlog');
        const rows = backlog.map((entry) => {
            const item = typeof entry === 'string' ? { title: entry } : (entry || {});
            const title = this.escapeHtml((item.title || '').toLowerCase());
            const cell = item.url
                ? `<a href="${this.escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${title}</a>`
                : title;
            return `<tr><td class="books-col-title">${cell}</td></tr>`;
        }).join('');
        const headingHtml = heading ? `<h2 class="books-backlog-title">${label}</h2>` : '';
        return `<section class="books-backlog" id="books-backlog">
            ${headingHtml}
            <table class="books-table books-table--backlog">
                <tbody>${rows}</tbody>
            </table>
        </section>`;
    }

    /**
     * A category table: numbered with blank slots until winners are filled in (award lists),
     * or a plain unnumbered list when `ranked: false` (e.g. the games of my youth).
     */
    renderCategoryTable(category) {
        const label = this.escapeHtml(category.label || '');
        const items = category.movies || category.games || category.books || category.places || [];
        if (category.ranked === false) return this.renderPlainCategory(label, items, category);
        const size = Math.max(category.size || 0, items.length);
        const rows = Array.from({ length: size }, (_, i) => {
            const entry = items[i];
            const item = typeof entry === 'string' ? { title: entry } : (entry || {});
            const title = item.title ? this.renderBookTitle(item) : '';
            return `<tr>
                <td class="books-col-rank">${i + 1}</td>
                <td class="books-col-title">${title}</td>
            </tr>`;
        }).join('');

        return `<section class="books-award">
            <table class="books-table books-table--award">
                <colgroup>
                    <col class="books-col-rank">
                    <col class="books-col-title">
                </colgroup>
                <thead>
                    <tr><th scope="col" colspan="2">${label}</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </section>`;
    }

    /** Splits "title (director, year)" into its name and the trailing credit, keeping inner parentheses. */
    splitCredit(title) {
        const match = String(title || '').match(/^(.*\S)\s*\(([^()]*)\)\s*$/);
        return match ? { name: match[1], credit: match[2] } : { name: String(title || ''), credit: '' };
    }

    /**
     * An award category (layout: 'awards'): a card with an emoji badge and ranked entries; the top
     * three get gold, silver and bronze medals, each entry shows its credit and a one-line comment,
     * and empty slots stay as "to be revealed" placeholders up to `size`.
     */
    renderAwardCategory(category, index) {
        const esc = (value) => this.escapeHtml(value);
        const items = category.movies || [];
        const size = Math.max(category.size || 0, items.length);
        const medals = ['gold', 'silver', 'bronze'];
        const pending = esc(this.i18nLabel('lists.toBeRevealed', 'to be revealed'));
        const entries = Array.from({ length: size }, (_, i) => {
            const entry = items[i];
            const item = typeof entry === 'string' ? { title: entry } : (entry || {});
            const rank = `<span class="award-rank" aria-label="#${i + 1}">${i + 1}</span>`;
            if (!item.title) {
                return `<li class="award-entry award-entry--empty">${rank}<span class="award-pending">${pending}</span></li>`;
            }
            const { name, credit } = this.splitCredit(item.title);
            const nameHtml = item.url
                ? `<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(name)}</a>`
                : esc(name);
            const creditHtml = credit ? `<span class="award-credit">${esc(credit)}</span>` : '';
            const comment = item.comment ? `<p class="award-comment">${esc(item.comment)}</p>` : '';
            const medal = medals[i] ? ` award-entry--${medals[i]}` : '';
            return `<li class="award-entry${medal}">${rank}<div class="award-body">`
                + `<span class="award-title">${nameHtml}</span>${creditHtml}${comment}</div></li>`;
        }).join('');
        const emoji = category.emoji ? `<span class="award-emoji" aria-hidden="true">${esc(category.emoji)}</span>` : '';
        const featured = index === 0 && size > 5 ? ' award-category--featured' : '';
        return `<section class="award-category${featured}">
            <header class="award-head">${emoji}<h3 class="award-label">${esc(category.label || '')}</h3></header>
            <ol class="award-list">${entries}</ol>
        </section>`;
    }

    /** An unnumbered table; guides add an optional note per item and a note / footnote per category. */
    renderPlainCategory(label, items, category = {}) {
        const rows = items.map((entry) => {
            const item = typeof entry === 'string' ? { title: entry } : (entry || {});
            const note = item.note ? `<span class="books-item-note"> → ${this.escapeHtml(item.note)}</span>` : '';
            return `<tr><td class="books-col-title">${item.title ? this.renderBookTitle(item) : ''}${note}</td></tr>`;
        }).join('');
        const noteRow = category.note
            ? `<tr><td class="books-category-note">${this.escapeHtml(category.note)}</td></tr>`
            : '';
        const footnote = category.footnote
            ? `<p class="books-category-note books-category-footnote">${this.escapeHtml(category.footnote)}</p>`
            : '';
        return `<section class="books-award">
            <table class="books-table books-table--award books-table--plain">
                <thead>
                    <tr><th scope="col">${label}</th></tr>
                    ${noteRow}
                </thead>
                <tbody>${rows}</tbody>
            </table>${footnote}
        </section>`;
    }

    /** A long-form guide section: heading, place, paragraphs, then an optional table, details, lists and tip. */
    renderGuideSection(section) {
        const esc = (value) => this.escapeHtml(value);
        const place = section.place ? `<p class="guide-place">${esc(section.place)}</p>` : '';
        const paragraphs = (section.paragraphs || []).map((text) => `<p class="guide-paragraph">${esc(text)}</p>`).join('');
        let table = '';
        if (section.table) {
            const head = (section.table.columns || []).map((column) => `<th scope="col">${esc(column)}</th>`).join('');
            const rows = (section.table.rows || [])
                .map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('');
            const caption = section.table.caption ? `<caption>${esc(section.table.caption)}</caption>` : '';
            table = `<table class="books-table guide-table">${caption}<thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
        }
        const detailRows = (section.details || []).map((detail) => {
            const value = detail.url
                ? `<a href="${esc(detail.url)}" target="_blank" rel="noopener noreferrer">${esc(detail.value)}</a>`
                : esc(detail.value);
            return `<div class="guide-detail"><dt>${esc(detail.label)}</dt><dd>${value}</dd></div>`;
        }).join('');
        const details = detailRows ? `<dl class="guide-details">${detailRows}</dl>` : '';
        const lists = (section.lists || []).map((list) => {
            const heading = list.heading ? `<h4 class="guide-list-heading">${esc(list.heading)}</h4>` : '';
            const items = (list.items || []).map((item) => `<li>${esc(item)}</li>`).join('');
            return `${heading}<ul class="guide-list">${items}</ul>`;
        }).join('');
        const tip = section.tip ? `<p class="guide-tip">${esc(section.tip)}</p>` : '';
        return `<section class="guide-section">
            <h3 class="guide-heading">${esc(section.label || '')}</h3>${place}${paragraphs}${table}${details}${lists}${tip}
        </section>`;
    }

    /** A count line under the title: "5 continents · 64 countries · 210 places" or "30 countries". */
    renderStats(data) {
        const count = (n, key, fallback) => `${n} ${this.i18nLabel(key, fallback)}`;
        let parts = [];
        if (data.regions?.length) {
            const countries = data.regions.flatMap((region) => region.countries || []);
            const places = countries.reduce((n, country) => n + (country.places || []).length, 0);
            parts = [
                count(data.regions.length, 'lists.continents', 'continents'),
                count(countries.length, 'lists.countries', 'countries'),
                count(places, 'lists.places', 'places'),
            ];
        } else if (data.visited?.length) {
            parts = [count(data.visited.length, 'lists.countries', 'countries')];
        }
        return parts.length ? `<p class="list-stats">${this.escapeHtml(parts.join(' · '))}</p>` : '';
    }

    /** A continent: heading with its counts, then one card per country with its places as pills. */
    renderBucketRegion(region) {
        const esc = (value) => this.escapeHtml(value);
        const countries = region.countries || [];
        const places = countries.reduce((n, country) => n + (country.places || []).length, 0);
        const cards = countries.map((country) => {
            const pills = (country.places || []).map((place) => `<li class="bucket-place">${esc(place)}</li>`).join('');
            const list = pills ? `<ul class="bucket-places">${pills}</ul>` : '';
            return `<div class="bucket-card"><h4 class="bucket-country">${esc(country.name)}</h4>${list}</div>`;
        }).join('');
        const emoji = region.emoji ? `<span class="bucket-region-emoji" aria-hidden="true">${esc(region.emoji)}</span>` : '';
        const count = `${countries.length} ${this.i18nLabel('lists.countries', 'countries')} · ${places} ${this.i18nLabel('lists.places', 'places')}`;
        return `<section class="bucket-region">
            <h3 class="bucket-region-title">${emoji}<span>${esc(region.label || '')}</span><span class="bucket-region-count">${esc(count)}</span></h3>
            <div class="bucket-grid">${cards}</div>
        </section>`;
    }

    /** Cities i have lived: numbered cards in order, "city, state or country" on one line. */
    renderCities(cities) {
        if (!cities?.length) return '';
        const cards = cities.map((entry, i) => {
            const where = entry.where ? `<span class="city-where">, ${this.escapeHtml(entry.where)}</span>` : '';
            return `<li class="city-card"><span class="city-number">${String(i + 1).padStart(2, '0')}</span>`
                + `<span class="city-name">${this.escapeHtml(entry.city || '')}${where}</span></li>`;
        }).join('');
        return `<ol class="city-grid">${cards}</ol>`;
    }

    /** Countries i have explored: a flag card per country. */
    renderVisited(visited) {
        if (!visited?.length) return '';
        const cards = visited.map((entry) => {
            const flag = entry.flag ? `<span class="country-flag" aria-hidden="true">${this.escapeHtml(entry.flag)}</span>` : '';
            return `<li class="city-card country-card">${flag}<span class="city-name">${this.escapeHtml(entry.name || '')}</span></li>`;
        }).join('');
        return `<ul class="city-grid country-grid">${cards}</ul>`;
    }

    renderEmpty() {
        const text = this.escapeHtml(this.i18nLabel('lists.empty', 'no books here yet'));
        return `<p class="books-empty">${text}</p>`;
    }

    render() {
        const titleEl = this.window.querySelector('#books-letter-title');
        const headerTitleEl = this.window.querySelector('.window-header .window-title');
        const bodyEl = this.window.querySelector('#books-letter-content');
        const list = this.currentList();
        if (!list || !bodyEl) return;
        const { data } = list;

        const title = this.i18nLabel(list.titleKey, data.title);
        if (titleEl) titleEl.textContent = title;
        if (headerTitleEl) headerTitleEl.textContent = title.toUpperCase();

        // Above the list: subtitle, intro and a count line, each only when the list has one.
        const subtitle = data.subtitle ? this.i18nLabel(list.subtitleKey, data.subtitle) : '';
        const headerHtml = (subtitle ? `<p class="books-subtitle">${this.escapeHtml(subtitle)}</p>` : '')
            + (data.intro ? `<p class="guide-intro">${this.escapeHtml(data.intro)}</p>` : '')
            + this.renderStats(data);
        const awards = data.layout === 'awards';
        const categoriesHtml = awards
            ? `<div class="award-grid">${(data.categories || []).map((c, i) => this.renderAwardCategory(c, i)).join('')}</div>`
            : (data.categories || []).map((category) => this.renderCategoryTable(category)).join('');
        const listHtml = [
            data.categories?.length ? categoriesHtml : '',
            (data.sections || []).map((section) => this.renderGuideSection(section)).join(''),
            (data.regions || []).map((region) => this.renderBucketRegion(region)).join(''),
            this.renderCities(data.cities),
            this.renderVisited(data.visited),
            (data.months || []).map((month) => this.renderMonthTable(month)).join(''),
            // A list that is only a backlog already carries the backlog name as its title.
            this.renderBacklog(data.backlog, { heading: Boolean(data.months) }),
        ].join('');
        const content = `${headerHtml}${listHtml || this.renderEmpty()}`;

        // Unranked lists (all plain categories) flow into side-by-side columns sized to their text.
        const categories = data.categories || [];
        const plain = categories.length > 0 && categories.every((category) => category.ranked === false);
        const tablesClass = plain ? 'books-tables books-tables--columns' : 'books-tables';
        // The note stays centred above the columns instead of flowing into the first one.
        bodyEl.innerHTML = plain
            ? `<div class="books-tables">${headerHtml}<div class="${tablesClass}">${listHtml}</div></div>`
            : `<div class="${tablesClass}">${content}</div>`;
    }

    open(listId = null) {
        const list = listId ? this.findList(listId) : null;
        if (list) this.listId = list.id;
        if (this.window) this.render();
        super.open();
        if (!this.window) return;
        this.shareOpen = true;
        this.resetShareButton();
        this.setListInUrl();
        // Keep the curated-list folder behind and cascade this window on top of it.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (!this.window) return;
                const folder = document.getElementById('lists-folder-window');
                const folderVisible = folder && getComputedStyle(folder).display !== 'none';
                if (folderVisible) {
                    this.window.style.top = 'calc(50% + 28px)';
                    this.window.style.left = 'calc(50% + 36px)';
                    this.window.style.transform = 'translate(-50%, -50%) scale(1)';
                }
                if (window.bringToFront) {
                    window.bringToFront(this.window);
                } else if (window.WindowManager?.bringToFront) {
                    window.WindowManager.bringToFront(this.window);
                }
            });
        });
    }
}

window.BooksAppClass = BooksApp;

const initBooksApp = () => {
    window.BooksApp = new BooksApp();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBooksApp);
} else {
    initBooksApp();
}

window.openBooksWindow = (listId = null) => window.BooksApp?.open(listId);
