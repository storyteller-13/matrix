/**
 * Entry point: loads every core module and app, in dependency order.
 * Each module registers itself on window (BaseApp, WindowManager, …) and
 * initialises on DOMContentLoaded or immediately if the DOM is ready.
 * Order matters: core before apps, storage/data before the app that reads it.
 */

import './core/actions.js';
import './core/env.js';
import './core/i18n.js';
import './core/base-app.js';
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
import './applications/lists/books-data.js';
import './applications/lists/movies-data.js';
import './applications/lists/guides-data.js';
import './applications/lists/adventures-data.js';
import './applications/lists/games-data.js';
import './applications/lists/books.js';
import './applications/lists/podcast-player.js';
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
import './applications/terminal/terminal.js';
