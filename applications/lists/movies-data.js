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
