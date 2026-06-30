/**
 * Email Window Application Module
 * Simple iframe-based window (like home).
 */
class EmailApp extends BaseApp {
    constructor() {
        super({ windowId: 'email-window', dockItemId: 'email-dock-item' });
        this.init();
    }

    init() {
        super.init();
    }
}

window.EmailAppClass = EmailApp;

const initEmailApp = () => {
    window.EmailApp = new EmailApp();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailApp);
} else {
    initEmailApp();
}

window.openEmailWindow = () => window.EmailApp?.open();
