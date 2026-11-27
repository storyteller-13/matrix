/**
 * Builds the top-left "my curated lists" menu from the lists folder data, so every list appears
 * without hand-maintained markup. Labels come from the same entries the lists window shows.
 */

/** Top-level order of the menu. Folders not named here are left out of the menu. */
export const MENU_ORDER = ['books', 'movies', 'friendships', 'games', 'adventures', 'sublime', 'science', 'art'];

const separator = () => {
    const node = document.createElement('div');
    node.className = 'menu-separator';
    return node;
};

const textSpan = (className, text) => {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = text;
    return span;
};

const iconSpan = (svg) => {
    const span = document.createElement('span');
    span.className = 'menu-item-icon';
    // Icon markup comes from the lists app's own SVG helpers, never from user input.
    span.innerHTML = svg;
    return span;
};

function leafButton(label, action, arg, svg) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'menu-item';
    button.dataset.action = action;
    button.dataset.arg = arg;
    button.append(iconSpan(svg), textSpan('menu-item-text', label));
    return button;
}

function submenuItem(label, svg) {
    const item = document.createElement('div');
    item.className = 'menu-item menu-item-has-submenu';
    item.tabIndex = 0;
    item.append(iconSpan(svg), textSpan('menu-item-text', label), textSpan('menu-submenu-arrow', '›'));
    item.lastChild.setAttribute('aria-hidden', 'true');
    return item;
}

/** One folder as a menu entry: a submenu when it has lists, a plain button when it is empty. */
function folderNode(entry, app) {
    const svg = app.folderSvg({ gold: entry.gold });
    if (entry.menu === 'podcast-episodes') {
        const item = submenuItem(entry.label, svg);
        const episodes = document.createElement('div');
        episodes.className = 'menu-submenu menu-submenu--scroll';
        episodes.id = 'podcast-menu-episodes';
        item.append(episodes);
        return item;
    }
    const children = app.entriesForFolder(entry.id).filter((child) => child.kind !== 'podcast');
    if (children.length === 0) {
        return leafButton(entry.label, 'openListsFolderWindow', entry.id, svg);
    }
    const item = submenuItem(entry.label, svg);
    const menu = document.createElement('div');
    menu.className = 'menu-submenu';
    fillSubmenu(menu, children, app);
    item.append(menu);
    return item;
}

function fillSubmenu(menu, entries, app) {
    entries.forEach((entry, i) => {
        if (i > 0) menu.append(separator());
        if (entry.kind === 'list') {
            menu.append(leafButton(entry.label, 'openBooksWindow', entry.id, app.listIconSvg(entry.icon, { gold: entry.gold })));
        } else {
            menu.append(folderNode(entry, app));
        }
    });
}

/** Replaces the container's contents with the menu for the app's current data and language. */
export function renderListsMenu(container, app) {
    const roots = app.rootEntries();
    const ordered = MENU_ORDER
        .map((id) => roots.find((entry) => entry.id === id))
        .filter(Boolean);
    container.replaceChildren();
    ordered.forEach((entry, i) => {
        if (i > 0) container.append(separator());
        container.append(folderNode(entry, app));
    });
}
