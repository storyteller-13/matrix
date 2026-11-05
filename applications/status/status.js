/**
 * Current Status Window Application Module
 */

class StatusApp extends BaseApp {
    constructor() {
        super({ windowId: 'status-window' });
        this.init();
    }

    ensureIframeSrc() {
        const iframe = document.getElementById('status-iframe');
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
}

window.StatusAppClass = StatusApp;

const initStatusApp = () => {
    window.StatusApp = new StatusApp();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStatusApp);
} else {
    initStatusApp();
}

window.openStatusWindow = () => window.StatusApp?.open();
