/**
 * Zeitgeist Awards 2026 – movie award categories. Winners are revealed on Thanksgiving.
 *
 * To reveal winners, fill each category's `movies` in rank order, e.g.
 * movies: [{ title: 'movie title (director)', url: '' }]
 * Empty slots render as blank numbered rows up to `size`.
 */

const ZEITGEIST_2026 = {
    title: 'zeitgeist awards 2026',
    shareId: 'zeitgeist-2026',
    subtitle: 'winners will be revealed on thanksgiving',
    categories: [
        { id: 'story-of-2026', label: '10 movies that told the story of 2026', size: 10, movies: [] },
        { id: 'whimsical', label: 'the 5 most whimsical stories', size: 5, movies: [] },
        { id: 'brave-new-world', label: 'the 5 most brave new world stories', size: 5, movies: [] },
        { id: 'special-someone', label: 'the 5 stories to watch with your special someone', size: 5, movies: [] },
        { id: 'monsters', label: 'the 5 best monsters', size: 5, movies: [] },
        { id: 'heroes', label: 'the 5 greatest heroes', size: 5, movies: [] },
    ],
};

window.ZEITGEIST_2026 = ZEITGEIST_2026;
