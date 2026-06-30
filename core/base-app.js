/**
 * Base class for dock + window applications.
 */
class BaseApp {
    constructor(options = {}) {
        this.windowId = options.windowId || this.windowId;
        this.dockItemId = options.dockItemId || this.dockItemId;
        this.window = null;
        this.dockItem = null;
    }

    init() {
        this.window = document.getElementById(this.windowId);
        this.dockItem = document.getElementById(this.dockItemId);

        if (!this.window) {
            return;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.dockItem) {
            this.dockItem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.open();
                return false;
            });
        }
    }

    open() {
        if (!this.window) return;

        if (window.WindowManager) {
            window.WindowManager.open(this.window, this.dockItem);
        } else {
            this.openFallback();
        }
    }

    openFallback() {
        const dockItems = document.querySelectorAll('.dock-item');
        dockItems.forEach(di => di.classList.remove('active'));
        if (this.dockItem) {
            this.dockItem.classList.add('active');
        }

        this.window.style.display = 'block';
        this.window.style.opacity = '0';
        this.window.style.transform = 'translate(0, 0) scale(0.9)';

        void this.window.offsetHeight;

        requestAnimationFrame(() => {
            this.window.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            this.window.style.opacity = '1';
            this.window.style.transform = 'translate(0, 0) scale(1)';
        });

        if (window.bringToFront) {
            window.bringToFront(this.window);
        }
    }

    close() {
        if (window.WindowManager && this.window) {
            window.WindowManager.close(this.window, this.dockItem);
        } else if (this.dockItem) {
            this.dockItem.classList.remove('active');
        }
    }
}

window.BaseApp = BaseApp;
