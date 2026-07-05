/**
 * Todo Storage Module
 * Handles localStorage persistence for todos
 */
class TodoStorage {
    constructor() {
        this.storageKey = 'todos';
    }

    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map(t => this.normalizeTodo(t));
                }
            }
        } catch (_) {
            // invalid or missing: use defaults
        }
        return this.getDefaultTodos();
    }

    save(todos) {
        if (!Array.isArray(todos)) return;
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(todos));
        } catch (_) {
            // quota or disabled
        }
    }

    normalizeTodo(t) {
        return {
            id: t.id || this.generateId(),
            text: t.text || '',
            completed: Boolean(t.completed),
            createdAt: t.createdAt || new Date().toISOString()
        };
    }

    getDefaultTodos() {
        const defaultTodoData = [
            { text: 'love my so handsome soulmate forever', completed: false },
            { text: 'build my perfect and sublime home', completed: false },
            { text: 'grow my cute and so loved family', completed: false },
            { text: 'have a lot of fun creating NULLSTAR ', completed: false },
            { text: 'tell the great story of LOGIC 13', completed: false },
            { text: 'nourish a community of good friends', completed: false },
            { text: 'travel the entire world with my family', completed: false },
            { text: 'play the piano and chess every morning', completed: false },
            { text: 'feel grateful for my life every single day', completed: true },
        ];
        return defaultTodoData.map(data => this.createTodo(data.text, data.completed));
    }

    createTodo(text, completed = false) {
        return {
            id: this.generateId(),
            text,
            completed,
            createdAt: new Date().toISOString()
        };
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }
}

// Expose class for testing
if (typeof window !== 'undefined') {
    window.TodoStorage = TodoStorage;
}
