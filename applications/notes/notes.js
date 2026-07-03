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
        this.init();
    }

    init() {
        super.init();
        if (!this.window) return;
        this.cacheElements();
        this.loadEntries();
        this.setupEventListeners();
        this.render();
        this.updateBadge();
    }

    cacheElements() {
        this.elements.notesFooter = document.getElementById('notes-footer');
        this.elements.notesCount = document.getElementById('notes-count');
        this.elements.badge = document.getElementById('notes-count-badge');
        this.elements.menuCount = document.getElementById('notes-menu-count');
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

    saveEntries() {
        this.storage.save(this.entries);
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
            notesCount.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
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
                <div class="empty-text">no entries yet</div>
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
        return sortedDates.map((dateKey, index) => {
            const dateEntries = this.entriesByDate[dateKey];
            const firstEntry = dateEntries[0];
            const date = this.storage.formatDate(firstEntry.createdAt);
            const title = firstEntry.title || '';
            const isRead = dateEntries.some(entry => entry.read === true);

            // Show '✓' if read, otherwise show '🆕' if newest
            const indicator = isRead ? '✓' : '💌';

            return `
                <div class="notes-date-item ${isRead ? 'read' : ''}" data-date-key="${dateKey}">
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
        this.saveEntries();

        // Populate letter content
        this.populateLetterContent(entry);

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

    populateLetterContent(entry) {
        const date = this.storage.formatDate(entry.createdAt);
        const dateEl = document.getElementById('letter-date');
        const titleEl = document.getElementById('letter-title');
        const contentEl = document.getElementById('letter-content');
        const containerEl = document.querySelector('.letter-container');

        if (dateEl) dateEl.textContent = date;
        if (titleEl) titleEl.textContent = entry.title || '';
        if (contentEl) {
            contentEl.innerHTML = this.formatContent(entry.content || '');
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

    addEntry(title, content) {
        // Use current time to ensure it's always newer than existing entries
        // Default entries are set to midnight, so any time during the day will be newer
        // Add 1 second to ensure it's definitely newer than any existing entry
        const now = new Date();
        now.setSeconds(now.getSeconds() + 1);

        const newEntry = {
            id: this.storage.generateId(),
            title: title || '',
            content: content || '',
            createdAt: now.toISOString(),
            updatedAt: null,
            read: false
        };

        this.entries.push(newEntry);
        this.sortEntries();
        this.saveEntries();

        // Ensure window is open to show the new entry
        this.open();
        this.render();

        // Scroll to top to show the new entry (newest entries are at the top)
        this.scrollToTop();

        return newEntry;
    }

    scrollToTop() {
        const entriesList = document.getElementById('notes-entries-list');
        if (entriesList) {
            requestAnimationFrame(() => {
                entriesList.scrollTop = 0;
            });
        }
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

// Expose addEntry function globally
window.addNotesEntry = function(title, content) {
    if (window.NotesApp) {
        return window.NotesApp.addEntry(title, content);
    }
    return null;
};

