/**
 * Todo Storage Module
 * Supplies the fixed todo list. Todos are never saved.
 */
import { removeStorage } from '../../core/storage.js';

class TodoStorage {
    constructor() {
        // Legacy key from earlier builds, cleared on load so old saved tasks never come back.
        this.legacyStorageKey = 'todos';
    }

    /**
     * The todo list is fixed content: it is never saved and never read back from storage.
     * Returns frozen items, so the list cannot be changed at runtime.
     */
    load() {
        // Blocked storage has nothing to clear.
        removeStorage(this.legacyStorageKey);
        return this.getDefaultTodos();
    }

    getDefaultTodos() {
        const defaultTodoData = [
            { textKey: 'todo.item.dreams', completed: false },
            { textKey: 'todo.item.peace', completed: false },
            { textKey: 'todo.item.people', completed: false },
            { textKey: 'todo.item.love', completed: false },
        ];
        return Object.freeze(defaultTodoData.map(data => this.createTodo(data.completed, data.textKey)));
    }

    createTodo(completed = false, textKey) {
        return Object.freeze({
            id: this.generateId(),
            textKey: textKey || undefined,
            completed,
            createdAt: new Date().toISOString()
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }
}

window.TodoStorage = TodoStorage;
