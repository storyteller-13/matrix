/**
 * Window Manager
 * Handles window lifecycle, dragging, z-index management, and window controls
 */
class WindowManager {
    constructor() {
        this.highestZIndex = 100;
        this.viewportPadding = 12;
        this.dockClearance = 8;
        this.init();
    }

    isCenteredWindow(el) {
        return el && (el.classList.contains('terminal-window') ||
            el.classList.contains('artwork-window') ||
            el.classList.contains('notes-letter-window'));
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
        windowElement.style.display = 'block';
        windowElement.style.opacity = '0';

        const isCentered = this.isCenteredWindow(windowElement);

        if (isCentered) {
            // Reset offsets to ensure window opens in center
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

        // Keep non-centered windows inside the viewport and above the dock.
        // Centered windows intentionally retain top/left 50% on open.
        if (!isCentered) {
            requestAnimationFrame(() => {
                this.clampWindowToViewport(windowElement);
            });
        }
    }

    close(windowElement, dockItem = null) {
        if (!windowElement) return;

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
        return dockRect.top;
    }

    getSafeTopY() {
        const topPanel = document.querySelector('.top-panel');
        if (!topPanel) return this.viewportPadding;

        const panelRect = topPanel.getBoundingClientRect();
        return panelRect.bottom;
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

            centerX = this.clampValue(
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

        const left = parseFloat(getComputedStyle(element).left) || 0;
        const top = parseFloat(getComputedStyle(element).top) || 0;
        const xOffset = element._xOffset || 0;
        const yOffset = element._yOffset || 0;

        const minX = this.viewportPadding - left;
        const maxX = window.innerWidth - this.viewportPadding - left - width;
        const minY = safeTopY - top;
        const maxY = safeBottomY - top - height;

        const clampedX = this.clampValue(xOffset, minX, maxX);
        const clampedY = this.clampValue(yOffset, minY, maxY);

        element._xOffset = clampedX;
        element._yOffset = clampedY;
        element.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
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

                    const left = parseFloat(getComputedStyle(element).left) || 0;
                    const top = parseFloat(getComputedStyle(element).top) || 0;
                    const width = element.offsetWidth;
                    const height = element.offsetHeight;
                    const safeTopY = this.getSafeTopY();
                    const safeBottomY = this.getSafeBottomY();

                    const minX = this.viewportPadding - left;
                    const maxX = window.innerWidth - this.viewportPadding - left - width;
                    const minY = safeTopY - top;
                    const maxY = safeBottomY - top - height;

                    xOffset = this.clampValue(currentX, minX, maxX);
                    yOffset = this.clampValue(currentY, minY, maxY);

                    element._xOffset = xOffset;
                    element._yOffset = yOffset;

                    element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
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
        // Close buttons
        const closeButtons = document.querySelectorAll('.control.close');
        closeButtons.forEach(btn => {
            // Use capture phase to ensure this runs first
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const window = btn.closest('.window');
                if (window) {
                    // Find associated dock item
                    const windowId = window.id;
                    let dockItem = null;

                    // Map window IDs to dock item IDs
                    const dockItemMap = {
                        'todo-window': 'todo-dock-item',
                        'home-window': 'home-dock-item',
                        'terminal-window': 'terminal-dock-item',
                        'artwork-window': 'artwork-dock-item',
                        'notes-window': 'notes-dock-item'
                    };

                    const dockItemId = dockItemMap[windowId];
                    if (dockItemId) {
                        dockItem = document.getElementById(dockItemId);
                    }

                    this.close(window, dockItem);
                }
            }, true); // Use capture phase
        });

        // Minimize buttons
        const minimizeButtons = document.querySelectorAll('.control.minimize');
        minimizeButtons.forEach(btn => {
            // Use capture phase to ensure this runs first
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const window = btn.closest('.window');
                if (window) {
                    this.minimize(window);
                }
            }, true); // Use capture phase
        });

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
    }
}

// Expose class constructor for testing
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
