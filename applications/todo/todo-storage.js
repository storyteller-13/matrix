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
            { text: 'unify the kingdoms, telling the greatest story ever told', completed: false },
            { text: 'find my way back home (again...) and become unomad and happy forever building', completed: false },
            { text: 'fix my princess makeup, outfit, and pose - and look amazing as always', completed: false },
            { text: 'memento mori', completed: true },
            { text: 'focus on what is one of my greatest sources of happiness: my work', completed: true },
            { text: 'be in the present, and find gratitude and fulfillment every single day', completed: true },
            { text: 'become marina v2.0: perfectly unkillable', completed: true },
            { text: 'know that i\'m safe and justice will always be served (do not waste time worrying about things i cannot control)', completed: true }
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
