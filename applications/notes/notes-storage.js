/**
 * Notes Storage Module
 * Supplies default notes entries (persistence is disabled).
 */
class NotesStorage {
    constructor() {
        this.storageKey = 'notes-entries';
    }

    load() {
        localStorage.removeItem(this.storageKey);
        const defaults = this.getDefaultEntries();
        return defaults.map(entry => this.normalizeEntry(entry));
    }

    normalizeEntry(entry) {
        return {
            id: entry.id || this.deriveStableId(entry) || this.generateId(),
            title: entry.title || '',
            content: entry.content || '',
            titleKey: entry.titleKey || undefined,
            contentKey: entry.contentKey || undefined,
            createdAt: entry.date || entry.createdAt || new Date().toISOString(),
            updatedAt: entry.updatedAt || null,
            read: entry.read || false,
            italic: entry.italic || false,
            asciiArt: entry.asciiArt || false
        };
    }

    /**
     * Prefer a stable share id: explicit id, notes.<slug>.* key, title slug, or date.
     */
    deriveStableId(entry) {
        if (!entry) return null;
        if (entry.titleKey) {
            const match = String(entry.titleKey).match(/^notes\.([^.]+)/);
            if (match) return match[1];
        }
        const fromTitle = this.slugify(entry.title);
        if (fromTitle) return fromTitle;
        const date = entry.date || entry.createdAt;
        if (date) {
            const day = String(date).slice(0, 10);
            if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return day;
        }
        return null;
    }

    slugify(text) {
        const slug = String(text || '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 64);
        return slug || null;
    }

    getDefaultEntries() {
        return [
            {
            id: 'prelude',
            date: '2026-09-28T00:00:00.000Z',
            titleKey: 'notes.prelude.title',
            contentKey: 'notes.prelude.content',
            title: 'prelude: this is d-day',
            content: this.cleanContent(`
hello again, my dear friends,

artists, poets, philosophers, youtubers, scientists, engineers
all of you who have entered my life when i needed angels,
and all of you who want to remain in my life now that i finally have my own wings.

(and to all those who decided to part ways, 
i want to give you my respectful goodbye, and thank you for everything)

there is so much i want to tell you,
and so much i want to show you.

things i've been building and dreaming about in secret.
all the things you grasp when you transcend,
when you finally raise the bar and become your final, best self.

when i look back at these last few years, and abstract my human ego as much as i can,
i see how this crime that happened to me could be translated as a huge quest to level up into what i always could have been, but nobody told me.

only after everything is stripped from you
do you realize that you can finally be who you really are, without excuses or fear.
and now that i know, i can be it all.

the big shift from the last events is that
i now understand the plot a little bit more.
(well, not all of it, but enough to really let the story go for good)

the big thing of the last few months is that
i have built so much. i have produced so much.
and i completely detached from old, outdated ideas.

and what before was a torture every day,
desperately trying to figure out what was going on,
has slowly turned into something else.
has turned into the final story of the past character.

i look at all my work.
all the influence i've had in the world.
the impact i've had on so many lives.
all the problems i've solved.
how much i know about so many things.
how cool and fun i am.

and i just think...
i am freaking awesome, i'm sorry =p

and, i don't know, man...
i'm kinda tired of all the drama...
not really my thing...
(i want to believe, mr. mulder)

what is my thing is that
i am the best engineer i've ever met.
i have built so many cool things.
i can build anything.
i can solve any problem.

i have never found a problem in my life that i couldn't solve by myself.
and usually in the most creative and clever way.
and i have so many achievements.

so, i think i will pass on the whole
“not being completely happy and awesome every single second” thing.

and whoever matches this energy:

i can't wait to meet you down the road
and have a million laughs together,
and watch sunsets and shining stars,
and dance and play and run and live.

and i cannot wait to show you the things i've been building in secret,
and the puzzles and art and fun i have planned for the future.
and all the things i will do that have never been done before.

so yes.
let's get this party ready.
this is d-day.

whoever wants to be in my world,
you gotta match this high energy.
and i promise you, it's going to be a ride for life.

<3

ps: the first story is coming in a few weeks, as you can check in the calendar.
and from now on, since i have already arrived at my destination,
i'll be continuing to work privately on my projects during the week,
and i'll be updating this matrix and my technical blog on weekends.
so you know.
            `)
            },

            {
            id: 'hello',
            date: '2026-08-02T00:00:00.000Z',
            titleKey: 'notes.hello.title',
            contentKey: 'notes.hello.content',
            title: 'hello starlit world',
            content: this.cleanContent(`
            i'm that cool scholar always creating the sublime...

            in the years ahead, as i continue to grow
            my career, home, family, and all my dreams,
            i'll be talking about good books, films, music, art,
            and all the beauties of this life; with you, here.

            i'll be documenting our journey and the party
            usually on friday nights or over the weekends.

            (starting at some point before halloween)
            (for now, enjoy my carefully curated little mixtapes)
                `)
            },

    ];
}

    /**
     * End of default entries; add new entries above.
     */
    cleanContent(content) {
        if (!content) return '';
        const lines = content.split('\n');
        while (lines.length > 0 && lines[0].trim() === '') {
            lines.shift();
        }
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
            lines.pop();
        }

        let minIndent = Infinity;
        for (const line of lines) {
            if (line.trim() === '') continue;
            const indent = line.match(/^\s*/)[0].length;
            if (indent < minIndent) {
                minIndent = indent;
            }
        }

        const cleanedLines = lines.map(line => {
            if (line.trim() === '') return '';
            return line.substring(minIndent);
        });

        return cleanedLines
            .join('\n')
            .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
            .trim();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    formatDate(date) {
        if (!date) return '';

        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[d.getDay()];
        let day = dayName;
        if (window.I18n) {
            const translated = window.I18n.t(`notes.weekday.${dayName}`);
            if (translated && translated !== `notes.weekday.${dayName}`) {
                day = translated;
            }
        }

        return `${d.getFullYear()}; ${d.getMonth() + 1}; ${d.getDate()}; ${day}`;
    }
}

window.NotesStorage = NotesStorage;
