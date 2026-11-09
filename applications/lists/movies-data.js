/**
 * Zeitgeist Awards 2026 – movie award categories.
 *
 * To reveal winners, fill each category's `movies` in rank order, e.g.
 * movies: [{ title: 'movie title (director, year)', url: '', comment: 'a one-liner of my thoughts' }]
 * Empty slots render as blank numbered rows up to `size`.
 */

const ZEITGEIST_2026 = {
    title: 'zeitgeist awards 2026',
    shareId: 'zeitgeist-2026',
    layout: 'awards',
    subtitle: '(the stories that were part of my life this year)',
    categories: [
            {
                id: 'story-of-2026',
                emoji: '🎞️',
                label: 'the tales that told the story of 2026',
                size: 10,
                movies: [
                    { title: 'the shawshank redemption (frank darabont, 1994)', url: '', comment: 'hope is a good thing, maybe the best of things.' },
                    { title: 'project hail mary (phil lord & christopher miller, 2026)', url: '', comment: 'a rocky friendship across the stars.' },
                    { title: 'the odyssey (christopher nolan, 2026)', url: '', comment: 'the long, long, long way home...' },
                    { title: 'alice in borderland (shinsuke sato, 2020)', url: '', comment: 'felt like a mirror of my year.' },
                    { title: 'exit 8 (genki kawamura, 2026)', url: '', comment: 'felt like the story of my life.' },
                    { title: 'obsession (curry barker, 2026)', url: '', comment: 'when selfish desires destroy lives.' },
                    { title: 'the east palace (lee jong-pil, 2026)', url: '', comment: 'palace walls hiding secrets.' },
                    { title: 'something bad is going to happen (weronika tofilska, 2026)', url: '', comment: 'again, felt like the mirror of my year.' },
                    { title: 'escape from alcatraz (don siegel, 1979)', url: '', comment: 'the patient dream of freedom.' },
                    { title: 'atlas shrugged trilogy (various directors, 2011–2014)', url: '', comment: 'i found out who john galt is.' },
                ],
            },
            {
                id: 'whimsical',
                emoji: '🦋',
                label: 'the most whimsical tales',
                size: 5,
                movies: [
                    { title: 'mother mary (david lowery, 2026)', url: '', comment: 'the fairy tale we needed.' },
                    { title: 'klara and the sun (taika waititi, 2026)', url: '', comment: 'pure sunshine cuteness.' },
                    { title: 'good omens (S3 grand finale) (rachel talalay, 2026)', url: '', comment: 'an angel, a demon and the sweetest goodbye.' },
                    { title: 'ghosts S1 (trent o\'donnell, 2021)', url: '', comment: 'the most adorable deceased friends one could ever have.' },
                    { title: 'marty supreme (josh safdie, 2026)', url: '', comment: 'the funny anti-hero we needed.' },
                    
                ],
            },
            {
                id: 'brave-new-world',
                emoji: '🌌',
                label: 'the most "brave new world" tales',
                size: 5,
                movies: [
                    { title: 'the dog stars (ridley scott, 2026)', url: '', comment: 'a beautiful friendship at the end of the world' },
                    { title: 'dark matter (various directors, 2024)', url: '', comment: 'every door is a life you didn\'t live.' },
                    { title: 'silo (various directors, 2026)', url: '', comment: 'never trust anyone who tells you not to go outside.' },
                    { title: 'gattaca (andrew niccol, 1997)', url: '', comment: 'ethan hawke is meritocracy.' },
                    { title: 'the great flood (kim byung-woo, 2026)', url: '', comment: 'the end of the world, but in bytes.' },
                ],
            },
            {
                id: 'date-night',
                emoji: '💞',
                label: 'the best tales to watch with the special one',
                size: 5,
                movies: [
                    { title: 'chocolat (lasse hallström, 2000)', url: '', comment: 'sweetness that can melt a whole village.' },
                    { title: 'passengers (morten tyldum, 2016)', url: '', comment: 'waking up early never looked this fun.' },
                    { title: 'eternity (david freyne, 2025)', url: '', comment: 'a tough choice that lasts foreveeeer.' },
                    { title: 'the lake house (alejandro agresti, 2006)', url: '', comment: 'love letters and time travel.' },
                    { title: 'pride & prejudice (joe wright, 2005)', url: '', comment: 'the hand flex.' },
                ],
            },
            {
                id: 'monsters',
                emoji: '👹',
                label: 'the most terrifying monsters',
                size: 5,
                movies: [
                    { title: 'resident evil (zach cregger, 2026)', url: '', comment: 'horror movies the way they should be done: i got scared several times!' },
                    { title: 'hokum (damian mccarthy, 2026)', url: '', comment: 'we love seeing squares being scared in old inns!' },
                    { title: '28 years later (danny boyle, 2026)', url: '', comment: 'my favorite zombie series ever; just keep \'em coming!' },
                    { title: 'undertone (ian tuason, 2026)', url: '', comment: 'i got scared several times, too.' },
                    { title: 'the end of oak street (david robert mitchell, 2025)', url: '', comment: 'just dinosaurs and parallel universes.' },
                    { title: 'bonus: colony (yeon sang-ho, 2026)', url: '', comment: 'sang-ho is back, now with horror collective intelligence inside a mall.' },
                ],
            },
            {
                id: 'heroes',
                emoji: '🦸',
                label: 'the most inspiring heroes',
                size: 5,
                movies: [
                    { title: 'apex (baltasar kormákur, 2026)', url: '', comment: 'damn, she is so hot.' },
                    { title: 'disclosure day (steven spielberg, 2026)', url: '', comment: 'spielberg gives us another good one.' },
                    { title: 'supergirl (craig gillespie, 2026)', url: '', comment: 'just cute and the right amount of girly.' },
                    { title: 'f1 (joseph kosinski, 2025)', url: '', comment: 'two words: brad pitt.' },
                    { title: 'legally blonde (robert luketic, 2001)', url: '', comment: 'what, like it\'s hard? (story of my life)' },
                ],
            },
    ],
};

