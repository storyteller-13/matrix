/**
 * TodoStorage tests – load script in jsdom and assert load/save contract
 */
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

function makeFakeStorage() {
    const store = {};
    return {
        getItem(k) { return store[k] ?? null; },
        setItem(k, v) { store[k] = String(v); },
        removeItem(k) { delete store[k]; },
        clear() { for (const k of Object.keys(store)) delete store[k]; },
        get length() { return Object.keys(store).length; },
        key(i) { return Object.keys(store)[i] ?? null; },
    };
}

const TODOS_KEY = 'todos';

describe('TodoStorage', () => {
    beforeAll(async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        await import('../applications/todo/todo-storage.js');
    });

    beforeEach(() => {
        localStorage.removeItem(TODOS_KEY);
    });

    it('defines TodoStorage class with load and save', () => {
        const TodoStorage = window.TodoStorage;
        expect(TodoStorage).toBeDefined();
        expect(typeof TodoStorage.prototype.load).toBe('function');
        expect(typeof TodoStorage.prototype.save).toBe('function');
    });

    it('load() returns an array of todos with expected shape', () => {
        const TodoStorage = window.TodoStorage;
        const storage = new TodoStorage();
        const todos = storage.load();
        expect(Array.isArray(todos)).toBe(true);
        expect(todos.length).toBeGreaterThan(0);
        const first = todos[0];
        expect(first).toHaveProperty('id');
        expect(first).toHaveProperty('text');
        expect(first).toHaveProperty('completed');
        expect(first).toHaveProperty('createdAt');
    });

    it('save() persists and load() returns saved data', () => {
        const TodoStorage = window.TodoStorage;
        const storage = new TodoStorage();
        const todos = storage.load();
        todos[0].text = 'updated';
        storage.save(todos);
        const loaded = storage.load();
        expect(loaded[0].text).toBe('updated');
    });
});
