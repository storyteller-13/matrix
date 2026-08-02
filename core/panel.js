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
     * Updates the clock display with current time
     */
    updateClock() {
        const clock = document.querySelector('.clock');
        if (!clock) {
            return;
        }

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clock.textContent = `${hours}:${minutes}:${seconds}`;
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

    /**
     * Sets up hover and keyboard behavior for menu items that have submenus
     */
    setupSubmenus(applicationsDropdown) {
        const parents = applicationsDropdown.querySelectorAll('.menu-item-has-submenu');
        parents.forEach((parent) => {
            const submenu = parent.querySelector('.menu-submenu');
            if (!submenu) return;

            const showSubmenu = () => {
                if (this.submenuHideTimeoutId !== null) {
                    clearTimeout(this.submenuHideTimeoutId);
                    this.submenuHideTimeoutId = null;
                }
                this.closeAllSubmenus();
                submenu.classList.add('show');
            };

            const hideSubmenu = () => {
                this.submenuHideTimeoutId = setTimeout(() => {
                    submenu.classList.remove('show');
                    this.submenuHideTimeoutId = null;
                }, Panel.SUBMENU_HIDE_DELAY);
            };

            parent.addEventListener('mouseenter', showSubmenu);
            parent.addEventListener('mouseleave', () => hideSubmenu());
            submenu.addEventListener('mouseenter', showSubmenu);
            submenu.addEventListener('mouseleave', () => hideSubmenu());

            // Keyboard: arrow right opens submenu, enter opens on focus
            parent.addEventListener('focus', () => showSubmenu());
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
    closeAllSubmenus() {
        if (this.submenuHideTimeoutId !== null) {
            clearTimeout(this.submenuHideTimeoutId);
            this.submenuHideTimeoutId = null;
        }
        document.querySelectorAll('.menu-submenu.show').forEach((sub) => sub.classList.remove('show'));
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
