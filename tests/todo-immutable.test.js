/**
 * The todo list is fixed content: saved todos are ignored, nothing is written, and items are frozen.
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

describe('todo list is never saved', () => {
    beforeAll(async () => {
        await import('../applications/todo/todo-storage.js');
    });

    beforeEach(() => {
        localStorage.clear();
    });

    it('ignores previously saved todos and clears the legacy key', () => {
        localStorage.setItem('todos', JSON.stringify([{ id: 'x', text: 'saved task', completed: true }]));
        const items = new window.TodoStorage().load();
        expect(items).toHaveLength(4);
        expect(items.some((item) => item.text === 'saved task')).toBe(false);
        expect(localStorage.getItem('todos')).toBeNull();
    });

    it('never writes to storage', () => {
        const setItem = vi.spyOn(Storage.prototype, 'setItem');
        new window.TodoStorage().load();
        expect(setItem).not.toHaveBeenCalled();
        setItem.mockRestore();
    });

    it('returns frozen items so the list cannot change at runtime', () => {
        const items = new window.TodoStorage().load();
        expect(Object.isFrozen(items)).toBe(true);
        expect(Object.isFrozen(items[0])).toBe(true);
        expect(() => { items[0].completed = true; }).toThrow();
    });
});
