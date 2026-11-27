/**
 * Entry point: loads every core module and app, in dependency order.
 * Each module registers itself on window (BaseApp, WindowManager, …) and
 * initialises on DOMContentLoaded or immediately if the DOM is ready.
 * Order matters: core before apps, storage/data before the app that reads it.
 */

import './core/actions.js';
import './core/env.js';
import './core/storage.js';
import './core/i18n.js';
import './core/base-app.js';
import './core/timed-cache.js';
import './core/app-catalog.js';
import './core/command-palette.js';
import './core/deep-link.js';
import './core/matrix-theme.js';
import './core/wallpaper-stars.js';
import './core/window-manager.js';
import './core/panel.js';

// Music Player
import './applications/music-player/music-player-storage.js';
import './applications/music-player/music-player.js';

// Todo App
import './applications/todo/todo-storage.js';
import './applications/todo/todo.js';

// Notes App
import './applications/notes/notes-storage.js';
import './applications/notes/notes.js';

// Curated Lists (data first, then the windows)
import './applications/lists/folders/list-entry.js';
import './applications/lists/folders/books.js';
import './applications/lists/folders/movies.js';
import './applications/lists/folders/my-guides.js';
import './applications/lists/folders/adventures.js';
import './applications/lists/folders/games.js';
import './applications/lists/folders/friendships.js';
import './applications/lists/folders/sublime.js';
import './applications/lists/books.js';
import './applications/lists/podcast-player.js';
import './applications/lists/lists-menu.js';
import './applications/lists/lists-folder-data.js';
import './applications/lists/lists-folder.js';

// Quotes Panel (data first, then panel)
import './applications/quotes/quotes-data.js';
import './applications/quotes/quotes.js';

// Bird Panel
import './applications/bird/bird.js';

// APOD Panel
import './applications/apod/apod.js';

// Chess Panel
import './applications/chess/chess.js';

// Sky Panel
import './applications/sky/sky.js';

// Calendar Panel
import './applications/calendar/calendar-events.js';
import './applications/calendar/calendar.js';

// About App
import './applications/about/about.js';

// Home / what i do App
import './applications/home/home.js';

// Building App
import './applications/building/building.js';

// Current Status App
import './applications/status/status.js';

// Artwork App
import './applications/artwork/artwork.js';

// Terminal App
import './applications/terminal/terminal-app.js';
import './applications/terminal/terminal-text.js';
import './applications/terminal/terminal-core.js';
import './applications/terminal/terminal-picture.js';
import './applications/terminal/terminal.js';

// Cache the app shell so it can reopen without a network connection.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch((error) => {
            console.warn('Offline support could not be enabled:', error);
        });
    }, { once: true });
}
