/**
 * Notes Storage Module
 * Supplies default notes entries (persistence is disabled).
 */
class NotesStorage {
    constructor() {
        this.storageKey = 'notes-entries';
    }

    load() {
        localStorage.removeItem(this.storageKey);
        const defaults = this.getDefaultEntries();
        return defaults.map(entry => this.normalizeEntry(entry));
    }

    normalizeEntry(entry) {
        return {
            id: entry.id || this.generateId(),
            title: entry.title || '',
            content: entry.content || '',
            titleKey: entry.titleKey || undefined,
            contentKey: entry.contentKey || undefined,
            createdAt: entry.date || entry.createdAt || new Date().toISOString(),
            updatedAt: entry.updatedAt || null,
            read: entry.read || false,
            italic: entry.italic || false,
            asciiArt: entry.asciiArt || false
        };
    }

    getDefaultEntries() {
        return [

            {
            date: '2026-08-02T00:00:00.000Z',
            titleKey: 'notes.hello.title',
            contentKey: 'notes.hello.content',
            title: 'hello starlit world',
            content: this.cleanContent(`
            i am a scholar always creating the sublime

            in the next years, as i continue to grow
            my career, home, family, and all my dreams

            i'll be talking about good books, films, music, art
            and all the beauties of this life; with you, in here

            i'll be registering our journey on the weekends,
            starting at some point, this fall

            (for now, enjoy my carefully curated little playlists)
                `)
            },

    ];
}

    /**
     * End of default entries; add new entries above.
     */
    cleanContent(content) {
        if (!content) return '';
        const lines = content.split('\n');
        while (lines.length > 0 && lines[0].trim() === '') {
            lines.shift();
        }
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
            lines.pop();
        }
        
        let minIndent = Infinity;
        for (const line of lines) {
            if (line.trim() === '') continue;
            const indent = line.match(/^\s*/)[0].length;
            if (indent < minIndent) {
                minIndent = indent;
            }
        }

        const cleanedLines = lines.map(line => {
            if (line.trim() === '') return '';
            return line.substring(minIndent);
        });
        
        return cleanedLines
            .join('\n')
            .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
            .trim();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    formatDate(date) {
        if (!date) return '';

        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[d.getDay()];
        let day = dayName;
        if (window.I18n) {
            const translated = window.I18n.t(`notes.weekday.${dayName}`);
            if (translated && translated !== `notes.weekday.${dayName}`) {
                day = translated;
            }
        }

        return `${d.getFullYear()}; ${d.getMonth() + 1}; ${d.getDate()}; ${day}`;
    }
}

window.NotesStorage = NotesStorage;

