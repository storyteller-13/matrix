/**
 * My travel guides – one list per place: short guides as region columns, long ones as sections.
 * Entry format: { title, note? }; a category can carry a `note` (above its table) and a `footnote` (below it).
 */

const GUIDE_ALAGOAS = {
    title: 'alagoas, brazil',
    shareId: 'guide-alagoas',
    categories: [
        {
            id: 'north',
            label: '☀️ north — litoral norte',
            note: 'beautiful beaches, natural pools, and coastal destinations.',
            ranked: false,
            places: [
                { title: 'japaratinga' },
                { title: 'maragogi' },
            ],
        },
        {
            id: 'maceio-nightlife',
            label: '🌊 near maceió — bars & nightlife',
            ranked: false,
            places: [
                { title: 'baba som' },
                { title: 'lord nelson' },
                { title: 'el portenho' },
                { title: 'rex bar' },
            ],
        },
        {
            id: 'maceio-food',
            label: '🌊 near maceió — restaurants & beach clubs',
            ranked: false,
            places: [
                { title: 'maria bonita' },
                { title: 'coque\'nut', note: 'visit the pajuçara natural pools.' },
                { title: 'kanoa beach club', note: '' },
            ],
        },
        {
            id: 'south',
            label: '🏝️ south — litoral sul',
            note: 'beaches & coastal destinations.',
            ranked: false,
            places: [
                { title: 'barra de são miguel' },
                { title: 'praia do gunga' },
                { title: 'coruripe' },
            ],
        },
        {
            id: 'xingo',
            label: '🚤 xingó & rio são francisco',
            note: 'a romantic boat trip through the beautiful landscapes of the são francisco river.',
            footnote: 'regional note: the xingó canyon boat tours depart from the são francisco river region, around piranhas and canindé de são francisco.',
            ranked: false,
            places: [
                { title: 'cânions do xingó' },
                { title: 'rio são francisco' },
                { title: 'catamaran boat tour' },
                { title: 'piranhas, alagoas', note: 'a charming historic town near the sergipe border.' },
            ],
        },
    ],
};

window.GUIDE_ALAGOAS = GUIDE_ALAGOAS;

/**
 * Long-form guides render as full-width sections instead of columns.
 * Section format: { label, place?, paragraphs?, details?: [{ label, value, url? }],
 * table?: { columns, rows }, lists?: [{ heading?, items }], tip? }.
 */
