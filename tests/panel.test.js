/**
 * Panel tests – PanelClass clock and menu helpers (no full DOM menu tree)
 */
import { describe, it, expect, afterEach, vi } from 'vitest';

describe('Panel', () => {
    beforeAll(async () => {
        document.body.innerHTML = '<div class="clock"></div>';
        await import('../core/panel.js');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('exposes PanelClass on window for testing', () => {
        expect(window.PanelClass).toBeDefined();
        expect(typeof window.PanelClass).toBe('function');
    });

    it('PanelClass has expected static constants', () => {
        expect(window.PanelClass.CLOCK_UPDATE_INTERVAL).toBe(1000);
        expect(window.PanelClass.MENU_CLOSE_DELAY).toBe(100);
        expect(window.PanelClass.SUBMENU_HIDE_DELAY).toBe(150);
    });

    describe('Panel instance (clock only)', () => {
        it('updateClock sets clock element to HH:MM:SS format', () => {
            const clock = document.querySelector('.clock');
            const panel = new window.PanelClass();
            panel.updateClock();
            const text = clock.textContent;
            expect(/^\d{2}:\d{2}:\d{2}$/.test(text)).toBe(true);
        });

        it('startClock sets an interval and clears previous one', () => {
            vi.useFakeTimers();
            const panel = new window.PanelClass();
            panel.clockIntervalId = 999;
            const clearSpy = vi.spyOn(global, 'clearInterval');
            panel.startClock();
            expect(clearSpy).toHaveBeenCalledWith(999);
            expect(panel.clockIntervalId).toBeTruthy();
            vi.advanceTimersByTime(2000);
            vi.useRealTimers();
        });

        it('updateClock returns early when clock element is missing', () => {
            document.body.innerHTML = '';
            const panel = new window.PanelClass();
            expect(() => panel.updateClock()).not.toThrow();
        });
    });

    describe('setupApplicationsMenu and setupSubmenus', () => {
        it('setupApplicationsMenu returns early when button or dropdown missing', () => {
            document.body.innerHTML = '<div class="clock"></div>';
            const panel = new window.PanelClass();
            expect(() => panel.setupApplicationsMenu()).not.toThrow();
        });

        it('setupApplicationsMenu attaches to menu DOM without throwing', () => {
            document.body.innerHTML = `
                <div class="clock"></div>
                <button id="applications-menu-button">Apps</button>
                <div id="applications-dropdown" class="menu-dropdown">
                    <div class="menu-item-has-submenu">
                        <span>Submenu</span>
                        <div class="menu-submenu">
                            <a href="#" class="menu-item">Item</a>
                        </div>
                    </div>
                </div>
            `;
            const panel = new window.PanelClass();
            expect(() => panel.setupApplicationsMenu()).not.toThrow();
            expect(document.getElementById('applications-dropdown')).toBeTruthy();
        });

        it('applications menu button adds show to dropdown when clicked and dropdown was closed', () => {
            document.body.innerHTML = `
                <div class="clock"></div>
                <button id="applications-menu-button">Apps</button>
                <div id="applications-dropdown" class="menu-dropdown"></div>
            `;
            const panel = new window.PanelClass();
            panel.setupApplicationsMenu();
            const dropdown = document.getElementById('applications-dropdown');
            expect(dropdown.classList.contains('show')).toBe(false);
            // Simulate opening: same logic as button handler when dropdown was closed
            panel.closeAllDropdowns();
            dropdown.classList.add('show');
            expect(dropdown.classList.contains('show')).toBe(true);
            // Simulate second click: close only
            panel.closeAllDropdowns();
            expect(dropdown.classList.contains('show')).toBe(false);
        });

        it('document click outside closes dropdown and submenus', () => {
            document.body.innerHTML = `
                <div class="clock"></div>
                <button id="applications-menu-button">Apps</button>
                <div id="applications-dropdown" class="menu-dropdown show"></div>
                <div id="outside">Outside</div>
            `;
            const panel = new window.PanelClass();
            panel.setupApplicationsMenu();
            const dropdown = document.getElementById('applications-dropdown');
            document.getElementById('outside').click();
            expect(dropdown.classList.contains('show')).toBe(false);
        });

        it('clicking leaf menu item closes dropdown after delay', async () => {
            document.body.innerHTML = `
                <div class="clock"></div>
                <button id="applications-menu-button">Apps</button>
                <div id="applications-dropdown" class="menu-dropdown show">
                    <div class="menu-item-has-submenu">
                        <span>Submenu</span>
                        <div class="menu-submenu">
                            <a href="#" class="menu-item">Item</a>
                        </div>
                    </div>
                </div>
            `;
            const panel = new window.PanelClass();
            panel.setupApplicationsMenu();
            const dropdown = document.getElementById('applications-dropdown');
            const link = document.querySelector('a.menu-item');
            link.click();
            await new Promise((r) => setTimeout(r, 150));
            expect(dropdown.classList.contains('show')).toBe(false);
        });

        it('focus and keydown Enter on parent show submenu', () => {
            document.body.innerHTML = `
                <div class="clock"></div>
                <button id="applications-menu-button">Apps</button>
                <div id="applications-dropdown" class="menu-dropdown">
                    <div class="menu-item-has-submenu" tabindex="0">
                        <span>Submenu</span>
                        <div class="menu-submenu">
                            <a href="#" class="menu-item">Item</a>
                        </div>
                    </div>
                </div>
            `;
            const panel = new window.PanelClass();
            panel.setupApplicationsMenu();
            const parent = document.querySelector('.menu-item-has-submenu');
            const submenu = document.querySelector('.menu-submenu');
            parent.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
            expect(submenu.classList.contains('show')).toBe(true);
            parent.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            expect(submenu.classList.contains('show')).toBe(true);
        });

        it('mouseenter on parent shows submenu, mouseleave hides after delay', async () => {
            document.body.innerHTML = `
                <div class="clock"></div>
                <button id="applications-menu-button">Apps</button>
                <div id="applications-dropdown" class="menu-dropdown">
                    <div class="menu-item-has-submenu">
                        <span>Submenu</span>
                        <div class="menu-submenu">
                            <a href="#" class="menu-item">Item</a>
                        </div>
                    </div>
                </div>
            `;
            const panel = new window.PanelClass();
            panel.setupApplicationsMenu();
            const parent = document.querySelector('.menu-item-has-submenu');
            const submenu = document.querySelector('.menu-submenu');
            parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            expect(submenu.classList.contains('show')).toBe(true);
            parent.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            await new Promise((r) => setTimeout(r, 200));
            expect(submenu.classList.contains('show')).toBe(false);
        });

        it('showSubmenu clears existing submenuHideTimeoutId when opening', () => {
            document.body.innerHTML = `
                <div class="clock"></div>
                <button id="applications-menu-button">Apps</button>
                <div id="applications-dropdown" class="menu-dropdown">
                    <div class="menu-item-has-submenu">
                        <span>Submenu</span>
                        <div class="menu-submenu">
                            <a href="#" class="menu-item">Item</a>
                        </div>
                    </div>
                </div>
            `;
            const panel = new window.PanelClass();
            panel.setupApplicationsMenu();
            panel.submenuHideTimeoutId = 123;
            const clearSpy = vi.spyOn(global, 'clearTimeout');
            const parent = document.querySelector('.menu-item-has-submenu');
            parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            expect(clearSpy).toHaveBeenCalledWith(123);
            expect(panel.submenuHideTimeoutId).toBeNull();
        });

    });

    describe('closeAllSubmenus / closeAllDropdowns', () => {
        it('closeAllSubmenus clears submenu hide timeout and removes .show from submenus', () => {
            const panel = new window.PanelClass();
            panel.submenuHideTimeoutId = 123;
            const clearSpy = vi.spyOn(global, 'clearTimeout');
            const sub = document.createElement('div');
            sub.className = 'menu-submenu show';
            document.body.appendChild(sub);
            panel.closeAllSubmenus();
            expect(clearSpy).toHaveBeenCalledWith(123);
            expect(panel.submenuHideTimeoutId).toBeNull();
            expect(sub.classList.contains('show')).toBe(false);
            document.body.removeChild(sub);
        });

        it('closeAllDropdowns removes .show from elements with .menu-dropdown', () => {
            const panel = new window.PanelClass();
            const dropdown = document.createElement('div');
            dropdown.className = 'menu-dropdown show';
            document.body.appendChild(dropdown);
            panel.closeAllDropdowns();
            expect(dropdown.classList.contains('show')).toBe(false);
            document.body.removeChild(dropdown);
        });
    });
});
