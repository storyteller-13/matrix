/**
 * Books 2026 – curated reading list window (notes letter styles).
 */
class BooksApp extends BaseApp {
    constructor() {
        super({ windowId: 'books-window' });
        this.init();
    }

    init() {
        super.init();
        if (!this.window) return;
        this.render();
        document.addEventListener('localechange', () => this.render());
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
            const rating = this.escapeHtml(book.rating || '—');
            let notes = '—';
            if (book.url) {
                notes = `<a href="${this.escapeHtml(book.url)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(window.I18n?.t?.('lists.thoughts') || 'my thoughts')}</a>`;
            } else if (book.note) {
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
        const label = this.escapeHtml(window.I18n?.t?.('lists.backlog') || 'my backlog');
        const rows = backlog.map((entry) => {
            const item = typeof entry === 'string' ? { title: entry } : (entry || {});
            const title = this.escapeHtml((item.title || '').toLowerCase());
            const cell = item.url
                ? `<a href="${this.escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${title}</a>`
                : title;
            return `<tr><td class="books-col-title">${cell}</td></tr>`;
        }).join('');
        return `<section class="books-month books-backlog" id="books-backlog">
            <table class="books-table books-table--backlog">
                <thead>
                    <tr>
                        <th scope="col">${label}</th>
                    </tr>
                </thead>
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
