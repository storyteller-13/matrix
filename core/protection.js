/**
 * Basic client-side protection
 * NOTE: This cannot fully prevent source code viewing - it only makes it harder.
 * Determined users can always bypass these protections.
 */
(function() {
    'use strict';

    // Keyboard shortcuts to block (each returns true when the shortcut is pressed)
    const BLOCKED_SHORTCUTS = [
        (e) => e.key === 'F12',
        (e) => e.ctrlKey && e.shiftKey && e.key === 'I',   // DevTools
        (e) => e.ctrlKey && e.shiftKey && e.key === 'J',   // Console
        (e) => e.ctrlKey && e.shiftKey && e.key === 'C',   // Element Inspector
        (e) => e.ctrlKey && e.key === 'u',                  // View Source
        (e) => e.ctrlKey && e.key === 's'                  // Save Page
    ];

    /**
     * Prevents right-click context menu
     */
    function preventContextMenu() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    }

    /**
     * Prevents common developer keyboard shortcuts
     */
    function preventKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if (BLOCKED_SHORTCUTS.some(function(check) { return check(e); })) {
                e.preventDefault();
            }
        });
    }

    /**
     * Prevents image dragging
     */
    function preventImageDragging() {
        document.addEventListener('dragstart', function(e) {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });
    }

    // Initialize all protection features
    preventContextMenu();
    preventKeyboardShortcuts();
    preventImageDragging();
})();
