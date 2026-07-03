/**
 * Notes Storage Module
 * Handles localStorage persistence for notes entries
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
            id: entry.id || this.generateId(),
            title: entry.title || '',
            content: entry.content || '',
            createdAt: entry.date || entry.createdAt || new Date().toISOString(),
            updatedAt: entry.updatedAt || null,
            read: entry.read || false,
            italic: entry.italic || false,
            asciiArt: entry.asciiArt || false
        };
    }

    save(entries) {
        if (!Array.isArray(entries)) {
            return;
        }
    }

    getDefaultEntries() {
        return [

            {
            date: '2026-07-05T00:00:00.000Z',
            title: 'happy 250th, america',
            content: this.cleanContent(`
            «i»i miss you, my beautiful home
            and i know i will be back soon
            and every next 4th of july i'll
            be celebrating at my home, 
            with my family

            for now, i cherish the sweet memories,
            celebrate being in love with someone
            very special, being able to work on 
            my career and knowing i'll make it,
            simply feel utterly deeply grateful
            for the american friends in my life,
            and for all the blessings this
            country has given to me


            thank you, United States of America
            for being the best country in the world
            and for still being the Land of the Free
            «/i»


            🇺🇸 MY TOP 4TH OF JULY OF ALL TIMES 🇺🇸


            ✨ I. Port Jefferson, NY, 2013 ✨

            That was a great year for me. I was finally loosening up a little bit and enjoying living on Long Island and in New York.

            (During the first years of my PhD, I'd spend all my days, nights, weekends, and perhaps every single second outside of classes in my office studying, under tons of Focalin provided directly by the school's hospital. People would joke that I lived in my office. I even remember this good friend who was worried about me and tried to convince me that a PhD is a marathon, not a sprint... he was right.)

            Anyway, that particular year I had a great crowd of friends. We dressed up super cute, and after living in the USA for over four years, I was finally feeling like a real American.


            ✨ II. Los Angeles, CA, 2020 ✨

            That first year of the pandemic was very tough. LA was chaos, and morale was below freezing. But I did get to have a great celebration.

            I was living in an apartment in Melrose at the time that had an amazing rooftop with a 360-degree view of the entire city (btw, a great spot to fly a drone!).

            We had a great party, and the fireworks were absolutely some of the best of my life!


            ✨ III. San Francisco, CA, 2015 ✨

            My first year in California. My first year as a software engineer. The first time in my life I had a six-figure salary.

            I was living the life.

            This was one of the best years of my life! That particular celebration, I spent the day having a picnic in Golden Gate Park and at Sunset Beach, and then headed to Twin Peaks for the fireworks.

            Bliss.


            ✨ IV. New York City, NY, 2010 ✨

            That year I was officially an American resident, living in New York!

            My first 4th of July during my PhD was full of style! We took the Long Island Rail Road and went to the traditional New Yorker spots, and I was simply mesmerized.

            I was so much in love with my life, with the opportunities I had, and with all the dreams ahead of me. I wanted to make it big. I wanted to win a Nobel Prize. I wanted to break every ceiling. But, mostly, I wanted to make such a magical place my home.

            PS: The following year I spent 4th of July in Montauk, and it was every bit as good as this one. In fact, perhaps every 4th of July during those graduate school years was simply fantastic.


            ✨ V. Washington, DC, 2008 ✨

            My first 4th of July ever, right in the heart of the celebrations!

            I was working with CUA and NASA Goddard Space Flight Center on Active Galactic Nuclei, and I was having the best summer of my life up to that point. I could not believe I was at NASA — I even had a little desk in one of the buildings!

            I was feeling invincible!


            ✨ VI. (Honorable Mention) Curitiba, Brazil, 1996 ✨

            I watched Independence Day, with Will Smith and Bill Pullman, when it came out, and it was sooo cool! 
            
            Perhaps that was the first time I understood what 4th of July represented. At that time, I already dreamed about moving to the place I already believed was the best country in the world.

            Thank you, Almighty G'd, for letting me achieve that dream.

                `)
            },

            {
            date: '2026-07-02T00:00:00.000Z',
            title: 'hello world',
            content: this.cleanContent(`
            hello there
            anon friend

            i am marina, a hacker girl
            a scientist and an engineer
            always creating the sublime

            in the next years of my life
            i will be full-time building
            NULLSTAR + MY FAMILY

            and registering
            my journey here
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

        return `${d.getFullYear()}; ${d.getMonth() + 1}; ${d.getDate()}; ${days[d.getDay()]}`;
    }
}

if (typeof window !== 'undefined') {
    window.NotesStorage = NotesStorage;
}

