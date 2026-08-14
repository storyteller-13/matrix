/**
 * Vitest setup – jsdom is configured in vitest.config.js
 */
// Ensure we have a minimal document body for tests that need DOM
if (typeof document !== 'undefined' && document.body && !document.body.innerHTML) {
    document.body.innerHTML = '<div id="app"></div>';
}
