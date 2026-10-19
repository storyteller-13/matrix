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
    
    normalizeTodo(t) {
        return {
            id: t.id || this.generateId(),
            textKey: t.textKey || undefined,
            completed: Boolean(t.completed),
            createdAt: t.createdAt || new Date().toISOString()
        };
    }

    getDefaultTodos() {
        const defaultTodoData = [
            { textKey: 'todo.item.halloween', completed: false },
            { textKey: 'todo.item.home', completed: false},
            { textKey: 'todo.item.dreams', completed: false },
            { textKey: 'todo.item.peace', completed: false },
            { textKey: 'todo.item.people', completed: false },
            { textKey: 'todo.item.love', completed: false },
        ];
        return defaultTodoData.map(data => this.createTodo(data.completed, data.textKey));
    }

    createTodo(completed = false, textKey) {
        return {
            id: this.generateId(),
            textKey: textKey || undefined,
            completed,
            createdAt: new Date().toISOString()
        };
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }
}

window.TodoStorage = TodoStorage;
