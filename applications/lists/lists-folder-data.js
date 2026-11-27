/**
 * Lists folder tree: the root folders, and which folder file holds the entries inside each one.
 * The content of every folder lives in its own file under folders/, so no two folders share a file.
 *
 * Every function takes `t(key, fallback)`, the translator the window passes in.
 */
import { booksEntries } from './folders/books.js';
import { moviesEntries } from './folders/movies.js';
import { gamesEntries } from './folders/games.js';
import { adventuresEntries } from './folders/adventures.js';
import { friendshipsEntries } from './folders/friendships.js';
import { sublimeEntries } from './folders/sublime.js';

/** Entries of the top-level folders. */
export function rootFolderEntries(t) {
    return [
        { id: 'movies', label: t('menu.listsMovies', 'movies'), kind: 'folder', getEntries: moviesEntries },
        { id: 'books', label: t('menu.listsBooks', 'books'), kind: 'folder', getEntries: booksEntries },
        { id: 'adventures', label: t('menu.listsPlaces', 'adventures'), kind: 'folder', getEntries: adventuresEntries },
        { id: 'games', label: t('menu.listsGames', 'games'), kind: 'folder', getEntries: gamesEntries },
        { id: 'friendships', label: t('menu.listsFriendships', 'friendships'), kind: 'folder', getEntries: friendshipsEntries },
        { id: 'sublime', label: t('menu.listsSublime', 'sublime'), kind: 'folder', getEntries: sublimeEntries },
        { id: 'art', label: t('menu.listsArt', 'art'), kind: 'folder', empty: true },
        { id: 'science', label: t('menu.listsScience', 'science'), kind: 'folder', empty: true },
    ];
}

function findFolderEntry(entries, folderId, t) {
    for (const entry of entries) {
        if (entry.kind !== 'folder') continue;
        if (entry.id === folderId) return entry;
        const nested = findFolderEntry(entry.getEntries?.(t) || [], folderId, t);
        if (nested) return nested;
    }
    return null;
}

/** Finds a folder in the tree, including folders declared by their parent folder's data. */
export function folderEntry(folderId, t) {
    return findFolderEntry(rootFolderEntries(t), folderId, t);
}

/** Entries inside a folder; folders without content return []. */
export function folderEntries(folderId, t) {
    return folderEntry(folderId, t)?.getEntries?.(t) || [];
}
