/**
 * Matrix theme: the class on <html>, the rain canvas, reduced motion, and clean-up when turned off.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isMatrixTheme, setMatrixTheme, toggleMatrixTheme } from '../core/matrix-theme.js';

const createCanvasContext = () => ({
    fillRect: vi.fn(), strokeRect: vi.fn(), clearRect: vi.fn(), fillText: vi.fn(), drawImage: vi.fn(),
    beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), save: vi.fn(), restore: vi.fn(),
    fill: vi.fn(), clip: vi.fn(), closePath: vi.fn(), ellipse: vi.fn(), arc: vi.fn(), quadraticCurveTo: vi.fn(),
    fillStyle: '', strokeStyle: '', font: '',
});

describe('matrix theme', () => {
    beforeEach(() => {
        document.documentElement.className = '';
        document.body.innerHTML = '';
    });

    afterEach(() => {
        setMatrixTheme(false);
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('toggles the class on the page root and back', () => {
        expect(isMatrixTheme()).toBe(false);
        expect(toggleMatrixTheme()).toBe(true);
        expect(document.documentElement.classList.contains('matrix-theme')).toBe(true);
        expect(toggleMatrixTheme()).toBe(false);
        expect(document.documentElement.classList.contains('matrix-theme')).toBe(false);
    });

    it('shows a door and a question in the tab in matrix mode, and the normal icon and title come back', () => {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.setAttribute('href', 'assets/favicon.svg');
        document.head.appendChild(link);
        const originalTitle = document.title;
        setMatrixTheme(true);
        expect(link.getAttribute('href')).toBe('assets/favicon-matrix.svg');
        expect(document.title).toBe('will you enter it?');
        setMatrixTheme(false);
        expect(link.getAttribute('href')).toBe('assets/favicon.svg');
        expect(document.title).toBe(originalTitle);
        link.remove();
    });

    it('setting the current state again changes nothing', () => {
        setMatrixTheme(true);
        expect(setMatrixTheme(true)).toBe(true);
        expect(document.querySelectorAll('#matrix-rain').length).toBeLessThanOrEqual(1);
    });

    it('removes the rain canvas and stops animating when the theme is turned off', () => {
        const cancel = vi.fn();
        vi.stubGlobal('requestAnimationFrame', vi.fn(() => 7));
        vi.stubGlobal('cancelAnimationFrame', cancel);
        // jsdom has no 2D canvas, so the rain itself is skipped; the canvas is removed again either way.
        setMatrixTheme(true);
        setMatrixTheme(false);
        expect(document.getElementById('matrix-rain')).toBeNull();
        expect(isMatrixTheme()).toBe(false);
    });

    it('today\'s panels stay hidden in matrix mode until their icon opens them, and the close button hides them again', () => {
        document.body.innerHTML = `
            <div class="sky-box" id="sky-box"><div class="sky-box-content"><div class="sky-box-header"><button class="sky-box-close">x</button></div></div></div>
            <button type="button" data-action="openSkyWindow" id="sky-tray">sky</button>
        `;
        const sky = document.getElementById('sky-box');
        setMatrixTheme(true);
        expect(sky.classList.contains('matrix-open')).toBe(false);

        document.getElementById('sky-tray').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(sky.classList.contains('matrix-open')).toBe(true);

        sky.querySelector('.sky-box-close').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(sky.classList.contains('matrix-open')).toBe(false);

        document.getElementById('sky-tray').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        setMatrixTheme(false);
        expect(sky.classList.contains('matrix-open')).toBe(false);
    });

    it('the mixtape is hidden in matrix mode until its menu item opens it', () => {
        document.body.innerHTML = `
            <div class="music-player" id="music-player"><button class="music-close">x</button></div>
            <button type="button" data-action="openSoundtrack" data-arg="2026" id="mix-item">mix</button>
        `;
        const player = document.getElementById('music-player');
        setMatrixTheme(true);
        expect(player.classList.contains('matrix-open')).toBe(false);
        document.getElementById('mix-item').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(player.classList.contains('matrix-open')).toBe(true);
        player.querySelector('.music-close').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(player.classList.contains('matrix-open')).toBe(false);
    });

    it('reduced motion paints one still frame of rain and never starts the animation', () => {
        const randomValues = [0.01, 0.5, 0.03, 0.7, 0.001, 0.99];
        let randomIndex = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => randomValues[randomIndex++ % randomValues.length]);
        const ctx = createCanvasContext();
        const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
        const raf = vi.fn(() => 1);
        vi.stubGlobal('requestAnimationFrame', raf);
        vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
        setMatrixTheme(true);
        expect(raf).not.toHaveBeenCalled();
        expect(ctx.fillText).toHaveBeenCalled();
        expect(document.getElementById('matrix-rain')).not.toBeNull();
        setMatrixTheme(false);
        expect(document.getElementById('matrix-rain')).toBeNull();
        context.mockRestore();
    });

    it('draws animation frames and pauses its animation while the document is hidden', () => {
        const randomValues = [0.01, 0.25, 0.42, 0.61, 0.85, 0.99, 0.03, 0.33, 0.53, 0.73, 0.93];
        let randomIndex = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => randomValues[randomIndex++ % randomValues.length]);
        const ctx = createCanvasContext();
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
        const frames = [];
        const raf = vi.fn((callback) => {
            frames.push(callback);
            return frames.length;
        });
        const cancel = vi.fn();
        vi.stubGlobal('requestAnimationFrame', raf);
        vi.stubGlobal('cancelAnimationFrame', cancel);
        vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
        vi.stubGlobal('I18n', { locale: 'ja' });
        const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);

        setMatrixTheme(true);
        for (let frame = 0; frame < 40; frame += 1) frames.shift()();
        expect(ctx.drawImage).toHaveBeenCalled();

        document.dispatchEvent(new Event('visibilitychange'));
        hidden.mockReturnValue(true);
        document.dispatchEvent(new Event('visibilitychange'));
        expect(cancel).toHaveBeenCalled();
    });

    it('draws each city tower style and rain accent across varied deterministic seeds', () => {
        const randomValues = [0.01, 0.25, 0.42, 0.61, 0.85, 0.99, 0.03, 0.33, 0.53, 0.73, 0.93];
        let randomIndex = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => randomValues[randomIndex++ % randomValues.length]);
        const ctx = createCanvasContext();
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
        const frames = [];
        vi.stubGlobal('requestAnimationFrame', vi.fn((callback) => {
            frames.push(callback);
            return frames.length;
        }));
        vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
        vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);

        setMatrixTheme(true);
        for (let frame = 0; frame < 90; frame += 1) frames.shift()();

        expect(ctx.ellipse).toHaveBeenCalled();
        expect(ctx.strokeRect).toHaveBeenCalled();
        expect(ctx.fillText).toHaveBeenCalled();
        setMatrixTheme(false);
    });

    it('no falling characters when reduced motion is requested, but the colours still apply', () => {
        vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
        setMatrixTheme(true);
        expect(document.documentElement.classList.contains('matrix-theme')).toBe(true);
        expect(document.getElementById('matrix-rain')).toBeNull();
    });
});
