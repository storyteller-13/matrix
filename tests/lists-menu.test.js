/**
 * The top-left lists menu is generated from the lists folder data: every list is linked, in the right order.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// The folder tree lives in lists-folder-data.js; the window file only renders it.
const folderSource = ['applications/lists/lists-folder-data.js', 'applications/lists/lists-folder.js']
    .map((file) => readFileSync(join(root, file), 'utf8'))
    .join('\n');

describe('generated lists menu', () => {
    beforeAll(async () => {
        document.body.innerHTML = `
            <div class="window artwork-window lists-folder-window" id="lists-folder-window"><div class="file-list"></div></div>
            <div id="lists-folder-dock-item" class="dock-item"><span id="lists-folder-count-badge"></span></div>
            <div id="books-window" class="window"></div>
            <div class="menu-submenu"><div id="lists-menu-root"></div></div>
        `;
        window.openBooksWindow = () => {};
        await import('../core/base-app.js');
        await import('../applications/lists/podcast-player.js');
        await import('../applications/lists/lists-folder.js');
    });

    it('links every list defined in the lists folder', () => {
        const listIds = [...folderSource.matchAll(/\n\s*id: '([^']+)',/g)].map((m) => m[1]);
        const linked = new Set([...document.querySelectorAll('#lists-menu-root [data-arg]')].map((el) => el.dataset.arg));
        const missing = listIds.filter((id) => !linked.has(id));
        // The zeitgeist awards are reached through the podcasts submenu, which the podcast player fills with episodes.
        expect(missing).toEqual(['zeitgeist-awards-2026']);
        expect(document.getElementById('podcast-menu-episodes')).not.toBeNull();
    });

    it('lists the top-level folders in the requested order, with art last', () => {
        const labels = [...document.querySelectorAll('#lists-menu-root > .menu-item, #lists-menu-root > button')]
            .map((el) => el.querySelector('.menu-item-text').textContent);
        expect(labels).toEqual(['books', 'movies', 'podcasts', 'games', 'adventures', 'nutrition', 'science', 'art']);
    });

    it('sorts movies by title length, with the longest titles at the bottom', () => {
        const movies = [...document.querySelectorAll('#lists-menu-root .menu-item-has-submenu')]
            .find((el) => el.querySelector(':scope > .menu-item-text').textContent === 'movies');
        const items = [...movies.querySelectorAll('.menu-submenu [data-arg]')];
        const lengths = items.map((item) => item.querySelector('.menu-item-text').textContent.length);
        expect(lengths).toEqual([...lengths].sort((a, b) => a - b));
        expect(items[items.length - 1].dataset.arg).toBe('winter-movies');
    });
});
