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

    it('save() ignores non-arrays and storage errors', () => {
        const storage = new window.TodoStorage();
        expect(() => storage.save(null)).not.toThrow();
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
            throw new Error('quota');
        });
        expect(() => storage.save([{ id: '1', text: 'x', completed: false }])).not.toThrow();
        vi.restoreAllMocks();
    });

    it('normalizeTodo fills missing fields', () => {
        const storage = new window.TodoStorage();
        const todo = storage.normalizeTodo({});
        expect(todo.id).toBeTruthy();
        expect(todo.text).toBe('');
        expect(todo.completed).toBe(false);
        expect(todo.createdAt).toBeTruthy();
    });

    it('createTodo defaults completed to false', () => {
        const storage = new window.TodoStorage();
        expect(storage.createTodo('x').completed).toBe(false);
        expect(storage.createTodo('y', true).completed).toBe(true);
    });

    it('default todos keep translation keys, including after a save', () => {
        const storage = new window.TodoStorage();
        const todos = storage.load();
        expect(todos.map((t) => t.textKey)).toEqual([
            'todo.item.dreams',
            'todo.item.peace',
            'todo.item.people',
        ]);
        storage.save(todos);
        expect(storage.load()[0].textKey).toBe('todo.item.dreams');
        expect(storage.normalizeTodo({ text: 'be happy, free, and at peace' }).textKey).toBe('todo.item.peace');
        expect(storage.textKeyFor('unknown task')).toBeNull();
        expect(storage.createTodo('custom task').textKey).toBeUndefined();
        expect(storage.createTodo('x', false, 'todo.item.dreams').textKey).toBe('todo.item.dreams');
    });
});
