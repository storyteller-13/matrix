/**
 * Vitest setup – jsdom is configured in vitest.config.js
 */
// Ensure we have a minimal document body for tests that need DOM
if (typeof document !== 'undefined' && document.body && !document.body.innerHTML) {
    document.body.innerHTML = '<div id="app"></div>';
}

// jsdom has no canvas implementation and logs "not implemented" on every getContext() call.
// Return null (what jsdom already returns) without the noise; tests that need a context spy on it.
if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = () => null;
}
