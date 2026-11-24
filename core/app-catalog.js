/**
 * Every app that can be opened by name: the command palette, the terminal's `open`, and ?open= links.
 * `fn` is the window function on window that shows the app.
 */
export const APPS = [
    { id: 'about', label: 'about me', labelKey: 'app.about', fn: 'openAboutWindow' },
    { id: 'apod', label: 'astronomy picture of the day', labelKey: 'app.apod', fn: 'openApodWindow' },
    { id: 'artwork', label: 'artwork', labelKey: 'app.artwork', fn: 'openArtworkWindow' },
    { id: 'bird', label: 'bird of the day', labelKey: 'app.bird', fn: 'openBirdWindow' },
    { id: 'books', label: 'books', labelKey: 'app.books', fn: 'openBooksWindow' },
    { id: 'building', label: 'building', labelKey: 'app.building', fn: 'openBuildingWindow' },
    { id: 'calendar', label: 'calendar', labelKey: 'app.calendar', fn: 'openCalendarWindow' },
    { id: 'chess', label: 'chess puzzle', labelKey: 'app.chess', fn: 'openChessWindow' },
    { id: 'home', label: 'home', labelKey: 'app.home', fn: 'openHomeWindow' },
    { id: 'lists', label: 'my curated lists', labelKey: 'app.lists', fn: 'openListsFolderWindow', shown: 'lists-folder-window' },
    { id: 'music', label: 'music player', labelKey: 'app.music', fn: 'openSoundtrack' },
    { id: 'notes', label: 'reflections', labelKey: 'app.notes', fn: 'openNotesWindow', shown: 'notes-window' },
    { id: 'podcast', label: 'podcast', labelKey: 'app.podcast', fn: 'openPodcastWindow' },
    { id: 'quotes', label: 'quotes', labelKey: 'app.quotes', fn: 'openQuotesWindow', shown: 'quotes-box' },
    { id: 'sky', label: "today's sky", labelKey: 'app.sky', fn: 'openSkyWindow' },
    { id: 'status', label: 'status', labelKey: 'app.status', fn: 'openStatusWindow' },
    { id: 'terminal', label: 'terminal', labelKey: 'app.terminal', fn: 'openTerminalWindow', shown: 'terminal-window' },
    { id: 'todo', label: 'todo', labelKey: 'app.todo', fn: 'openTodoWindow', shown: 'todo-window' },
];

/** Apps whose window function takes an item id (a book list, a lists folder, a podcast episode). */
const TAKES_ITEM = new Set(['books', 'lists', 'podcast']);

/** Window function name for an app id, or undefined. */
export const appFunction = (id) => APPS.find((app) => app.id === id)?.fn;

/**
 * Opens an app, or does nothing when its window is already showing. The window functions
 * toggle some panels, so opening an open panel would close it. Returns false for unknown apps.
 */
export function openApp(id, item, { win = window, doc = document } = {}) {
    const app = APPS.find((entry) => entry.id === id);
    const fn = app && win[app.fn];
    if (typeof fn !== 'function') return false;
    if (app.shown) {
        const element = doc.getElementById(app.shown);
        if (element && win.getComputedStyle(element).display !== 'none') return true;
    }
    if (item !== undefined && TAKES_ITEM.has(id)) fn(item);
    else fn();
    return true;
}