window.ZEITGEIST_2026 = ZEITGEIST_2026;

/**
 * Movies to watch with our kids – unranked, grouped by era, oldest first.
 * Entry format: 'title (director, year)'.
 */
const KIDS_MOVIES = {
    title: 'movies to watch with our kids',
    shareId: 'kids-movies',
    categories: [
        {
            id: 'golden-classics',
            label: 'the golden classics',
            ranked: false,
            movies: [
                { title: 'the wizard of oz (victor fleming, 1939)' },
                { title: 'mary poppins (robert stevenson, 1964)' },
                { title: 'the sound of music (robert wise, 1965)' },
            ],
        },
        {
            id: 'seventies-eighties',
            label: 'the 70s & 80s',
            ranked: false,
            movies: [
                { title: 'the muppet movie (james frawley, 1979)' },
                { title: 'e.t. the extra-terrestrial (steven spielberg, 1982)' },
                { title: 'the neverending story (wolfgang petersen, 1984)' },
                { title: 'the goonies (richard donner, 1985)' },
                { title: 'the princess bride (rob reiner, 1987)' },
                { title: 'honey, i shrunk the kids (joe johnston, 1989)' },
                { title: 'kiki\'s delivery service (hayao miyazaki, 1989)' },
            ],
        },
        {
            id: 'nineties',
            label: 'the 90s',
            ranked: false,
            movies: [
                { title: 'home alone (chris columbus, 1990)' },
                { title: 'the lion king (roger allers & rob minkoff, 1994)' },
                { title: 'a little princess (alfonso cuarón, 1995)' },
                { title: 'toy story i, ii & iii (john lasseter et al., 1995)' },
                { title: 'matilda (danny devito, 1996)' },
            ],
        },
        {
            id: 'two-thousands',
            label: 'the 2000s',
            ranked: false,
            movies: [
                { title: 'harry potter and the sorcerer\'s stone (chris columbus, 2001)' },
                { title: 'spirited away (hayao miyazaki, 2001)' },
                { title: 'shrek (andrew adamson & vicky jenson, 2001)' },
                { title: 'monsters, inc. (pete docter & david silverman, 2001)' },
                { title: 'finding nemo (andrew stanton, 2003)' },
                { title: 'madagascar (eric darnell & tom mcgrath, 2005)' },
                { title: 'up (pete docter & bob peterson, 2009)' },
                { title: 'how to train your dragon (chris sanders & dean deblois, 2010)' },
            ],
        },
    ],
};

window.KIDS_MOVIES = KIDS_MOVIES;

/**
 * Classic american movies for the winter holiday – a simple unranked list.
 */
const WINTER_MOVIES = {
    title: 'classic american movies for the winter holiday',
    shareId: 'winter-movies',
    backlog: [
        { title: 'it\'s a wonderful life (frank capra, 1946)' },
        { title: 'miracle on 34th street (george seaton, 1947)' },
        { title: 'a charlie brown thanksgiving (bill melendez, 1973)' },
        { title: 'little women (greta gerwig, 2019)' },
        { title: 'scent of a woman (martin brest, 1992)' },
        { title: 'home for the holidays (jodie foster, 1995)' },
    ],
};

window.WINTER_MOVIES = WINTER_MOVIES;
