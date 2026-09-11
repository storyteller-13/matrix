/**
 * TodoApp tests – init, render, toggle, badge, escapeHtml
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
        window.I18n = undefined;
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
        expect(app.window.style.display).toBe('none');
    });

    it('getActiveCount returns count of non-completed todos', () => {
        const app = new window.TodoAppClass();
        app.todos = [
            { id: '1', text: 'a', completed: false },
            { id: '2', text: 'b', completed: true },
        ];
        expect(app.getActiveCount()).toBe(1);
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

    it('openTodoWindow no-ops when TodoApp is missing', () => {
        window.TodoApp = undefined;
        expect(() => window.openTodoWindow()).not.toThrow();
    });

    it('init returns early when the window is missing', () => {
        document.body.innerHTML = '';
        const app = new window.TodoAppClass();
        expect(app.window).toBeNull();
    });

    it('todo list click ignores targets without a todo id', () => {
        const app = new window.TodoAppClass();
        app.todos = [{ id: 't1', text: 'x', completed: false, createdAt: new Date().toISOString() }];
        app.render();
        app.elements.todoList.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(app.todos[0].completed).toBe(false);
    });

    it('visibilitychange while hidden does not refresh', () => {
        const app = new window.TodoAppClass();
        const refreshSpy = vi.spyOn(app, 'refresh').mockImplementation(() => {});
        Object.defineProperty(document, 'hidden', { value: true, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
        expect(refreshSpy).not.toHaveBeenCalled();
    });

    it('render returns early without a list and hides the footer when empty', () => {
        const app = new window.TodoAppClass();
        app.elements.todoList = null;
        expect(() => app.render()).not.toThrow();
        app.elements.todoList = document.getElementById('todo-list');
        app.todos = [];
        app.render();
        expect(app.elements.todoFooter.style.display).toBe('none');
    });

    it('updateBadge uses 99+ and skips missing nodes', () => {
        const app = new window.TodoAppClass();
        app.todos = Array.from({ length: 120 }, (_, i) => ({
            id: String(i), text: 'x', completed: false, createdAt: new Date().toISOString(),
        }));
        app.updateBadge();
        expect(app.elements.badge.textContent).toBe('99+');
        app.elements.badge = null;
        app.elements.menuCount = null;
        expect(() => app.updateBadge()).not.toThrow();
    });

    it('render uses singular item copy and completed styles', () => {
        const app = new window.TodoAppClass();
        app.todos = [{ id: '1', text: 'only', completed: true, createdAt: new Date().toISOString() }];
        app.render();
        expect(app.elements.todoCount.textContent).toBe('0 items left');
        app.todos = [{ id: '1', text: 'only', completed: false, createdAt: new Date().toISOString() }];
        app.render();
        expect(app.elements.todoCount.textContent).toBe('1 item left');
        expect(app.elements.todoList.innerHTML).toContain('todo-item');
    });

    it('setupEventListeners skips a missing todo list', () => {
        document.body.innerHTML = `
            <div id="todo-window" class="window"></div>
            <div id="todo-dock-item" class="dock-item"></div>
        `;
        expect(() => new window.TodoAppClass()).not.toThrow();
    });

    it('uses I18n copy and re-renders on localechange', () => {
        window.I18n = {
            t(key, vars = {}) {
                if (key === 'todo.empty') return 'まだタスクがないよ';
                if (key === 'todo.itemLeft' || key === 'todo.itemsLeft') return `のこり${vars.count}こ`;
                if (key === 'todo.item.dreams') return 'ゆめを、ぜったにあきらめない';
                return key;
            },
        };
        const app = new window.TodoAppClass();
        app.todos = [];
        app.render();
        expect(app.elements.todoList.innerHTML).toContain('まだタスクがないよ');
        app.todos = [{ id: '1', text: 'x', completed: false, createdAt: new Date().toISOString() }];
        document.dispatchEvent(new CustomEvent('localechange'));
        expect(app.elements.todoCount.textContent).toBe('のこり1こ');
    });

    it('renders translated default todo items', () => {
        window.I18n = {
            t(key) {
                if (key === 'todo.item.dreams') return 'ゆめを、ぜったにあきらめない';
                if (key === 'todo.item.peace') return 'しあわせで、じゆうで、やすらかでいる';
                if (key === 'todo.item.people') return 'いいひとたちと、いいじんせいをおくる';
                if (key === 'todo.itemLeft' || key === 'todo.itemsLeft') return 'count';
                return key;
            },
        };
        const app = new window.TodoAppClass();
        expect(app.elements.todoList.innerHTML).toContain('ゆめを、ぜったにあきらめない');
        expect(app.elements.todoList.innerHTML).toContain('しあわせで、じゆうで、やすらかでいる');
        expect(app.elements.todoList.innerHTML).toContain('いいひとたちと、いいじんせいをおくる');
        window.I18n = undefined;
        document.dispatchEvent(new CustomEvent('localechange'));
        expect(app.elements.todoList.innerHTML).toContain('never give up on my dreams');
    });

    it('todoLabel falls back to stored text when translation is missing', () => {
        const app = new window.TodoAppClass();
        expect(app.todoLabel({ text: 'plain' })).toBe('plain');
        window.I18n = {
            t(key) {
                if (key === 'todo.item.peace') return '';
                return key;
            },
        };
        expect(app.todoLabel({ text: 'plain', textKey: 'missing.key' })).toBe('plain');
        expect(app.todoLabel({ text: 'plain', textKey: 'todo.item.peace' })).toBe('plain');
        app.todos = [
            { id: '1', text: 'a', completed: false, createdAt: new Date().toISOString() },
            { id: '2', text: 'b', completed: false, createdAt: new Date().toISOString() },
        ];
        window.I18n.t = (key, vars = {}) => {
            if (key === 'todo.itemsLeft') return `のこり${vars.count}こ`;
            return key;
        };
        app.render();
        expect(app.elements.todoCount.textContent).toBe('のこり2こ');
    });
});
