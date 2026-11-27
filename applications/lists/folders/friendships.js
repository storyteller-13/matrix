/** Friendships folder and its nested zeitgeist awards episode list. */
export function friendshipsEntries(t) {
    return [
        {
            id: 'zeitgeist-awards-2026',
            label: t('menu.zeitgeist2026', 'zeitgeist awards 2026'),
            kind: 'folder',
            gold: true,
            menu: 'podcast-episodes',
            description: {
                key: 'lists.friendshipsZeitgeistNote',
                fallback: '(the top conversations i kept carrying with me long after they ended)',
            },
            getEntries: friendshipsZeitgeistEntries,
        },
    ];
}

export function friendshipsZeitgeistEntries() {
    return (window.PODCAST_EPISODES || []).map((episode) => ({
        id: episode.id,
        label: episode.title,
        kind: 'podcast',
        open: () => window.openPodcastWindow?.({ title: episode.title, videoId: episode.videoId }),
    }));
}
