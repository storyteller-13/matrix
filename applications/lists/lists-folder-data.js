/**
 * Lists folder content: the folder tree and the entries inside each folder.
 * Pure data with label lookups. The lists window (lists-folder.js) renders it, and the
 * terminal and the top-left menu read the same tree.
 *
 * Every function takes `t(key, fallback)`, the translator the window passes in.
 */

/** Entries of the top-level folders. */
export function rootFolderEntries(t) {
    return [
        { id: 'movies', label: t('menu.listsMovies', 'movies'), kind: 'folder' },
        { id: 'books', label: t('menu.listsBooks', 'books'), kind: 'folder' },
        { id: 'adventures', label: t('menu.listsPlaces', 'adventures'), kind: 'folder' },
        { id: 'games', label: t('menu.listsGames', 'games'), kind: 'folder' },
        { id: 'podcasts', label: t('menu.listsPodcasts', 'podcasts'), kind: 'folder' },
        { id: 'nutrition', label: t('menu.listsNutrition', 'nutrition'), kind: 'folder', empty: true },
        { id: 'art', label: t('menu.listsArt', 'art'), kind: 'folder', empty: true },
        { id: 'science', label: t('menu.listsScience', 'science'), kind: 'folder', empty: true },
    ];
}

/** Entries inside a folder; folders without content return []. */
export function folderEntries(folderId, t) {
    const tables = {
        'books': booksEntries,
        'movies': moviesEntries,
        'games': gamesEntries,
        'podcasts': podcastsEntries,
        'adventures': adventuresEntries,
        'my-guides': myGuidesEntries,
        'zeitgeist-awards-2026': podcastsZeitgeistEntries,
    };
    const table = Object.hasOwn(tables, folderId) ? tables[folderId] : null;
    return table ? table(t) : [];
}

/** Opens a list in the books window; resolved at call time so the window can load later. */
const listEntry = (id, label, extra = {}) => ({
    id,
    label,
    kind: 'list',
    ...extra,
    open: () => window.openBooksWindow?.(id),
});

function booksEntries(t) {
    return [
        listEntry('books-2026', t('menu.books2026', 'books i read in 2026')),
        listEntry('books-2027', t('menu.books2027', 'books i read in 2027')),
        listEntry('kids-books', t('menu.kidsBooks', 'books our kids should read')),
        listEntry('books-backlog', t('menu.booksBacklog', 'my endless ever-changing backlog')),
    ];
}

function moviesEntries(t) {
    const movie = { icon: 'movie' };
    return [
        listEntry('zeitgeist-2026', t('menu.zeitgeist2026', 'zeitgeist awards 2026'), { ...movie, gold: true }),
        listEntry('kids-movies', t('menu.kidsMovies', 'movies to watch with our kids'), movie),
        listEntry('strangers-friendship-movies', t('menu.strangersFriendshipMovies', 'movies about friendship among strangers'), movie),
        listEntry('winter-movies', t('menu.winterMovies', 'classic american movies for the winter holiday'), movie),
        listEntry('seventh-art-top-10', t('menu.seventhArtTop10', "2025's top 10 movies"), movie),
        listEntry('seventh-art-supplementary', t('menu.seventhArtSupplementary', "2025's must watch list"), movie),
        listEntry('zombie-favorites-2025', t('menu.zombieFavorites2025', "2025's zombie favorites"), movie),
        listEntry('vampire-favorites-2025', t('menu.vampireFavorites2025', "2025's vampire favorites"), movie),
        listEntry('seventh-art-canonical', t('menu.seventhArtCanonical', "2025's favorite movies of all time"), movie),
    ].sort((a, b) => a.label.length - b.label.length);
}

function gamesEntries(t) {
    const game = { icon: 'game' };
    return [
        listEntry('games-youth', t('menu.gamesYouth', 'the videogames of my youth'), game),
        listEntry('games-try-someday', t('menu.gamesTrySomeday', 'games i want to try someday'), game),
    ];
}

function adventuresEntries(t) {
    return [
        { id: 'my-guides', label: t('menu.myGuides', 'my guides'), kind: 'folder' },
        listEntry('bucket-list', t('menu.bucketList', 'my bucket list'), { icon: 'pin' }),
        listEntry('cities-lived', t('menu.citiesLived', 'cities i have lived'), { icon: 'home' }),
        listEntry('countries-explored', t('menu.countriesExplored', 'countries i have explored'), { icon: 'globe' }),
    ];
}

function myGuidesEntries(t) {
    const map = { icon: 'map' };
    return [
        listEntry('guide-alagoas', t('menu.guideAlagoas', 'alagoas, brazil'), map),
        listEntry('guide-iceland', t('menu.guideIceland', 'reykjavík, iceland'), map),
        listEntry('guide-berlin', t('menu.guideBerlin', 'berlin, germany'), map),
    ];
}

function podcastsEntries(t) {
    return [
        {
            id: 'zeitgeist-awards-2026',
            label: t('menu.zeitgeist2026', 'zeitgeist awards 2026'),
            kind: 'folder',
            gold: true,
        },
    ];
}

/** One entry per episode; the podcast player is loaded globally by its own module. */
function podcastsZeitgeistEntries() {
    return (window.PODCAST_EPISODES || []).map((episode) => ({
        id: episode.id,
        label: episode.title,
        kind: 'podcast',
        open: () => window.openPodcastWindow?.({ title: episode.title, videoId: episode.videoId }),
    }));
}
