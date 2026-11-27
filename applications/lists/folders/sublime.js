/**
 * Sublime folder: top 13 things that make me smile (thanksgiving 2026).
 */
import { listEntry } from './list-entry.js';

/**
 * Top 13 things that make me smile (thanksgiving 2026) – ranked, first item first.
 */
const SMILE_TOP_10_2026 = {
    title: 'top 13 things that make me smile (thanksgiving 2026)',
    shareId: 'smile-top-10-2026',
    categories: [
        {
            label: 'top 13 things that make me smile (thanksgiving 2026)',
            ranked: true,
            hideHeading: true,
            books: [
                { title: 'wake up with the sun coming in through the window and birds singing, after a very good night of sleep, in a comfortable bed with comfortable pillows and blankets, and having had a very good dream' },
                { title: 'that first delicious, fresh, hot latte in the morning, right before i sit down at my desk to work' },
                { title: 'being able to work, learn something new every day, and have my fleet of agents working on multiple parallel problems without being sloppy' },
                { title: 'an unexpected moment of love or a fun interaction with friends, either irl or online (and being shielded from anyone who does not respect my humanity at this point in my life and career)' },
                { title: 'being in love with someone with a kind heart, who truly sees me and loves me for the rest of our lives' },
                { title: 'good music for every mood in life: rock, pop, jazz, classical, everything (just need to feel great)' },
                { title: 'watch a very good movie for the first time, and think about it for days afterward' },
                { title: 'read a very good book for the first time, and think about it for days afterward' },
                { title: 'look in the mirror and see how beautiful i am' },
                { title: 'go to a new art museum and find pieces that evoke some kind of emotion in my brain' },
                { title: 'spend a little time cleaning, organizing, and making my home feel beautiful, with candles, a good soundtrack, and good snacks' },
                { title: 'know that i am safe, that justice always prevails, and that the future is going to be amazing' },
                { title: 'delicious, fresh sushi' },
            ],
        },
    ],
};

window.SMILE_TOP_10_2026 = SMILE_TOP_10_2026;

export function sublimeEntries(t) {
    return [
        listEntry('smile-top-10-2026', t('menu.smileTop102026', 'top 13 things that make me smile (thanksgiving 2026)'), { icon: 'smile' }),
    ];
}
