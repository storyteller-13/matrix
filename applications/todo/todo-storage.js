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
        const text = t.text || '';
        return {
            id: t.id || this.generateId(),
            text,
            textKey: t.textKey || this.textKeyFor(text) || undefined,
            completed: Boolean(t.completed),
            createdAt: t.createdAt || new Date().toISOString()
        };
    }

    getDefaultTodos() {
        const defaultTodoData = [
            { textKey: 'todo.item.dreams', text: 'never give up on my dreams', completed: false },
            { textKey: 'todo.item.peace', text: 'be happy, free, and at peace', completed: false },
            { textKey: 'todo.item.people', text: 'live a good life with good people', completed: false }
        ];
        return defaultTodoData.map(data => this.createTodo(data.text, data.completed, data.textKey));
    }

    textKeyFor(text) {
        const keys = {
            'never give up on my dreams': 'todo.item.dreams',
            'be happy, free, and at peace': 'todo.item.peace',
            'live a good life with good people': 'todo.item.people',
        };
        return keys[text] || null;
    }

    createTodo(text, completed = false, textKey = null) {
        return {
            id: this.generateId(),
            text,
            textKey: textKey || this.textKeyFor(text) || undefined,
            completed,
            createdAt: new Date().toISOString()
        };
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }
}

window.TodoStorage = TodoStorage;
