/**
 * Panel Module
 * Handles top panel functionality (clock, menu)
 */
class Panel {
    // Constants
    static CLOCK_UPDATE_INTERVAL = 1000; // 1 second
    static MENU_CLOSE_DELAY = 100; // milliseconds
    static SUBMENU_HIDE_DELAY = 150; // milliseconds

    constructor() {
        this.clockIntervalId = null;
        this.submenuHideTimeoutId = null;
        this.clockFormatters = new Map();
        this.init();
    }

    init() {
        // Update clock immediately and set up interval
        this.updateClock();
        this.startClock();

        // Setup applications menu
        this.setupApplicationsMenu();
    }

    /**
     * Starts the clock update interval
     */
    startClock() {
        if (this.clockIntervalId !== null) {
            clearInterval(this.clockIntervalId);
        }
        this.clockIntervalId = setInterval(() => this.updateClock(), Panel.CLOCK_UPDATE_INTERVAL);
    }

    /**
     * Formats a time as HH:MM:SS for a given IANA timezone.
     * Omitting timeZone uses the local timezone.
     */
    formatClockTime(timeZone, date = new Date()) {
        const key = timeZone || 'local';
        let formatter = this.clockFormatters.get(key);
        if (!formatter) {
            const options = {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                hourCycle: 'h23',
            };
            if (timeZone) {
                options.timeZone = timeZone;
            }
            formatter = new Intl.DateTimeFormat('en-GB', options);
            this.clockFormatters.set(key, formatter);
        }

        const parts = formatter.formatToParts(date);
        const get = (type) => parts.find((part) => part.type === type)?.value ?? '00';
        return `${get('hour').padStart(2, '0')}:${get('minute').padStart(2, '0')}:${get('second').padStart(2, '0')}`;
    }

    /**
     * Updates the clock display with current time in each configured zone
     */
    updateClock() {
        const clock = document.querySelector('.clock');
        if (!clock) {
            return;
        }

        const now = new Date();
        const zones = clock.querySelectorAll('.clock-zone');
        if (zones.length === 0) {
            clock.textContent = this.formatClockTime(undefined, now);
            return;
        }

        zones.forEach((zone) => {
            const timeEl = zone.querySelector('.clock-time');
            if (!timeEl) {
                return;
            }
            const formatted = this.formatClockTime(zone.dataset.timezone, now);
            const hmEl = timeEl.querySelector('.clock-hm');
            const secondsEl = timeEl.querySelector('.clock-seconds');
            if (hmEl && secondsEl) {
                hmEl.textContent = formatted.slice(0, 5);
                secondsEl.textContent = formatted.slice(5);
                return;
            }
            timeEl.textContent = formatted;
        });
    }

    /**
     * Sets up the applications menu dropdown functionality
     */
    setupApplicationsMenu() {
        const applicationsMenuButton = document.getElementById('applications-menu-button');
        const applicationsDropdown = document.getElementById('applications-dropdown');

        if (!applicationsMenuButton || !applicationsDropdown) {
            return;
        }

        // Handle button click to toggle dropdown
        applicationsMenuButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isShowing = applicationsDropdown.classList.contains('show');
            this.closeAllDropdowns();
            if (!isShowing) {
                applicationsDropdown.classList.add('show');
            }
        });

        // Close dropdown when clicking outside (dropdown contains submenus, so clicking in submenu still counts as inside)
        document.addEventListener('click', (e) => {
            if (!applicationsMenuButton.contains(e.target) &&
                !applicationsDropdown.contains(e.target)) {
                applicationsDropdown.classList.remove('show');
                this.closeAllSubmenus();
            }
        });

        // Close main dropdown only when clicking a leaf menu item (link inside a submenu), not when clicking a parent row
        applicationsDropdown.addEventListener('click', (e) => {
            const link = e.target.closest('a.menu-item');
            if (link && link.closest('.menu-submenu')) {
                setTimeout(() => {
                    applicationsDropdown.classList.remove('show');
                    this.closeAllSubmenus();
                }, Panel.MENU_CLOSE_DELAY);
            }
        });

        this.setupSubmenus(applicationsDropdown);
    }

    isCompactMenu() {
        return typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 768px)').matches;
    }

    /**
     * Sets up hover and keyboard behavior for menu items that have submenus
     */
    setupSubmenus(applicationsDropdown) {
        const parents = applicationsDropdown.querySelectorAll('.menu-item-has-submenu');
        parents.forEach((parent) => {
            const submenu = parent.querySelector(':scope > .menu-submenu');
            if (!submenu) return;

            const showSubmenu = () => {
                if (this.submenuHideTimeoutId !== null) {
                    clearTimeout(this.submenuHideTimeoutId);
                    this.submenuHideTimeoutId = null;
                }
                this.closeAllSubmenus(submenu);
                submenu.classList.add('show');
            };

            const hideSubmenu = () => {
                this.submenuHideTimeoutId = setTimeout(() => {
                    submenu.classList.remove('show');
                    this.submenuHideTimeoutId = null;
                }, Panel.SUBMENU_HIDE_DELAY);
            };

            parent.addEventListener('mouseenter', () => {
                if (this.isCompactMenu()) return;
                showSubmenu();
            });
            parent.addEventListener('mouseleave', () => {
                if (this.isCompactMenu()) return;
                hideSubmenu();
            });
            submenu.addEventListener('mouseenter', () => {
                if (this.isCompactMenu()) return;
                showSubmenu();
            });
            submenu.addEventListener('mouseleave', () => {
                if (this.isCompactMenu()) return;
                hideSubmenu();
            });

            parent.addEventListener('click', (e) => {
                if (!this.isCompactMenu()) return;
                if (e.target.closest('a.menu-item')) return;
                e.preventDefault();
                e.stopPropagation();
                const isShowing = submenu.classList.contains('show');
                if (isShowing) {
                    submenu.classList.remove('show');
                    submenu.querySelectorAll('.menu-submenu.show').forEach((sub) => sub.classList.remove('show'));
                } else {
                    this.closeAllSubmenus(submenu);
                    submenu.classList.add('show');
                }
            });

            // Keyboard: arrow right opens submenu, enter opens on focus
            parent.addEventListener('focus', () => {
                if (this.isCompactMenu()) return;
                showSubmenu();
            });
            parent.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showSubmenu();
                }
            });
        });
    }

    /**
     * Closes all submenus inside the applications dropdown
     */
    closeAllSubmenus(keepSubmenu = null) {
        if (this.submenuHideTimeoutId !== null) {
            clearTimeout(this.submenuHideTimeoutId);
            this.submenuHideTimeoutId = null;
        }
        document.querySelectorAll('.menu-submenu.show').forEach((sub) => {
            if (keepSubmenu && (sub === keepSubmenu || sub.contains(keepSubmenu) || keepSubmenu.contains(sub))) {
                return;
            }
            sub.classList.remove('show');
        });
    }

    /**
     * Closes all menu dropdowns
     */
    closeAllDropdowns() {
        this.closeAllSubmenus();
        document.querySelectorAll('.menu-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
}

// Expose class constructor for testing
window.PanelClass = Panel;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.Panel = new Panel();
    });
} else {
    window.Panel = new Panel();
}
