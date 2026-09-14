/**
 * Notes Application Module
 * Self-contained notes application for creating and managing notes
 */
class NotesApp extends BaseApp {
    constructor() {
        super({ windowId: 'notes-window', dockItemId: 'notes-dock-item' });
        this.storage = new NotesStorage();
        this.entries = [];
        this.entriesByDate = {};
        this.elements = {};
        this.activeLetterEntry = null;
        this.shareResetTimer = null;
        this.syncingFromUrl = false;
        this.init();
    }

    init() {
        super.init();
        if (!this.window) return;
        this.cacheElements();
        this.loadEntries();
        this.setupEventListeners();
        this.setupShareRouting();
        this.render();
        this.updateBadge();
        document.addEventListener('localechange', () => {
            this.render();
            if (this.activeLetterEntry) {
                this.populateLetterContent(this.activeLetterEntry);
                this.resetShareButton();
            }
        });
        this.openNoteFromUrl();
    }

    cacheElements() {
        this.elements.notesFooter = document.getElementById('notes-footer');
        this.elements.notesCount = document.getElementById('notes-count');
        this.elements.badge = document.getElementById('notes-count-badge');
        this.elements.menuCount = document.getElementById('notes-menu-count');
        this.elements.shareButton = document.getElementById('letter-share');
    }

    setupShareRouting() {
        window.addEventListener('popstate', () => this.openNoteFromUrl());

        const letterWindow = document.getElementById('notes-letter-window');
        if (letterWindow) {
            const closeBtn = letterWindow.querySelector('.control.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.activeLetterEntry = null;
                    this.clearNoteFromUrl();
                    this.resetShareButton();
                });
            }
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

    getNoteIdFromUrl() {
        try {
            return new URLSearchParams(window.location.search).get('note');
        } catch {
            return null;
        }
    }

    findEntryByShareId(shareId) {
        if (!shareId) return null;
        const needle = String(shareId).toLowerCase();
        return this.entries.find(entry => String(entry.id).toLowerCase() === needle) || null;
    }

    getShareUrl(entry) {
        const url = new URL(window.location.href);
        url.searchParams.set('note', entry.id);
        return url.toString();
    }

    setNoteInUrl(entry) {
        if (this.syncingFromUrl) return;
        try {
            const url = new URL(window.location.href);
            const nextId = entry?.id || null;
            const currentId = url.searchParams.get('note');
            if (nextId) {
                if (currentId === nextId) return;
                url.searchParams.set('note', nextId);
            } else {
                if (!currentId) return;
                url.searchParams.delete('note');
            }
            history.replaceState(null, '', url);
        } catch {
            // Ignore URL update failures in non-browser test hosts
        }
    }

    clearNoteFromUrl() {
        this.setNoteInUrl(null);
    }

    openNoteFromUrl() {
        const shareId = this.getNoteIdFromUrl();
        if (!shareId) {
            return;
        }
        const entry = this.findEntryByShareId(shareId);
        if (!entry) return;
        if (this.activeLetterEntry && this.activeLetterEntry.id === entry.id) return;

        this.syncingFromUrl = true;
        try {
            this.openLetterWindow(entry);
        } finally {
            this.syncingFromUrl = false;
        }
    }

