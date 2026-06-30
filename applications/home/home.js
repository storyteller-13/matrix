/**
 * Home Window Application Module
 * Simple iframe-based window
 */
class HomeApp extends BaseApp {
    constructor() {
        super({ windowId: 'home-window', dockItemId: 'home-dock-item' });
        this.init();
    }

    init() {
        this.desktopIcon = document.getElementById('home-desktop-icon');
        super.init();
    }

    setupEventListeners() {
        super.setupEventListeners();
        if (this.desktopIcon) {
            this.desktopIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.open();
            });
        }
    }
}

window.HomeAppClass = HomeApp;

const initHomeApp = () => {
    window.HomeApp = new HomeApp();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomeApp);
} else {
    initHomeApp();
}

window.openHomeWindow = () => window.HomeApp?.open();
