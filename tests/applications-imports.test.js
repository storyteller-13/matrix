/**
 * Import application data/entry modules so they are executed and included in coverage.
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

describe('Application modules (coverage)', () => {
    beforeAll(async () => {
        document.body.innerHTML = '<div id="app"></div>';
    });

    it('email-data loads and exposes EmailData', async () => {
        await import('../applications/email/email-data.js');
        expect(window.EmailData).toBeDefined();
        const data = new window.EmailData();
        expect(data.data).toBeDefined();
        expect(data.data.inbox).toEqual([]);
    });

    it('quotes-data loads and exposes QUOTES', async () => {
        await import('../applications/quotes/quotes-data.js');
        expect(window.QUOTES).toBeDefined();
        expect(Array.isArray(window.QUOTES)).toBe(true);
        expect(window.QUOTES.length).toBeGreaterThan(0);
        expect(window.QUOTES[0]).toHaveProperty('text');
        expect(window.QUOTES[0]).toHaveProperty('author');
    });

    it('home loads and exposes HomeAppClass and openHomeWindow', async () => {
        document.body.innerHTML = `
            <div id="home-window" class="window"></div>
            <div id="home-dock-item" class="dock-item"></div>
        `;
        await import('../core/base-app.js');
        await import('../applications/home/home.js');
        expect(window.HomeAppClass).toBeDefined();
        expect(window.HomeApp).toBeDefined();
        expect(typeof window.openHomeWindow).toBe('function');
    });

    it('quotes.js loads and exposes QuotesPanel and openQuotesWindow', async () => {
        document.body.innerHTML = `
            <div id="quotes-box"></div>
            <button id="quotes-box-close"></button>
            <div id="quotes-quote-container"></div>
            <div id="quotes-quote-author"></div>
        `;
        if (!window.matchMedia) {
            window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
        }
        await import('../applications/quotes/quotes-data.js');
        await import('../applications/quotes/quotes.js');
        expect(window.QuotesPanel).toBeDefined();
        expect(typeof window.openQuotesWindow).toBe('function');
        expect(window.QuotesPanel.getRandomQuote()).toHaveProperty('text');
    });

    it('notes.js loads and exposes NotesAppClass and openNotesWindow', async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        document.body.innerHTML = `
            <div id="notes-window" class="window"><div id="notes-entries-list"></div><div id="notes-footer"></div><span id="notes-count"></span><span id="notes-count-badge"></span><span id="notes-menu-count"></span></div>
            <div id="notes-dock-item" class="dock-item"></div>
        `;
        await import('../core/base-app.js');
        await import('../applications/notes/notes-storage.js');
        await import('../applications/notes/notes.js');
        expect(window.NotesAppClass).toBeDefined();
        expect(window.NotesApp).toBeDefined();
        expect(typeof window.openNotesWindow).toBe('function');
        expect(typeof window.addNotesEntry).toBe('function');
    });

    it('email.js loads and exposes EmailAppClass and openEmailWindow', async () => {
        document.body.innerHTML = `
            <div id="email-window" class="window">
                <div id="email-list"></div><div id="email-view"><div id="email-view-content"></div></div>
                <span id="email-count-badge"></span>
                <button id="back-to-list"></button>
                <div class="email-folder" data-folder="inbox"></div>
                <div class="email-toolbar"><button class="email-btn" data-folder="inbox"></button></div>
            </div>
            <div id="email-dock-item" class="dock-item"></div>
        `;
        await import('../core/base-app.js');
        await import('../applications/email/email-data.js');
        await import('../applications/email/email.js');
        expect(window.EmailAppClass).toBeDefined();
        expect(window.EmailApp).toBeDefined();
        expect(typeof window.openEmailWindow).toBe('function');
    });

    it('apod.js loads and exposes APODPanelClass and buildApiUrl', async () => {
        document.body.innerHTML = `
            <div id="apod-box"><div id="apod-box-image-container"></div><button id="apod-box-close"></button></div>
            <div id="apod-popup"><button id="apod-close"></button></div>
        `;
        global.fetch = vi.fn().mockResolvedValue({ ok: false });
        await import('../core/env.js');
        await import('../applications/apod/apod.js');
        expect(window.APODPanelClass).toBeDefined();
        const panel = new window.APODPanelClass();
        expect(panel.buildApiUrl('2024-01-15')).toContain('date=2024-01-15');
        expect(typeof window.openApodWindow).toBe('function');
    });

    it('chess.js loads and exposes ChessPanel and openChessWindow', async () => {
        document.body.innerHTML = `
            <div id="chess-box"><button id="chess-box-close"></button><div id="chess-loading"></div><div id="chess-puzzle-content"></div><div id="chess-error"></div><div id="chess-board-wrap"></div></div>
        `;
        global.fetch = vi.fn().mockResolvedValue({ ok: false });
        await import('../core/env.js');
        await import('../applications/chess/chess.js');
        expect(window.ChessPanel).toBeDefined();
        expect(typeof window.openChessWindow).toBe('function');
    });

    it('artwork.js loads and exposes ArtworkAppClass and openArtworkWindow', async () => {
        document.body.innerHTML = `
            <div id="artwork-window" class="window"><div class="file-list"></div></div>
            <div id="artwork-dock-item" class="dock-item"></div>
            <span id="artwork-count-badge"></span><span id="artwork-menu-count"></span>
        `;
        await import('../core/base-app.js');
        await import('../applications/artwork/artwork.js');
        expect(window.ArtworkAppClass).toBeDefined();
        expect(window.ArtworkApp).toBeDefined();
        expect(typeof window.openArtworkWindow).toBe('function');
    });
});
