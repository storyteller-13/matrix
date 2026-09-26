/**
 * Books 2026 – curated reading list window (notes letter styles).
 */
class BooksApp extends BaseApp {
    constructor() {
        super({ windowId: 'books-window' });
        this.elements = {};
        this.shareResetTimer = null;
        this.syncingFromUrl = false;
        this.shareOpen = false;
        this.shareId = window.BOOKS_2026?.shareId || 'books-2026';
        this.init();
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
        if (String(shareId).toLowerCase() !== String(this.shareId).toLowerCase()) return;
        if (this.shareOpen) return;

        this.syncingFromUrl = true;
        try {
            this.open();
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

    renderBacklog(backlog) {
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
        return `<section class="books-backlog" id="books-backlog">
            <h2 class="books-backlog-title">${label}</h2>
            <table class="books-table books-table--backlog">
                <tbody>${rows}</tbody>
            </table>
        </section>`;
    }

    render() {
        const titleEl = this.window.querySelector('#books-letter-title');
        const bodyEl = this.window.querySelector('#books-letter-content');
        const data = window.BOOKS_2026;
        if (!data || !bodyEl) return;

        if (titleEl) {
            titleEl.textContent = window.I18n?.t?.('window.books') || data.title;
        }

        const monthsHtml = (data.months || []).map((month) => this.renderMonthTable(month)).join('');
        const backlogHtml = this.renderBacklog(data.backlog);

        bodyEl.innerHTML = `<div class="books-tables">${monthsHtml}${backlogHtml}</div>`;
    }

    open() {
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

window.openBooksWindow = () => window.BooksApp?.open();
