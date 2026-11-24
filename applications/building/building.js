/**
 * Building Window Application Module
 */

/** How long the matrix door takes to swing open before the site opens. Matches the CSS transition. */
const DOOR_SWING_MS = 700;
/** How long the matrix door stays open after the site opens, before it closes again. */
const DOOR_STAY_OPEN_MS = 3000;

class BuildingApp extends BaseApp {
    constructor() {
        super({ windowId: 'building-window', dockItemId: 'building-dock-item' });
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

    /** In matrix mode "enter it" (desktop icon and dock item) opens the building site in a new browser window. */
    open() {
        if (window.MatrixTheme?.isMatrixTheme?.()) {
            this.openNewWindow();
            return;
        }
        this.ensureIframeSrc();
        super.open();
    }

    openNewWindow() {
        const url = document.getElementById('building-iframe')?.getAttribute('data-src');
        if (url) window.open(url, '_blank', 'noopener');
    }

    /**
     * In matrix mode the door swings open first, the site opens in a new window,
     * and the door closes again after it has stayed open for a few seconds.
     */
    swingDoorOpen() {
        const icon = this.desktopIcon;
        if (!icon) return;
        icon.classList.add('is-opening');
        clearTimeout(this.doorTimer);
        clearTimeout(this.doorCloseTimer);
        this.doorTimer = setTimeout(() => this.open(), DOOR_SWING_MS);
        this.doorCloseTimer = setTimeout(() => icon.classList.remove('is-opening'), DOOR_SWING_MS + DOOR_STAY_OPEN_MS);
    }

    setupEventListeners() {
        super.setupEventListeners();
        if (this.desktopIcon) {
            this.desktopIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.MatrixTheme?.isMatrixTheme?.()) {
                    this.swingDoorOpen();
                    return;
                }
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