const GUIDE_ICELAND = {
    title: 'iceland',
    shareId: 'guide-iceland',
    subtitle: '✨ witchcraft & sorcery spots in iceland ✨',
    intro: '(iceland has a deeply fascinating — and surprisingly male-dominated — history of witchcraft and sorcery)',
    sections: [
        {
            id: 'museum',
            label: '🧙 the museum of icelandic sorcery and witchcraft',
            place: 'hólmavík, westfjords',
            paragraphs: [
                'this privately operated museum in the coastal town of hólmavík is dedicated to the folklore and history of sorcery in iceland. first opened in june 2000, it contains permanent exhibitions on subjects like the nábrók (necropants), icelandic magical staves, the tilberi (a kind of milk-stealing demon), and icelandic grimoires.',
                'the most jaw-dropping artifact on display is the necropants — the dried skin of a man from the waist down, used in a powerful ritual believed to bring the sorcerer an endless supply of silver coins. the museum attracts over 15,000 visitors each year.',
            ],
            details: [
                { label: 'address', value: 'höfðagata 8-10, 510 hólmavík' },
                { label: 'hours', value: 'daily 12:00 pm – 6:00 pm' },
                { label: 'phone', value: '+354 897 6525' },
            ],
        },
        {
            id: 'cottage',
            label: '🏚️ the sorcerer\'s cottage',
            place: 'kaldrananes, bjarnarfjörður',
            paragraphs: [
                'located about 16 miles northeast of the main museum, the sorcerer\'s cottage is an off-site exhibition and a reconstruction of a 17th-century icelandic sorcerer\'s dwelling. it offers a glimpse into the daily life and living conditions of those accused of practicing magic during the witch trial era.',
            ],
            details: [
                { label: 'address', value: '643 kaldrananes, 510 iceland' },
                { label: 'phone', value: '+354 897 6525' },
            ],
        },
        {
            id: 'trekyllisvik',
            label: '🔥 trékyllisvík',
            place: 'strandir, westfjords',
            paragraphs: [
                'the witch craze in iceland is believed to have started here in 1654, when three men were burned at trékyllisvík in the strandir region of the westfjords. it\'s a remote and hauntingly beautiful coastal site — more of a pilgrimage for history enthusiasts than a tourist attraction, but deeply significant.',
            ],
        },
        {
            id: 'grabrok',
            label: '🌋 grábrók volcano',
            place: 'bifröst',
            paragraphs: [
                'grábrók volcano is steeped in icelandic folklore and considered a site of mystical significance in local magic and witchcraft, believed by tradition to harness the raw power of nature for divination and sorcery. it\'s also a great hike with panoramic views of the surrounding lava fields.',
            ],
            details: [
                { label: 'hours', value: 'open 24 hours' },
                { label: 'phone', value: '+354 437 2214' },
            ],
        },
        {
            id: 'history',
            label: '📜 the history behind it all',
            paragraphs: [
                'unlike the witch hunts of continental europe that primarily targeted women, icelandic sorcery was largely the domain of men, focused on practical applications, runic magic, and the crafting of powerful symbols known as galdrastafir.',
                'between 1625 and 1683, approximately 120 people were accused of sorcery in iceland, and a striking 90% of those executed were men — a complete reversal of the european norm.',
                'all witchcraft executions stopped in iceland after 1686, when denmark passed a law requiring all death sentences for sorcery to be confirmed by the high court in copenhagen, which then refused to confirm any more such verdicts.',
            ],
            tip: 'the westfjords are the heart of icelandic witch country — if you\'re planning a trip, the museum in hólmavík paired with the sorcerer\'s cottage makes for an unforgettable day.',
        },
        {
            id: 'midnight-sun',
            label: '🌅 the midnight sun',
            paragraphs: [
                'iceland\'s midnight sun is one of the most otherworldly natural phenomena you can witness — and it adds an eerie, magical dimension to any witchcraft-themed visit. during summer, the sun never fully sets, bathing the landscape in a golden, amber glow well past midnight. standing at a remote site like trékyllisvík or the sorcerer\'s cottage under a glowing 1 am sky is an experience that feels genuinely supernatural.',
            ],
            table: {
                caption: 'best times to experience it',
                columns: ['month', 'daylight hours', 'midnight sun?'],
                rows: [
                    ['june', '~24 hours', '✅ peak (around summer solstice, june 21)'],
                    ['july', '20–24 hours', '✅ strong'],
                    ['august', '15–20 hours', '⚠️ fading but still long'],
                    ['may', '18–22 hours', '✅ building up'],
                ],
            },
            details: [
                { label: 'peak midnight sun', value: 'around the summer solstice (june 20–22), the sun barely dips below the horizon in reykjavík — and in the westfjords further north, it may not set at all.' },
                { label: 'best overall travel window', value: 'late june to mid-july for the fullest midnight sun experience combined with open roads and accessible sites in the westfjords.' },
                { label: 'shoulder season (may & august)', value: 'still very long days with fewer crowds and lower accommodation prices.' },
            ],
            lists: [
                {
                    heading: 'practical tips',
                    items: [
                        'bring a sleep mask — hotel curtains are rarely enough.',
                        'the westfjords roads (particularly to hólmavík and trékyllisvík) can be rough; summer is the safest time to drive them.',
                        'the museum of sorcery and witchcraft extends its hours in summer: 10 am – 6 pm daily, making it easy to pair with a late-night midnight sun walk along the strandir coast.',
                    ],
                },
            ],
        },
    ],
};

window.GUIDE_ICELAND = GUIDE_ICELAND;

const GUIDE_BERLIN = {
    title: 'fun in berlin',
    shareId: 'guide-berlin',
    categories: [
        {
            id: 'museums',
            label: '🏛️ museums',
            ranked: false,
            places: [
                { title: 'dark matter' },
                { title: 'jewish museum' },
                { title: 'alte museum' },
                { title: 'alte gallery' },
                { title: 'bode museum' },
                { title: 'gemäldegalerie' },
                { title: 'hamburger bahnhof' },
                { title: 'fotografiska' },
                { title: 'museum für asiatische kunst' },
                { title: 'ethnologisches museum' },
                { title: 'neue nationalgalerie' },
                { title: 'khroma multimedia' },
                { title: 'käthe kollwitz museum' },
                { title: 'urban nation' },
            ],
        },
        {
            id: 'galleries',
            label: '🖼️ galleries & collections',
            ranked: false,
            places: [
                { title: 'sammlung boros' },
                { title: 'boros bunker' },
                { title: 'cfa gallery' },
                { title: 'contemporary fine arts' },
                { title: 'capitain petzel' },
                { title: 'könig galerie' },
                { title: 'kw institute' },
                { title: 'eigen + art' },
                { title: 'berliner künstlerprogramm' },
                { title: 'galerie buchholz' },
            ],
        },
        {
            id: 'food',
            label: '🍽️ food',
            ranked: false,
            places: [
                { title: 'kanaan' },
                { title: 'sironi' },
                { title: 'markthalle ix' },
            ],
        },
        {
            id: 'movies',
            label: '🎬 movies',
            ranked: false,
            places: [
                { title: 'kino intimes' },
                { title: 'ladenkino' },
                { title: 'babylon' },
                { title: 'shakespeare and sons' },
            ],
        },
        {
            id: 'spas',
            label: '🧖 spas',
            ranked: false,
            places: [
                { title: 'hotel oderberger' },
                { title: 'vabali' },
                { title: 'hamam berlin' },
                { title: 'liquidrom' },
                { title: 'lakana thaimassage' },
                { title: 'soho house gym' },
                { title: 'fontane therme' },
                { title: 'yi spa' },
                { title: 'waldorf astoria spa' },
            ],
        },
    ],
};

window.GUIDE_BERLIN = GUIDE_BERLIN;
