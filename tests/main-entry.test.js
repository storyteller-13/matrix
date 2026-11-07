/**
 * main.js – the single module entry must import every runtime file, once, and only files that exist.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imports = [...readFileSync(join(root, 'main.js'), 'utf8').matchAll(/^import '\.\/(.+)';$/gm)].map((m) => m[1]);

// Loaded separately: a classic <head> script that must run before first paint.
const NOT_IN_ENTRY = new Set(['core/locale-boot.js']);

describe('main.js', () => {
    it('imports only files that exist, each once', () => {
        expect(imports.length).toBeGreaterThan(20);
        expect(new Set(imports).size).toBe(imports.length);
        for (const file of imports) expect(existsSync(join(root, file)), file).toBe(true);
    });

    it('imports every core and application module', () => {
        const all = ['core', 'applications'].flatMap((dir) =>
            readdirSync(join(root, dir), { recursive: true })
                .filter((f) => f.endsWith('.js'))
                .map((f) => `${dir}/${f}`));
        const missing = all.filter((f) => !NOT_IN_ENTRY.has(f) && !imports.includes(f));
        expect(missing).toEqual([]);
    });

    it('loads base classes and storage before the code that extends or reads them', () => {
        const before = (a, b) => expect(imports.indexOf(a), `${a} before ${b}`).toBeLessThan(imports.indexOf(b));
        for (const app of imports.filter((f) => f.startsWith('applications/'))) {
            before('core/base-app.js', app);
            before('core/window-manager.js', app);
        }
        before('applications/todo/todo-storage.js', 'applications/todo/todo.js');
        before('applications/notes/notes-storage.js', 'applications/notes/notes.js');
        before('applications/music-player/music-player-storage.js', 'applications/music-player/music-player.js');
        before('applications/lists/books-data.js', 'applications/lists/books.js');
        before('applications/lists/guides-data.js', 'applications/lists/books.js');
        before('applications/lists/adventures-data.js', 'applications/lists/books.js');
        before('applications/quotes/quotes-data.js', 'applications/quotes/quotes.js');
    });
});
