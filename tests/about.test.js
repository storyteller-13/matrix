/**
 * About window – render copy, desktop icon, and open helper
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

const aboutDom = () => `
    <div id="about-window" class="window about-window" style="display: none;">
        <div class="about-name"></div>
        <div class="about-role"></div>
        <div class="about-text"></div>
        <div class="about-disclaimer"></div>
    </div>
    <div id="about-dock-item" class="dock-item"></div>
    <a id="about-desktop-icon" class="desktop-icon"></a>
`;

describe('AboutApp', () => {
    beforeAll(async () => {
        document.body.innerHTML = aboutDom();
        await import('../core/base-app.js');
        await import('../applications/about/about.js');
    });

    beforeEach(() => {
        document.body.innerHTML = aboutDom();
        delete window.WindowManager;
        window.I18n = undefined;
    });

    it('renders about copy into the window', () => {
        new window.AboutAppClass();
        expect(document.querySelector('.about-name').textContent).toMatch(/marina/i);
        expect(document.querySelector('.about-role').textContent.length).toBeGreaterThan(0);
        expect(document.querySelector('.about-text').textContent.length).toBeGreaterThan(0);
        expect(document.querySelector('.about-disclaimer').textContent).toMatch(/gentle disclaimer/i);
        expect(window.ABOUT.name).toMatch(/marina/i);
    });

    it('renders japanese copy when the locale is ja', () => {
        window.I18n = { locale: 'ja' };
        new window.AboutAppClass();
        expect(document.querySelector('.about-name').textContent).toMatch(/マリーナ/);
        expect(document.querySelector('.about-role').textContent).toMatch(/てつがくしゃ/);
        expect(document.querySelector('.about-text').textContent).toMatch(/わたしはマリーナ/);
        expect(document.querySelector('.about-disclaimer').textContent).toMatch(/やさしいことわり/);
        expect(window.ABOUT_JA.name).toMatch(/マリーナ/);
    });

    it('re-renders when the locale changes', () => {
        window.I18n = { locale: 'en' };
        new window.AboutAppClass();
        expect(document.querySelector('.about-name').textContent).toMatch(/marina/i);
        window.I18n = { locale: 'ja' };
        document.dispatchEvent(new CustomEvent('localechange', { detail: { locale: 'ja' } }));
        expect(document.querySelector('.about-name').textContent).toMatch(/マリーナ/);
    });

    it('desktop icon click opens the about window', () => {
        const app = new window.AboutAppClass();
        const openSpy = vi.spyOn(app, 'open');
        document.getElementById('about-desktop-icon').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(openSpy).toHaveBeenCalled();
    });

    it('openAboutWindow opens AboutApp when present', () => {
        const app = new window.AboutAppClass();
        window.AboutApp = app;
        const openSpy = vi.spyOn(app, 'open');
        window.openAboutWindow();
        expect(openSpy).toHaveBeenCalled();
    });

    it('openAboutWindow no-ops when AboutApp is missing', () => {
        window.AboutApp = undefined;
        expect(() => window.openAboutWindow()).not.toThrow();
    });

    it('init returns early when the window is missing', () => {
        document.body.innerHTML = '<div id="about-dock-item"></div>';
        const app = new window.AboutAppClass();
        expect(app.window).toBeNull();
    });

    it('setupEventListeners skips desktop icon when it is missing', () => {
        document.body.innerHTML = `
            <div id="about-window" class="window about-window">
                <div class="about-name"></div>
            </div>
            <div id="about-dock-item" class="dock-item"></div>
        `;
        expect(() => new window.AboutAppClass()).not.toThrow();
    });

    it('render skips missing copy nodes', () => {
        document.body.innerHTML = `
            <div id="about-window" class="window about-window"></div>
            <div id="about-dock-item" class="dock-item"></div>
        `;
        expect(() => new window.AboutAppClass()).not.toThrow();
    });
});
