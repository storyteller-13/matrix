/**
 * Environment utilities – centralize host/API detection for local vs production.
 * Use isLocalhost() to choose direct API URLs (localhost) vs /api proxy (production).
 */
(function () {
    function isLocalhost() {
        if (typeof window === 'undefined') return false;
        const h = window.location.hostname;
        return h === 'localhost' || h === '127.0.0.1' || h === '';
    }

    function getApiBase(path) {
        return isLocalhost() ? null : '/api/' + path.replace(/^\//, '');
    }

    window.Env = { isLocalhost, getApiBase };
})();
