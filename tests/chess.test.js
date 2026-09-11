/**
 * Chess panel – FEN parsing, board render, fetch fallbacks, and visibility
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const chessDom = () => `
    <div id="chess-box" style="display: none;">
        <button id="chess-box-close"></button>
        <div id="chess-loading"></div>
        <div id="chess-puzzle-content"></div>
        <div id="chess-error"></div>
        <div id="chess-board-wrap"></div>
    </div>
`;

describe('ChessPanel', () => {
    beforeAll(async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'nope', json: async () => ({}) });
        document.body.innerHTML = chessDom();
        await import('../core/env.js');
        await import('../applications/chess/chess.js');
    });

    beforeEach(() => {
        document.body.innerHTML = chessDom();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ fen: START_FEN }),
        });
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('parses FEN into an 8x8 board and ignores unknown characters', () => {
        const panel = new window.ChessPanelClass();
        const board = panel.fenToBoard(START_FEN);
        expect(board).toHaveLength(8);
        expect(board[0][0]).toBe('r');
        expect(board[7][4]).toBe('K');
        expect(panel.fenToBoard('')).toBeNull();
        expect(panel.fenToBoard('8/8')).toBeNull();
        const messy = panel.fenToBoard('8/8/8/8/8/8/8/4x3');
        expect(messy[7].filter(Boolean)).toEqual([]);
    });

    it('renderBoard draws 64 squares', () => {
        const panel = new window.ChessPanelClass();
        const wrap = document.getElementById('chess-board-wrap');
        panel.renderBoard(wrap, START_FEN);
        expect(wrap.querySelectorAll('.cell').length).toBe(64);
        expect(wrap.querySelector('.cell.light').textContent).toBeTruthy();
        panel.renderBoard(wrap, '');
        expect(wrap.querySelectorAll('.cell').length).toBe(64);
    });

    it('extractFen reads fen, nested puzzle, raw string, and PGN', () => {
        const panel = new window.ChessPanelClass();
        expect(panel.extractFen(null)).toBeNull();
        expect(panel.extractFen({ fen: 'abc' })).toBe('abc');
        expect(panel.extractFen({ puzzle: { fen: 'def' } })).toBe('def');
        expect(panel.extractFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w')).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
        expect(panel.extractFen({ pgn: '[FEN "4k3/8/8/8/8/8/8/4K3 w - - 0 1"]' })).toBe('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
        expect(panel.extractFen({ pgn: 'no fen here' })).toBeNull();
        expect(panel.extractFen({ other: true })).toBeNull();
    });

    it('loadPuzzle renders a successful response', async () => {
        const panel = new window.ChessPanelClass();
        await panel.loadPuzzle();
        expect(document.getElementById('chess-board-wrap').querySelectorAll('.cell').length).toBe(64);
        expect(document.getElementById('chess-loading').style.display).toBe('none');
        expect(document.getElementById('chess-error').style.display).toBe('none');
    });

    it('loadPuzzle falls back to the proxy then shows an error', async () => {
        global.fetch = vi.fn()
            .mockRejectedValueOnce(new Error('primary'))
            .mockResolvedValueOnce({ ok: true, json: async () => ({ title: 'no fen' }) });
        const panel = new window.ChessPanelClass();
        await panel.loadPuzzle();
        expect(document.getElementById('chess-error').style.display).toBe('block');
        expect(document.getElementById('chess-puzzle-content').style.display).toBe('none');
    });

    it('loadPuzzle recovers via the allorigins proxy', async () => {
        const panel = new window.ChessPanelClass();
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: false, statusText: 'fail' })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ fen: START_FEN }) });
        await panel.loadPuzzle();
        expect(document.getElementById('chess-board-wrap').querySelectorAll('.cell').length).toBe(64);
        expect(fetch.mock.calls.some((call) => String(call[0]).includes('allorigins'))).toBe(true);
    });

    it('loadPuzzle returns early without wrap or content nodes', async () => {
        document.body.innerHTML = `<div id="chess-box"></div>`;
        const panel = new window.ChessPanelClass();
        await panel.loadPuzzle();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('close button, Escape, and toggle hide and show the box', () => {
        vi.useFakeTimers();
        const panel = new window.ChessPanelClass();
        expect(document.getElementById('chess-box').style.display).toBe('block');
        document.getElementById('chess-box-close').click();
        vi.advanceTimersByTime(400);
        expect(document.getElementById('chess-box').style.display).toBe('none');

        panel.toggleVisibility();
        expect(document.getElementById('chess-box').style.display).toBe('block');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        vi.advanceTimersByTime(400);
        expect(document.getElementById('chess-box').style.display).toBe('none');
        panel.toggleVisibility();
        expect(document.getElementById('chess-box').style.display).toBe('block');
    });

    it('openChessWindow toggles the panel', () => {
        const panel = new window.ChessPanelClass();
        window.ChessPanel = panel;
        const spy = vi.spyOn(panel, 'toggleVisibility');
        window.openChessWindow();
        expect(spy).toHaveBeenCalled();
    });

    it('openChessWindow no-ops when the panel is missing', () => {
        window.ChessPanel = undefined;
        expect(() => window.openChessWindow()).not.toThrow();
    });

    it('uses a centered transform on mobile and stays closed on init', () => {
        window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
        const panel = new window.ChessPanelClass();
        expect(panel.isMobile()).toBe(true);
        expect(panel.shouldAutoOpen()).toBe(false);
        expect(document.getElementById('chess-box').style.display).not.toBe('block');
        panel.showBox();
        expect(document.getElementById('chess-box').style.transform).toContain('translate(-50%, -50%)');
    });

    it('visibility helpers no-op without a box', () => {
        document.body.innerHTML = '';
        const panel = new window.ChessPanelClass();
        expect(() => panel.toggleVisibility()).not.toThrow();
        expect(() => panel.showBox()).not.toThrow();
        expect(() => panel.hideBox()).not.toThrow();
    });

    it('setLoading and setError tolerate missing nodes', () => {
        document.body.innerHTML = '';
        const panel = new window.ChessPanelClass();
        expect(() => panel.setLoading(true)).not.toThrow();
        expect(() => panel.setError()).not.toThrow();
    });

    it('uses the proxy API URL off localhost', () => {
        const orig = window.Env;
        window.Env = { isLocalhost: () => false };
        const panel = new window.ChessPanelClass();
        expect(panel.apiUrl).toBe('/api/chess');
        window.Env = orig;
    });
});
