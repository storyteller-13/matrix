/**
 * TodoApp tests – init, render, add/toggle/delete, badge, escapeHtml
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

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

const todoDom = () => `
    <div id="todo-window" class="window" style="display: none;">
        <div class="window-header"></div>
        <div id="todo-list" class="todo-list"></div>
        <div id="todo-footer" class="todo-footer"></div>
        <span id="todo-count" class="todo-count"></span>
        <span id="todo-count-badge" class="todo-count-badge" style="display: none;"></span>
        <span id="todo-menu-count" class="todo-menu-count" style="display: none;"></span>
    </div>
    <div id="todo-dock-item" class="dock-item"></div>
`;

describe('TodoApp', () => {
    beforeAll(async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        await import('../core/base-app.js');
        await import('../applications/todo/todo-storage.js');
        await import('../applications/todo/todo.js');
    });

    beforeEach(() => {
        document.body.innerHTML = todoDom();
        localStorage.clear();
    });

    it('exposes TodoAppClass and TodoApp on window', () => {
        expect(window.TodoAppClass).toBeDefined();
        expect(window.TodoApp).toBeDefined();
        expect(typeof window.openTodoWindow).toBe('function');
    });

    it('init() caches elements and loads todos', () => {
        const app = new window.TodoAppClass();
        expect(app.window).toBe(document.getElementById('todo-window'));
        expect(app.dockItem).toBe(document.getElementById('todo-dock-item'));
        expect(app.elements.todoList).toBe(document.getElementById('todo-list'));
        expect(Array.isArray(app.todos)).toBe(true);
    });

    it('getActiveCount returns count of non-completed todos', () => {
        const app = new window.TodoAppClass();
        app.todos = [
            { id: '1', text: 'a', completed: false },
            { id: '2', text: 'b', completed: true },
        ];
        expect(app.getActiveCount()).toBe(1);
    });

    it('addTodo adds item and persists', () => {
        const app = new window.TodoAppClass();
        app.addTodo('  new task  ');
        expect(app.todos.length).toBeGreaterThan(0);
        expect(app.todos.some(t => t.text === 'new task')).toBe(true);
    });

    it('addTodo ignores empty string', () => {
        const app = new window.TodoAppClass();
        const len = app.todos.length;
        app.addTodo('   ');
        expect(app.todos.length).toBe(len);
    });

    it('toggleTodo flips completed', () => {
        const app = new window.TodoAppClass();
        app.todos = [{ id: '1', text: 'x', completed: false, createdAt: new Date().toISOString() }];
        app.toggleTodo('1');
        expect(app.todos[0].completed).toBe(true);
    });

    it('toggleTodo no-op for unknown id', () => {
        const app = new window.TodoAppClass();
        app.todos = [{ id: '1', text: 'x', completed: false, createdAt: new Date().toISOString() }];
        app.toggleTodo('unknown');
        expect(app.todos[0].completed).toBe(false);
    });

    it('deleteTodo removes item', () => {
        const app = new window.TodoAppClass();
        app.todos = [
            { id: '1', text: 'a', completed: false, createdAt: new Date().toISOString() },
            { id: '2', text: 'b', completed: false, createdAt: new Date().toISOString() },
        ];
        app.deleteTodo('1');
        expect(app.todos.length).toBe(1);
        expect(app.todos[0].id).toBe('2');
    });

    it('render() shows empty state when no todos', () => {
        const app = new window.TodoAppClass();
        app.todos = [];
        app.render();
        expect(app.elements.todoList.innerHTML).toContain('todo-empty');
    });

    it('render() shows list when todos exist', () => {
        const app = new window.TodoAppClass();
        app.todos = [{ id: '1', text: 'task', completed: false, createdAt: new Date().toISOString() }];
        app.render();
        expect(app.elements.todoList.innerHTML).toContain('task');
        expect(app.elements.todoList.innerHTML).toContain('data-todo-id="1"');
    });

    it('updateBadge shows count and visibility', () => {
        const app = new window.TodoAppClass();
        app.todos = [
            { id: '1', text: 'a', completed: false, createdAt: new Date().toISOString() },
            { id: '2', text: 'b', completed: false, createdAt: new Date().toISOString() },
        ];
        app.updateBadge();
        expect(app.elements.badge.textContent).toBe('2');
        expect(app.elements.badge.style.display).toBe('flex');
    });

    it('escapeHtml escapes special characters', () => {
        const app = new window.TodoAppClass();
        expect(app.escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('open() calls super.open and render', () => {
        const app = new window.TodoAppClass();
        const openSpy = vi.spyOn(window.BaseApp.prototype, 'open').mockImplementation(() => {});
        const renderSpy = vi.spyOn(app, 'render').mockImplementation(() => {});
        app.open();
        expect(openSpy).toHaveBeenCalled();
        expect(renderSpy).toHaveBeenCalled();
    });

    it('click on todo-checkbox toggles todo', () => {
        const app = new window.TodoAppClass();
        app.todos = [{ id: 't1', text: 'x', completed: false, createdAt: new Date().toISOString() }];
        app.render();
        const checkbox = app.elements.todoList.querySelector('.todo-checkbox[data-todo-id="t1"]');
        checkbox.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(app.todos[0].completed).toBe(true);
    });

    it('click on todo-delete-btn deletes todo', () => {
        const app = new window.TodoAppClass();
        app.todos = [
            { id: 't1', text: 'a', completed: false, createdAt: new Date().toISOString() },
            { id: 't2', text: 'b', completed: false, createdAt: new Date().toISOString() },
        ];
        app.render();
        const btn = app.elements.todoList.querySelector('.todo-delete-btn[data-todo-id="t1"]');
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(app.todos.length).toBe(1);
        expect(app.todos[0].id).toBe('t2');
    });

    it('refresh() re-renders and updates badge', () => {
        const app = new window.TodoAppClass();
        const renderSpy = vi.spyOn(app, 'render').mockImplementation(() => {});
        const badgeSpy = vi.spyOn(app, 'updateBadge').mockImplementation(() => {});
        app.refresh();
        expect(renderSpy).toHaveBeenCalled();
        expect(badgeSpy).toHaveBeenCalled();
    });

    it('visibilitychange to visible calls refresh', () => {
        const app = new window.TodoAppClass();
        const refreshSpy = vi.spyOn(app, 'refresh').mockImplementation(() => {});
        Object.defineProperty(document, 'hidden', { value: false, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
        expect(refreshSpy).toHaveBeenCalled();
    });

    it('openTodoWindow opens TodoApp when present', () => {
        document.body.innerHTML = todoDom();
        const app = new window.TodoAppClass();
        window.TodoApp = app;
        const openSpy = vi.spyOn(app, 'open').mockImplementation(() => {});
        window.openTodoWindow();
        expect(openSpy).toHaveBeenCalled();
    });
});
