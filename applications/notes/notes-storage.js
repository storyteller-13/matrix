/**
 * Notes Storage Module
 * Handles localStorage persistence for notes entries
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
            createdAt: entry.date || entry.createdAt || new Date().toISOString(),
            updatedAt: entry.updatedAt || null,
            read: entry.read || false,
            italic: entry.italic || false,
            asciiArt: entry.asciiArt || false
        };
    }

    save(entries) {
        if (!Array.isArray(entries)) {
            return;
        }
    }

    getDefaultEntries() {
        return [
            {
            date: '2026-07-02T00:00:00.000Z',
            title: '🦋 hello world 🦋',
            content: this.cleanContent(`
            hello there
            anon friend

            i am marina, a hacker girl
            a scientist and an engineer
            always building the sublime

            in the next years of my life 
            i will be full-time creating
            NULLSTAR GAMES and MY FAMILY

            and registering 
            my journey here

            m
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

        return `${d.getFullYear()}; ${d.getMonth() + 1}; ${d.getDate()}; ${days[d.getDay()]}`;
    }
}

if (typeof window !== 'undefined') {
    window.NotesStorage = NotesStorage;
}

