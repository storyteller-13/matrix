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

    it('load() returns an array of todos with expected shape', () => {
        const TodoStorage = window.TodoStorage;
        const storage = new TodoStorage();
        const todos = storage.load();
        expect(Array.isArray(todos)).toBe(true);
        expect(todos.length).toBeGreaterThan(0);
        const first = todos[0];
        expect(first).toHaveProperty('id');
        expect(first).toHaveProperty('completed');
        expect(first).toHaveProperty('createdAt');
    });

    it('load() uses defaults when stored JSON is invalid', () => {
        const storage = new window.TodoStorage();
        localStorage.setItem(TODOS_KEY, '{not json');
        const todos = storage.load();
        expect(todos.length).toBeGreaterThan(0);
    });

    it('load() uses defaults for empty arrays', () => {
        const storage = new window.TodoStorage();
        localStorage.setItem(TODOS_KEY, '[]');
        expect(storage.load().length).toBeGreaterThan(0);
    });

    it('normalizeTodo fills missing fields', () => {
        const storage = new window.TodoStorage();
        const todo = storage.normalizeTodo({});
        expect(todo.id).toBeTruthy();
        expect(todo.text).toBe('');
        expect(todo.completed).toBe(false);
        expect(todo.createdAt).toBeTruthy();
    });

});
