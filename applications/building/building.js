/**
 * Building Window Application Module
 */

class BuildingApp extends BaseApp {
    constructor() {
        super({ windowId: 'building-window' });
        this.init();
    }

    init() {
        this.desktopIcon = document.getElementById('building-desktop-icon');
        super.init();
    }

    ensureIframeSrc() {
        const iframe = document.getElementById('building-iframe');
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

window.BuildingAppClass = BuildingApp;

const initBuildingApp = () => {
    window.BuildingApp = new BuildingApp();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBuildingApp);
} else {
    initBuildingApp();
}

window.openBuildingWindow = () => window.BuildingApp?.open();
