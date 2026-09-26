/**
 * Environment utilities – centralize host/API detection for local vs production.
 * Use isLocalhost() to choose direct API URLs (localhost) vs /api proxy (production).
 */
(function () {
    function isLocalhost() {
        const h = window.location.hostname;
        return h === 'localhost' || h === '127.0.0.1' || h === '';
    }

    function getApiBase(path) {
        return isLocalhost() ? null : '/api/' + path.replace(/^\//, '');
    }

    function matchesMedia(query) {
        return typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
    }

    function isNarrowViewport() {
        return matchesMedia('(max-width: 768px)');
    }

    function isCoarsePointer() {
        return matchesMedia('(pointer: coarse)');
    }

    function isConstrainedDevice() {
        return isNarrowViewport() || isCoarsePointer();
    }

    function shouldAutoOpenDesktopPanels() {
        return !isConstrainedDevice();
    }

    window.Env = {
        isLocalhost,
        getApiBase,
        matchesMedia,
        isNarrowViewport,
        isCoarsePointer,
        isConstrainedDevice,
        shouldAutoOpenDesktopPanels,
    };
})();
