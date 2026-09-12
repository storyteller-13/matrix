/**
 * App modules register DOMContentLoaded when the document is still loading.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';

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

describe('DOMContentLoaded initialization', () => {
    beforeAll(async () => {
        Object.defineProperty(document, 'readyState', {
            configurable: true,
            get: () => 'loading',
        });
        vi.stubGlobal('localStorage', makeFakeStorage());
        vi.stubGlobal('YT', {
            Player: function FakePlayer() {
                this.playVideo = () => {};
                this.pauseVideo = () => {};
                this.loadVideoById = () => {};
                this.cueVideoById = () => {};
                this.getPlayerState = () => -1;
            },
            PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
        });
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });
        window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });

        document.body.innerHTML = `
            <div class="clock"></div>
            <button id="locale-toggle" class="locale-toggle"></button>
            <div class="window" id="about-window"><div class="about-name"></div></div>
            <div id="about-dock-item" class="dock-item"></div>
            <div class="window" id="home-window"></div>
            <div id="home-dock-item" class="dock-item"></div>
            <div id="quotes-box"><button id="quotes-box-close"></button><div id="quotes-quote-container"></div></div>
            <div class="window" id="artwork-window"><div class="file-list"></div></div>
            <div id="artwork-dock-item" class="dock-item"></div>
            <div id="chess-box"><div id="chess-board-wrap"></div><div id="chess-puzzle-content"></div></div>
            <div id="sky-box"><ul id="sky-planet-list"></ul></div>
            <div class="window" id="todo-window"><div id="todo-list"></div></div>
            <div id="todo-dock-item" class="dock-item"></div>
            <div class="window" id="notes-window"><div id="notes-entries-list"></div></div>
            <div id="notes-dock-item" class="dock-item"></div>
            <div class="window" id="terminal-window"><input id="terminal-input-main" /></div>
            <div id="terminal-dock-item" class="dock-item"></div>
            <div id="apod-box"><div id="apod-box-image-container"></div></div>
            <div id="bird-box"><div id="bird-box-image-container"></div></div>
            <div id="music-player"><div id="music-song-list"></div><div id="music-youtube"></div></div>
            <div class="window" id="notes-letter-window"><div class="window-header"></div></div>
        `;

        await import('../applications/quotes/quotes-data.js');
        await import('../core/base-app.js');
        await import('../core/env.js');
        await import('../core/i18n.js');
        await import('../core/panel.js');
        await import('../core/window-manager.js');
        await import('../applications/about/about.js');
        await import('../applications/home/home.js');
        await import('../applications/quotes/quotes.js');
        await import('../applications/artwork/artwork.js');
        await import('../applications/chess/chess.js');
        await import('../applications/sky/sky.js');
        await import('../applications/todo/todo-storage.js');
        await import('../applications/todo/todo.js');
        await import('../applications/notes/notes-storage.js');
        await import('../applications/notes/notes.js');
        await import('../applications/terminal/terminal-app.js');
        await import('../applications/apod/apod.js');
        await import('../applications/bird/bird.js');
        await import('../applications/music-player/music-player-storage.js');
        await import('../applications/music-player/music-player.js');
        await import('../applications/terminal/terminal.js');
    });

    it('constructs apps when DOMContentLoaded fires', () => {
        expect(window.AboutApp).toBeUndefined();
        expect(window.Panel).toBeUndefined();
        expect(window.WindowManager).toBeUndefined();
        expect(window.BirdPanel).toBeUndefined();
        document.dispatchEvent(new Event('DOMContentLoaded'));
        expect(window.AboutApp).toBeDefined();
        expect(window.HomeApp).toBeDefined();
        expect(window.QuotesPanel).toBeDefined();
        expect(window.ArtworkApp).toBeDefined();
        expect(window.ChessPanel).toBeDefined();
        expect(window.SkyPanel).toBeDefined();
        expect(window.TodoApp).toBeDefined();
        expect(window.NotesApp).toBeDefined();
        expect(window.TerminalApp).toBeDefined();
        expect(window.APODPanel).toBeDefined();
        expect(window.BirdPanel).toBeDefined();
        expect(window.MusicPlayer).toBeDefined();
        expect(window.I18n).toBeDefined();
        expect(window.Panel).toBeDefined();
        expect(window.WindowManager).toBeDefined();
    });
});
