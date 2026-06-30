/**
 * Terminal Application Module
 * Wrapper for terminal.js functionality
 */
class TerminalApp {
    constructor() {
        this.windowId = 'terminal-window';
        this.dockItemId = 'terminal-dock-item';
        this.inputId = 'terminal-input-main';
        this.focusDelay = 300;
        this.transitionDuration = '0.3s';
        this.window = null;
        this.dockItem = null;

        this.init();
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
        if (!this.dockItem) return;

        this.dockItem.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.open();
        });
    }

    isWindowVisible() {
        const style = this.window.style;
        const computed = window.getComputedStyle(this.window);
        return style.display !== 'none' && computed.display !== 'none';
    }

    openWithWindowManager() {
        if (window.WindowManager) {
            window.WindowManager.open(this.window, this.dockItem);
            return true;
        }
        return false;
    }

    openWithFallback() {
        // Update dock item state
        document.querySelectorAll('.dock-item').forEach(item => {
            item.classList.remove('active');
        });
        if (this.dockItem) {
            this.dockItem.classList.add('active');
        }

        // Reset window position and prepare for animation
        const style = this.window.style;
        style.transition = 'none';
        style.top = '50%';
        style.left = '50%';
        style.transform = '';
        style.opacity = '';

        // Reset offset if present
        if (this.window._xOffset !== undefined) {
            this.window._xOffset = 0;
            this.window._yOffset = 0;
        }

        // Set initial state for animation
        style.display = 'block';
        style.opacity = '0';
        style.transform = 'translate(-50%, -50%) scale(0.9)';

        // Force reflow
        void this.window.offsetHeight;

        // Animate to final state
        requestAnimationFrame(() => {
            style.transition = `opacity ${this.transitionDuration} ease, transform ${this.transitionDuration} ease`;
            style.opacity = '1';
            style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // Bring to front
        if (window.bringToFront) {
            window.bringToFront(this.window);
        }
    }

    focusInput() {
        const terminalInput = document.getElementById(this.inputId);
        if (terminalInput) {
            setTimeout(() => terminalInput.focus(), this.focusDelay);
        }
    }

    open() {
        if (!this.window) return;

        const isVisible = this.isWindowVisible();

        if (!isVisible) {
            if (!this.openWithWindowManager()) {
                this.openWithFallback();
            }
        } else if (window.bringToFront) {
            window.bringToFront(this.window);
        }

        this.focusInput();
    }

    close() {
        if (this.dockItem) {
            this.dockItem.classList.remove('active');
        }
    }
}

// Expose class constructor for testing
window.TerminalAppClass = TerminalApp;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.TerminalApp = new TerminalApp();
    });
} else {
    window.TerminalApp = new TerminalApp();
}

// Expose open function globally for onclick handlers
window.openTerminalWindow = function() {
    if (window.TerminalApp) {
        window.TerminalApp.open();
    }
};