    async copyShareUrl() {
        if (!this.activeLetterEntry) return;
        const shareUrl = this.getShareUrl(this.activeLetterEntry);
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

    loadEntries() {
        // Always load default entries (cache is disabled)
        this.entries = this.storage.load();

        // Sort by date, newest first
        this.sortEntries();
    }

    sortEntries() {
        this.entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    open() {
        super.open();
        this.render();
    }

    render() {
        const entriesList = document.getElementById('notes-entries-list');
        if (!entriesList) return;

        const count = this.entries.length;
        const { notesFooter, notesCount } = this.elements;

        if (notesCount) {
            const key = count === 1 ? 'notes.entry' : 'notes.entries';
            notesCount.textContent = window.I18n
                ? window.I18n.t(key, { count })
                : `${count} ${count === 1 ? 'entry' : 'entries'}`;
        }
        if (notesFooter) {
            notesFooter.style.display = count > 0 ? 'flex' : 'none';
        }

        if (this.entries.length === 0) {
            this.renderEmptyState(entriesList);
            this.updateBadge();
            return;
        }

        this.groupEntriesByDate();
        const sortedDates = this.getSortedDates();
        entriesList.innerHTML = this.renderDateItems(sortedDates);
        this.attachDateItemListeners(entriesList);
        this.updateBadge();
    }

    renderEmptyState(container) {
        container.innerHTML = `
            <div class="notes-empty">
                <div class="empty-icon">📔</div>
                <div class="empty-text">${window.I18n ? window.I18n.t('notes.empty') : 'no entries yet'}</div>
            </div>
        `;
    }

    groupEntriesByDate() {
        this.entriesByDate = {};
        this.entries.forEach(entry => {
            const dateKey = new Date(entry.createdAt).toDateString();
            if (!this.entriesByDate[dateKey]) {
                this.entriesByDate[dateKey] = [];
            }
            this.entriesByDate[dateKey].push(entry);
        });
    }

    getSortedDates() {
        return Object.keys(this.entriesByDate).sort((a, b) => {
            return new Date(b) - new Date(a);
        });
    }

    renderDateItems(sortedDates) {
        return sortedDates.map((dateKey) => {
            const dateEntries = this.entriesByDate[dateKey];
            const firstEntry = dateEntries[0];
            const date = this.storage.formatDate(firstEntry.createdAt);
            const title = this.localizeEntry(firstEntry).title || '';
            const isRead = dateEntries.some(entry => entry.read === true);

            // Show '✓' if read, otherwise show '🆕' if newest
            const indicator = isRead ? '✓' : '💌';

            return `
                <div class="notes-date-item ${isRead ? 'read' : ''}" data-date-key="${dateKey}" data-note-id="${this.escapeHtml(firstEntry.id)}">
                    <div class="notes-read-indicator">${indicator}</div>
                    <span class="notes-date-text">${this.escapeHtml(date)}</span>
                    ${title ? `<span class="notes-date-title">${this.escapeHtml(title)}</span>` : ''}
                </div>
            `;
        }).join('');
    }

    attachDateItemListeners(container) {
        container.querySelectorAll('.notes-date-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const dateKey = item.getAttribute('data-date-key');
                const dateEntries = this.entriesByDate[dateKey];
                if (dateEntries && dateEntries.length > 0) {
                    this.openLetterWindow(dateEntries[0]);
                }
            });
        });
    }

    openLetterWindow(entry) {
        const letterWindow = document.getElementById('notes-letter-window');
        if (!letterWindow) return;

        // Mark entry as read
        entry.read = true;
        this.activeLetterEntry = entry;

        // Populate letter content
        this.populateLetterContent(entry);
        this.resetShareButton();
        this.setNoteInUrl(entry);

        // Show letter window
        if (window.WindowManager) {
            this.openLetterWindowWithManager(letterWindow);
        } else {
            this.openLetterWindowFallback(letterWindow);
        }

        // Scroll to top of the letter content
        this.scrollLetterToTop(letterWindow);

        // Re-render to update read status
        this.render();
    }

    localizeEntry(entry) {
        if (!entry) return entry;
        return {
            ...entry,
            title: this.i18nLabel(entry.titleKey, entry.title),
            content: this.i18nLabel(entry.contentKey, entry.content),
        };
    }

    i18nLabel(key, fallback) {
        if (!key || !window.I18n) return fallback || '';
        const translated = window.I18n.t(key);
        return !translated || translated === key ? (fallback || '') : translated;
    }

    populateLetterContent(entry) {
        const localized = this.localizeEntry(entry);
        const date = this.storage.formatDate(localized.createdAt);
        const dateEl = document.getElementById('letter-date');
        const titleEl = document.getElementById('letter-title');
        const contentEl = document.getElementById('letter-content');
        const containerEl = document.querySelector('.letter-container');

        if (dateEl) dateEl.textContent = date;
        if (titleEl) titleEl.textContent = localized.title || '';
        if (contentEl) {
            contentEl.innerHTML = this.formatContent(localized.content || '');
            contentEl.classList.toggle('letter-content--italic', entry.italic === true);
        }
        if (containerEl) {
            containerEl.classList.toggle('letter-container--ascii', entry.asciiArt === true);
        }
    }

    openLetterWindowWithManager(letterWindow) {
        window.WindowManager.open(letterWindow, null);
        // Explicitly bring to front multiple times to ensure it's above all windows
        requestAnimationFrame(() => {
            window.WindowManager.bringToFront(letterWindow);
            setTimeout(() => {
                window.WindowManager.bringToFront(letterWindow);
            }, 50);
        });
    }

    openLetterWindowFallback(letterWindow) {
        letterWindow.style.top = '50%';
        letterWindow.style.left = '50%';
        letterWindow.style.display = 'block';
        letterWindow.style.opacity = '0';
        letterWindow.style.transform = 'translate(-50%, -50%) scale(0.9)';

        void letterWindow.offsetHeight;

        requestAnimationFrame(() => {
            letterWindow.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            letterWindow.style.opacity = '1';
            letterWindow.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        if (window.bringToFront) {
            window.bringToFront(letterWindow);
        }
    }

    scrollLetterToTop(letterWindow) {
        requestAnimationFrame(() => {
            const windowContent = letterWindow.querySelector('.window-content');
            if (windowContent) {
                windowContent.scrollTop = 0;
            }
        });
    }

    formatContent(content) {
        // Support «i»...«/i» for inline italic (multiline allowed)
        const italicRegex = /«i»([\s\S]*?)«\/i»/g;
        const segments = [];
        let lastIndex = 0;
        let match;
        while ((match = italicRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                segments.push({ type: 'normal', text: content.slice(lastIndex, match.index) });
            }
            segments.push({ type: 'italic', text: match[1] });
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < content.length) {
            segments.push({ type: 'normal', text: content.slice(lastIndex) });
        }
        const processed = segments.length
            ? segments.map(s => s.type === 'italic' ? '<em>' + this.escapeHtml(s.text) + '</em>' : this.escapeHtml(s.text)).join('')
            : this.escapeHtml(content);
        return processed.replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateBadge() {
        const { badge, menuCount } = this.elements;
        const count = this.entries.length;
        const text = count > 99 ? '99+' : count.toString();

        if (badge) {
            if (count > 0) {
                badge.textContent = text;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
        if (menuCount) {
            if (count > 0) {
                menuCount.textContent = text;
                menuCount.style.display = 'flex';
            } else {
                menuCount.style.display = 'none';
            }
        }
    }
}

// Expose class constructor for testing
window.NotesAppClass = NotesApp;

// Initialize when DOM is ready
const initNotesApp = () => {
    window.NotesApp = new NotesApp();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotesApp);
} else {
    initNotesApp();
}

// Expose open function globally for onclick handlers
window.openNotesWindow = function() {
    if (window.NotesApp) {
        window.NotesApp.open();
    }
};
