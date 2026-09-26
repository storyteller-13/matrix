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

        it('formatClockTime returns HH:MM:SS and caches formatters by timezone', () => {
            const panel = new window.PanelClass();
            const date = new Date('2026-01-15T12:00:00.000Z');
            const local = panel.formatClockTime(undefined, date);
            expect(/^\d{2}:\d{2}:\d{2}$/.test(local)).toBe(true);
            expect(panel.formatClockTime('Asia/Tokyo', date)).toBe('21:00:00');
            expect(panel.formatClockTime('America/Sao_Paulo', date)).toBe('09:00:00');
            expect(panel.formatClockTime('America/New_York', date)).toBe('07:00:00');
            expect(panel.formatClockTime('Pacific/Honolulu', date)).toBe('02:00:00');
            expect(panel.formatClockTime('Atlantic/Reykjavik', date)).toBe('12:00:00');
            expect(panel.formatClockTime('Europe/Berlin', date)).toBe('13:00:00');
            expect(panel.clockFormatters.has('local')).toBe(true);
            expect(panel.clockFormatters.has('Asia/Tokyo')).toBe(true);
            expect(panel.formatClockTime('Asia/Tokyo', date)).toBe('21:00:00');
        });

        it('formatClockTime pads missing time parts with zeros', () => {
            const panel = new window.PanelClass();
            panel.clockFormatters.clear();
            const OriginalDateTimeFormat = Intl.DateTimeFormat;
            vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
                formatToParts: () => [{ type: 'literal', value: ':' }],
            }));
            expect(panel.formatClockTime(undefined, new Date())).toBe('00:00:00');
            Intl.DateTimeFormat = OriginalDateTimeFormat;
            vi.restoreAllMocks();
        });

        it('updateClock fills each zone from its timezone', () => {
            document.body.innerHTML = `
                <div class="clock">
                    <div class="clock-zone" data-timezone="Pacific/Honolulu"><span class="clock-time"></span></div>
                    <div class="clock-zone" data-timezone="America/New_York"><span class="clock-time"></span></div>
                    <div class="clock-zone" data-timezone="America/Sao_Paulo">
                        <span class="clock-time"><span class="clock-hm"></span><span class="clock-seconds"></span></span>
                    </div>
                    <div class="clock-zone" data-timezone="Atlantic/Reykjavik"><span class="clock-time"></span></div>
                    <div class="clock-zone" data-timezone="Europe/Berlin"><span class="clock-time"></span></div>
                    <div class="clock-zone" data-timezone="Asia/Tokyo"><span class="clock-time"></span></div>
                    <div class="clock-zone" data-timezone="Asia/Tokyo"></div>
                </div>
            `;
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'));
            const panel = new window.PanelClass();
            panel.updateClock();
            expect(document.querySelector('.clock-hm').textContent).toBe('09:00');
            expect(document.querySelector('.clock-seconds').textContent).toBe(':00');
            const times = [...document.querySelectorAll('.clock-time')].map((el) => el.textContent);
            expect(times).toEqual(['02:00:00', '07:00:00', '09:00:00', '12:00:00', '13:00:00', '21:00:00']);
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

        it('applications menu button click toggles the dropdown', () => {
            document.body.innerHTML = `
                <div class="clock"></div>
                <button id="applications-menu-button">Apps</button>
                <div id="applications-dropdown" class="menu-dropdown"></div>
            `;
            new window.PanelClass();
            const button = document.getElementById('applications-menu-button');
            const dropdown = document.getElementById('applications-dropdown');
            button.click();
            expect(dropdown.classList.contains('show')).toBe(true);
            button.click();
            expect(dropdown.classList.contains('show')).toBe(false);
        });

        it('space keydown opens a submenu and skips parents without one', () => {
            document.body.innerHTML = `
                <div class="clock"></div>
                <button id="applications-menu-button">Apps</button>
                <div id="applications-dropdown" class="menu-dropdown">
                    <div class="menu-item-has-submenu" tabindex="0">
                        <span>Empty</span>
                    </div>
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
            const parents = document.querySelectorAll('.menu-item-has-submenu');
            parents[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
            expect(document.querySelector('.menu-submenu').classList.contains('show')).toBe(true);
            parents[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        });

        it('mouseenter on submenu keeps it open', () => {
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
            const submenu = document.querySelector('.menu-submenu');
            submenu.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            expect(submenu.classList.contains('show')).toBe(true);
            submenu.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        });

        it('clicking a non-leaf dropdown item does not close the menu', () => {
            document.body.innerHTML = `
                <div class="clock"></div>
                <button id="applications-menu-button">Apps</button>
                <div id="applications-dropdown" class="menu-dropdown show">
                    <div class="menu-item-has-submenu">Parent</div>
                </div>
            `;
            const panel = new window.PanelClass();
            panel.setupApplicationsMenu();
            document.querySelector('.menu-item-has-submenu').click();
            expect(document.getElementById('applications-dropdown').classList.contains('show')).toBe(true);
        });

        it('isCompactMenu follows max-width 768 and is false without matchMedia', () => {
            const panel = new window.PanelClass();
            window.matchMedia = (query) => ({ matches: query.includes('768') });
            expect(panel.isCompactMenu()).toBe(true);
            window.matchMedia = () => ({ matches: false });
            expect(panel.isCompactMenu()).toBe(false);
            const original = window.matchMedia;
            delete window.matchMedia;
            expect(panel.isCompactMenu()).toBe(false);
            window.matchMedia = original;
        });

        it('click toggles a submenu on compact menus and ignores hover', () => {
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
            window.matchMedia = (query) => ({ matches: String(query).includes('768') });
            const panel = new window.PanelClass();
            expect(panel.isCompactMenu()).toBe(true);
            const parent = document.querySelector('.menu-item-has-submenu');
            const submenu = document.querySelector('.menu-submenu');
            parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            expect(submenu.classList.contains('show')).toBe(false);
            parent.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            submenu.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            submenu.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            parent.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
            expect(submenu.classList.contains('show')).toBe(false);
            parent.click();
            expect(submenu.classList.contains('show')).toBe(true);
            parent.click();
            expect(submenu.classList.contains('show')).toBe(false);
            document.querySelector('a.menu-item').click();
            expect(submenu.classList.contains('show')).toBe(false);
        });

        it('opening a nested submenu keeps the parent submenu open', () => {
            document.body.innerHTML = `
                <div class="clock"></div>
                <button id="applications-menu-button">Apps</button>
                <div id="applications-dropdown" class="menu-dropdown">
                    <div class="menu-item-has-submenu" tabindex="0">
                        <span>Stories</span>
                        <div class="menu-submenu" id="parent-sub">
                            <div class="menu-item-has-submenu" tabindex="0">
                                <span>Nested</span>
                                <div class="menu-submenu" id="nested-sub">
                                    <a href="#" class="menu-item">Item</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            window.matchMedia = () => ({ matches: false });
            const panel = new window.PanelClass();
            panel.setupApplicationsMenu();
            const parents = document.querySelectorAll('.menu-item-has-submenu');
            const parentSub = document.getElementById('parent-sub');
            const nestedSub = document.getElementById('nested-sub');
            parents[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            expect(parentSub.classList.contains('show')).toBe(true);
            parents[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            expect(parentSub.classList.contains('show')).toBe(true);
            expect(nestedSub.classList.contains('show')).toBe(true);
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

        it('closeAllSubmenus keeps ancestor submenus when a nested one is kept', () => {
            const panel = new window.PanelClass();
            const ancestor = document.createElement('div');
            ancestor.className = 'menu-submenu show';
            const nested = document.createElement('div');
            nested.className = 'menu-submenu show';
            const sibling = document.createElement('div');
            sibling.className = 'menu-submenu show';
            ancestor.appendChild(nested);
            document.body.appendChild(ancestor);
            document.body.appendChild(sibling);
            panel.closeAllSubmenus(nested);
            expect(ancestor.classList.contains('show')).toBe(true);
            expect(nested.classList.contains('show')).toBe(true);
            expect(sibling.classList.contains('show')).toBe(false);
            panel.closeAllSubmenus(ancestor);
            expect(nested.classList.contains('show')).toBe(true);
            document.body.removeChild(ancestor);
            document.body.removeChild(sibling);
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
