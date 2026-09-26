/**
 * Home Window Application Module
 * Simple iframe-based "what i do" window
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

    ensureIframeSrc() {
        const iframe = document.getElementById('home-iframe');
        if (!iframe) return;
        const src = iframe.getAttribute('data-src');
        if (src && iframe.getAttribute('src') !== src) {
            iframe.setAttribute('src', src);
        }
    }

    open() {
        this.ensureIframeSrc();
        super.open();
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
