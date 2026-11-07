/**
 * Delegated click handling for markup controls.
 * <button data-action="openNotesWindow" data-arg="..."> calls window.openNotesWindow("...").
 * Replaces inline onclick attributes so the CSP can forbid inline script.
 * Apps that bind their own listener and stop propagation (BaseApp dock items) are not double-fired.
 */

(function () {
    function handleAction(e) {
        const el = e.target instanceof Element ? e.target.closest('[data-action]') : null;
        if (!el) return;
        const fn = window[el.dataset.action];
        if (typeof fn !== 'function') return;
        e.preventDefault();
        if (el.dataset.arg !== undefined) {
            fn(el.dataset.arg);
        } else {
            fn();
        }
    }

    document.addEventListener('click', handleAction);
    window.Actions = { handleAction };
})();
