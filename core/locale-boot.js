/**
 * Runs before first paint (classic script in <head>) so a saved Japanese
 * locale applies its font/lang before the page renders.
 */
(function () {
    try {
        if (localStorage.getItem('matrix-locale') === 'ja') {
            document.documentElement.lang = 'ja';
            document.documentElement.classList.add('locale-ja');
        }
    } catch (e) {}
})();
