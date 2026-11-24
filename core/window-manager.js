/**
 * Window Manager
 * Handles window lifecycle, dragging, z-index management, and window controls
 */
// Which dock item opens each window, so closing a window can release its dock state.
const DOCK_ITEM_BY_WINDOW = {
    'todo-window': 'todo-dock-item',
    'home-window': 'home-dock-item',
    'building-window': 'building-dock-item',
    'terminal-window': 'terminal-dock-item',
    'artwork-window': 'artwork-dock-item',
    'lists-folder-window': 'lists-folder-dock-item',
    'notes-window': 'notes-dock-item',
    'about-window': 'about-dock-item'
};

class WindowManager {
    constructor() {
        this.highestZIndex = 100;
        this.viewportPadding = 12;
        this.dockClearance = 8;
        this.init();
    }

    /** Windows marked data-centered open in the middle of the screen; on compact screens all do. */
    isCenteredWindow(el) {
        return Boolean(el) && (el.hasAttribute('data-centered') || this.isCompactViewport());
    }

    isCompactViewport() {
        return typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 768px), (max-height: 500px)').matches;
    }

    init() {
        // Setup when DOM is ready
        const setup = () => {
            const windows = document.querySelectorAll('.window');
            windows.forEach(window => {
                this.registerWindow(window);
            });

            // Setup window controls
            this.setupWindowControls();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            // DOM is already loaded
            setup();
        }
    }

    registerWindow(windowElement) {
        if (!windowElement) return;
        this.makeDraggable(windowElement);
    }

    open(windowElement, dockItem = null) {
        if (!windowElement) return;

        // Update dock item active state
        if (dockItem) {
            const dockItems = document.querySelectorAll('.dock-item');
            dockItems.forEach(di => di.classList.remove('active'));
            dockItem.classList.add('active');
        }

        // Reset transforms
        windowElement.style.transition = 'none';
        windowElement.style.transform = '';
        windowElement.style.opacity = '';

        // Show and animate in
        windowElement.style.display = windowElement.classList.contains('about-window') ? 'flex' : 'block';
        windowElement.style.opacity = '0';

        const isCentered = this.isCenteredWindow(windowElement);

        this.constrainWindowToVerticalBounds(windowElement);

        if (isCentered) {
            windowElement._xOffset = 0;
            windowElement._yOffset = 0;
            windowElement.style.top = '50%';
            windowElement.style.left = '50%';
            windowElement.style.transform = 'translate(-50%, -50%) scale(0.9)';
        } else {
            windowElement.style.transform = 'translate(0, 0) scale(0.9)';
        }

        // Force reflow
        void windowElement.offsetHeight;

        // Animate in
        requestAnimationFrame(() => {
            windowElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            windowElement.style.opacity = '1';
            if (isCentered) {
                windowElement.style.transform = 'translate(-50%, -50%) scale(1)';
            } else {
                windowElement.style.transform = 'translate(0, 0) scale(1)';
            }
        });

        // Bring to front
        this.bringToFront(windowElement);

        this.constrainWindowToVerticalBounds(windowElement);

        // Keep windows inside the viewport and above the dock.
        // Centered windows stay at top/left 50% unless they would overflow.
        requestAnimationFrame(() => {
            if (!isCentered) {
                this.clampWindowToViewport(windowElement);
                return;
            }

            const rect = windowElement.getBoundingClientRect();
            const safeTopY = this.getSafeTopY();
            const safeBottomY = this.getSafeBottomY();
            if (rect.height > 0 && (rect.top < safeTopY || rect.bottom > safeBottomY)) {
                this.clampWindowToViewport(windowElement);
            }
        });
    }

    close(windowElement, dockItem = null) {
        if (!windowElement) return;
        windowElement.dispatchEvent(new CustomEvent('windowclose'));

        const isCentered = this.isCenteredWindow(windowElement);

        windowElement.style.opacity = '0';
        if (isCentered) {
            windowElement.style.transform = 'translate(-50%, -50%) scale(0.9)';
        } else {
            windowElement.style.transform = 'scale(0.9)';
        }

        // Remove active state from dock item
        if (dockItem) {
            dockItem.classList.remove('active');
        }

        setTimeout(() => {
            windowElement.style.display = 'none';
            windowElement.style.transform = '';
            windowElement.style.transition = '';
            windowElement.style.opacity = '';
        }, 200);
    }

    minimize(windowElement) {
        if (!windowElement) return;

        windowElement.style.transform = 'translateY(calc(100vh - 100px)) scale(0.8)';
        setTimeout(() => {
            windowElement.style.opacity = '0.5';
        }, 200);
    }

    bringToFront(windowElement) {
        this.highestZIndex += 1;
        windowElement.style.zIndex = this.highestZIndex;
    }

    getSafeBottomY() {
        const dock = document.querySelector('.bottom-dock');
        if (!dock) return window.innerHeight - this.viewportPadding;

        const dockRect = dock.getBoundingClientRect();
        return dockRect.top - this.dockClearance;
    }

    getSafeTopY() {
        const topPanel = document.querySelector('.top-panel');
        if (!topPanel) return this.viewportPadding;

        const panelRect = topPanel.getBoundingClientRect();
        return panelRect.bottom + this.viewportPadding;
    }

    clampValue(value, min, max) {
        if (max < min) return min;
        return Math.min(Math.max(value, min), max);
    }

    constrainWindowToVerticalBounds(element) {
        if (!element) return;

        const safeTopY = this.getSafeTopY();
        const safeBottomY = this.getSafeBottomY();
        const availableHeight = Math.max(0, safeBottomY - safeTopY);

        if (availableHeight <= 0) return;

        // Ensure window never exceeds the vertical space between panel and dock.
        // Clear any earlier limit first so the window can grow again after rotating.
        element.style.height = '';
        element.style.maxHeight = `${availableHeight}px`;

        if (element.offsetHeight > availableHeight) {
            element.style.height = `${availableHeight}px`;
        }
    }

    clampWindowToViewport(element) {
        if (!element || element.style.display === 'none') return;

        this.constrainWindowToVerticalBounds(element);
        const safeTopY = this.getSafeTopY();
        const safeBottomY = this.getSafeBottomY();
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        const isCentered = this.isCenteredWindow(element);

        if (isCentered) {
            const rect = element.getBoundingClientRect();
            let centerX = rect.left + rect.width / 2;
            let centerY = rect.top + rect.height / 2;

            // A window too wide for the side padding (full-width on phones) just stays centred.
            centerX = width + this.viewportPadding * 2 >= window.innerWidth
                ? window.innerWidth / 2
                : this.clampValue(
                    centerX,
                    this.viewportPadding + width / 2,
                    window.innerWidth - this.viewportPadding - width / 2
                );
            centerY = this.clampValue(
                centerY,
                safeTopY + height / 2,
                safeBottomY - height / 2
            );

            element.style.left = `${centerX}px`;
            element.style.top = `${centerY}px`;
            element.style.transform = 'translate(-50%, -50%)';

            const viewportCenterX = window.innerWidth / 2;
            const viewportCenterY = window.innerHeight / 2;
            element._xOffset = centerX - viewportCenterX;
            element._yOffset = centerY - viewportCenterY;
            return;
        }

        const { minX, maxX, minY, maxY } = this.freeWindowBounds(element, width, height);
        const clampedX = this.clampValue(element._xOffset || 0, minX, maxX);
        const clampedY = this.clampValue(element._yOffset || 0, minY, maxY);
        this.setFreeOffset(element, clampedX, clampedY);
    }

    /**
     * Offsets a free (top-left anchored) window may move to while staying inside the viewport
     * and above the dock. Offsets are relative to the element's CSS left/top.
     */
    freeWindowBounds(element, width, height) {
        const left = parseFloat(getComputedStyle(element).left) || 0;
        const top = parseFloat(getComputedStyle(element).top) || 0;
        return {
            minX: this.viewportPadding - left,
            maxX: window.innerWidth - this.viewportPadding - left - width,
            minY: this.getSafeTopY() - top,
            maxY: this.getSafeBottomY() - top - height,
        };
    }

    /** Stores a free window's offset and applies it as the transform. */
    setFreeOffset(element, x, y) {
        element._xOffset = x;
        element._yOffset = y;
        element.style.transform = `translate(${x}px, ${y}px)`;
    }

    makeDraggable(element) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        const isCentered = this.isCenteredWindow(element);
        let xOffset = element._xOffset || 0;
        let yOffset = element._yOffset || 0;

        const header = element.querySelector('.window-header');
        if (!header) return;

        const dragStart = (e) => {
            // Don't start dragging if clicking on control buttons
            if (e.target.closest('.control')) {
                return;
            }

            if (e.target === header || header.contains(e.target)) {
                if (isCentered) {
                    const rect = element.getBoundingClientRect();
                    const elementCenterX = rect.left + rect.width / 2;
                    const elementCenterY = rect.top + rect.height / 2;

                    if (xOffset === 0 && yOffset === 0) {
                        const centerX = window.innerWidth / 2;
                        const centerY = window.innerHeight / 2;
                        xOffset = elementCenterX - centerX;
                        yOffset = elementCenterY - centerY;
                        element._xOffset = xOffset;
                        element._yOffset = yOffset;
                    }

                    initialX = e.clientX;
                    initialY = e.clientY;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                isDragging = true;
            }
        };

        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();

                if (isCentered) {
                    const deltaX = e.clientX - initialX;
                    const deltaY = e.clientY - initialY;

                    xOffset += deltaX;
                    yOffset += deltaY;

                    element._xOffset = xOffset;
                    element._yOffset = yOffset;

                    const centerX = window.innerWidth / 2;
                    const centerY = window.innerHeight / 2;
                    const safeTopY = this.getSafeTopY();
                    const safeBottomY = this.getSafeBottomY();
                    const halfWidth = element.offsetWidth / 2;
                    const halfHeight = element.offsetHeight / 2;

                    const minCenterX = this.viewportPadding + halfWidth;
                    const maxCenterX = window.innerWidth - this.viewportPadding - halfWidth;
                    const minCenterY = safeTopY + halfHeight;
                    const maxCenterY = safeBottomY - halfHeight;

                    const newLeft = this.clampValue(centerX + xOffset, minCenterX, maxCenterX);
                    const newTop = this.clampValue(centerY + yOffset, minCenterY, maxCenterY);

                    xOffset = newLeft - centerX;
                    yOffset = newTop - centerY;

                    element._xOffset = xOffset;
                    element._yOffset = yOffset;

                    element.style.top = `${newTop}px`;
                    element.style.left = `${newLeft}px`;
                    element.style.transform = 'translate(-50%, -50%)';

                    initialX = e.clientX;
                    initialY = e.clientY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    const { minX, maxX, minY, maxY } = this.freeWindowBounds(element, element.offsetWidth, element.offsetHeight);
                    xOffset = this.clampValue(currentX, minX, maxX);
                    yOffset = this.clampValue(currentY, minY, maxY);
                    this.setFreeOffset(element, xOffset, yOffset);
                }
            }
        };

        const dragEnd = () => {
            if (isDragging) {
                isDragging = false;
            }
        };

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        window.addEventListener('resize', () => {
            this.constrainWindowToVerticalBounds(element);
            this.clampWindowToViewport(element);
        });
    }

    setupWindowControls() {
        // Capture phase, so each control runs before the window's own click handlers.
        const bindControl = (selector, action) => {
            document.querySelectorAll(selector).forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    const windowElement = btn.closest('.window');
                    if (windowElement) action(windowElement);
                }, true);
            });
        };
        bindControl('.control.close', (windowElement) => this.close(windowElement, this.findDockItem(windowElement)));
        bindControl('.control.minimize', (windowElement) => this.minimize(windowElement));

        // Bring window to front when clicking content
        const windows = document.querySelectorAll('.window');
        windows.forEach(window => {
            const windowContent = window.querySelector('.window-content');
            if (windowContent) {
                windowContent.addEventListener('click', (e) => {
                    if (!e.target.closest('.control') && !e.target.closest('a')) {
                        this.bringToFront(window);
                    }
                });
            }
        });

        this.setupKeyboardAccess();
    }

    /** The dock item that opens this window, or null. */
    findDockItem(windowElement) {
        const dockItemId = DOCK_ITEM_BY_WINDOW[windowElement.id];
        return dockItemId ? document.getElementById(dockItemId) : null;
    }

    /**
     * Keyboard and screen reader access: labelled, focusable window controls,
     * window names for assistive tech, and Escape to close the top-most open window.
     */
    setupKeyboardAccess() {
        document.querySelectorAll('.window').forEach((windowElement) => {
            const title = windowElement.querySelector('.window-title');
            if (title && !windowElement.hasAttribute('aria-label')) {
                windowElement.setAttribute('aria-label', title.textContent.trim());
            }
        });

        document.querySelectorAll('.control.close, .control.minimize').forEach((control) => {
            control.setAttribute('role', 'button');
            control.setAttribute('tabindex', '0');
            const label = control.classList.contains('close') ? 'window.closeAria' : 'window.minimizeAria';
            control.setAttribute('aria-label', window.I18n?.t?.(label) ?? (control.classList.contains('close') ? 'close window' : 'minimize window'));
            control.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    control.click();
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape' || e.defaultPrevented) return;
            // Typing keeps Escape for the field (e.g. the terminal or a note).
            if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
            const openWindows = [...document.querySelectorAll('.window')]
                .filter((w) => w.style.display !== 'none');
            if (openWindows.length === 0) return;
            const zIndexOf = (w) => parseInt(getComputedStyle(w).zIndex, 10) || 0;
            const top = openWindows.reduce((a, b) => (zIndexOf(b) >= zIndexOf(a) ? b : a));
            this.close(top, this.findDockItem(top));
        });
    }
}

// Expose class constructor for testing
window.WindowManagerClass = WindowManager;

// Initialize window manager
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.WindowManager = new WindowManager();
    });
} else {
    window.WindowManager = new WindowManager();
}

window.bringToFront = function(windowElement) {
    if (window.WindowManager) {
        window.WindowManager.bringToFront(windowElement);
    }
};
