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

    /**
     * 
    {
    id: 'story-??',
    date: '2026-??-??T00:00:00.000Z',
    titleKey: 'notes.story-??.title',
    contentKey: 'notes.story-??.content',
    title: '????',
    content: this.cleanContent(`
    
    TEXT HERE
    
    `)
    },
     */

    getDefaultEntries() {
        return [

            {
                id: 'friendship',
                date: '2026-10-16T00:00:00.000Z',
                titleKey: 'notes.friendship.title',
                contentKey: 'notes.friendship.content',
                title: 'the future is about friendship',
                content: this.cleanContent(`
-------------------------------------------------------------
"a friend may well be reckoned the masterpiece of nature."
— ralph waldo emerson, on friendship
-------------------------------------------------------------

hello there, my dear old anon friend

today i want to talk a bit about something i have been thinking about quite a lot lately, perhaps as a result of all my experience traveling the world and meeting people of all sorts, cultures, backgrounds, and of my meditations on the meaning of existence and the human condition.

today i want to talk about why i believe friendship is one of the most important features of the abundant future we should be building. 

but, what exactly is a friend?

-------------------------
pocket friends and angels
-------------------------

friends come in all shapes, forms, and durations. one special case is what i call "pocket friends", a term i coined a few years ago when i was living in los angeles. recently, after the cruel crime that changed my life forever, i realized that a synonym for this concept is "human angels".

when you travel a lot, even if you are an introvert like i am, you will notice that inevitably you end up meeting a friend who exists in your life for only a certain amount of time. almost like they come with an expiration date. and this is completely how it's supposed to be: two souls meet for a small amount of spacetime, just for the purpose of a brief connection that will change their lives forever. if destiny is real (i.e., if free will is unreal), then this type of encounter is like two roads meeting at a crossing, only to unmeet and separate, each into their own infinite.

in case that has never happened to you, i assure you that, for a finite amount of time, the love you can feel for a pocket friend is worth as much as that for any lifelong friend. 
(in case it has happened to you, do you remember how you felt during such experience?)

these are the friends who will only know a specific, situational side of who you are: the character you are in that very moment and place where you meet them. they won't know your father's name, or which classes you took in college, or when your heart was badly broken. and they don't need to know, because knowing your secrets is not their role. their role is to show you that connection does not need to be transactional. their role is to be there for the tale of the moment.

i am lucky to have met many pocket angels in my life, and each of them is a fond memory that i will carry with me until the last day. by definition, pocket friends disappear, and you will never know if you will meet them again in life. this is something magical in itself, because it leaves room for the unexpected, like a story that will never be completed.

a good example for this idea (perhaps one of the most beautiful stories told on this subject) is linklater's before trilogy. yes, in their case it's a love story, but it is a beautiful case of the purest ephemeral love between two pocket friends. it's the extreme end of this concept.

a more practical example is something very cool we used to have back in the early 2000s. we nerds loved an mmorpg called world of warcraft. it was one of the most successful examples of raw collective intelligence of our lifetime, and there are many subtle reasons for that, some of which were never reproduced in any new game again. 

at a time when being a computer nerd was not normalized but rather a subculture, wow was a complete world where you had many choices of what to be and what to do, and above all it was a world where you could meet pocket friends for adventures. this mimics exactly the concept i am trying to convey: the existence and the encounter of pocket angels to share a small adventure are the very definition of what a hero should meet on their journey.

----------------
lifelong friends
----------------

the other type of friend is also magical, but it's a different type of interaction. lifelong friends are the pocket friends who never leave your life. you can meet them at any point, and they tag along until the end, either because destiny or life allows it, or because there is no other way.

these are the friends who are always there even when they are not there. you can not talk to them for years, but when you talk again it's as if nothing had changed, as if they had always been there. sometimes they were always there and you didn't notice, and, as good friends do, they show up at the moment you need a hand. these are friends from whom you don't expect anything in return. you just are. friends with whom you keep accumulating stories forever.

ah, and by the way, another cool thing about lifelong friends is that no matter how old you are, you can always find a new one. it's another serendipitous concept of life: love can always be around the corner for you, because it's one of those things that are infinite in the universe.

perhaps, we have come up with a canonical definition. to become someone’s lifelong friend, all you need is to reach a threshold of stories (i.e., moments of true connection), after which you inevitably become part of each other’s lives and no large effort is needed. we have a recipe.

one last thing. obviously, some people will accumulate unhappy stories with you and will want them to vanish forever. these are simply what would be npcs in your story. everyone can be someone's npc. in this case, npc just means someone who caused some damage that made your life change (perhaps back to that destiny concept, or the idea that unfortunately things must happen to the hero, because that is the very definition of how an adventure works). in this sense, an npc is simply an antagonist who comes into your life and changes its course, so that you must transform yourself to overcome the challenge. they don't need to be remembered as a friend or even as a human you connected with, but as something more inanimate, more material, something like a rock in the middle of your road. that's really all they need to be to you.

--------------------------
but what is a real friend?
--------------------------

it's not trivial to define what love or agape is, but every single human has felt this state of mind at some point. some feel it all the time, for everything and everyone; others felt it once or twice. if we are all being honest, we will admit that nothing in the world compares to the feeling of reciprocal care, of mutual understanding, of feeling understood by someone, of feeling "in love".

it's such a good feeling that perhaps one of the biggest human fears in the world is to lose it, or to never find it again. it might be a platonic stretch, but i do believe that every single problem in the world could be fixed if we fixed human connection and friendship. and i do believe it's a serious and hard problem. and i do believe it's fixable.

but what exactly is a real friend?
a real friend is a non-transactional, positive-sum relationship. that's it.

in more mundane terms, these are some things a real friend will do:

✨ celebrate your victories with you ✨

✨ fall with you on purpose so you don't embarrass yourself ✨

✨ tell you how you can be better, but just and only because they want you to be better ✨

✨ give you a hand when you feel down ✨

✨ give you a reason to continue when you are about to give up ✨

✨ respect your boundaries (meaning they will not enter your personal space without asking permission, and they will let you know if they see someone doing this to you) ✨

✨ not let you be humiliated, not turn their back or close their eyes when someone hurts you ✨

✨ see you as an equal ✨

and, because friends are made through the accumulation of stories, friends will help you create good memories. and what is life if not a collection of memories?

--------------------
the age of aquarius
--------------------

all right, let’s end this discussion by allowing ourselves a little poetic license to play with some mythological ideas that have inspired poets for generations.

i know, i know... the whole astrology thing is uber controversial, and i knew i was in for a ride when, as a serious rational scientist and engineer, i decided to join controversial minds (e.g., carl jung, newton and others) to explore the (very weird) possibility that somehow the planets (not the stars; the stars are just labels) have some type of uncalculated and undiscovered influence on the beings on earth, and that reality is a clockwork machine made of predictable cycles within periodic permutations of a finite set of possible outcomes.

reality is weird and no one knows anything really. so let's move on. now, if you allow yourself to play this metaphysical exercise with me, i would like to introduce the argument that the imminent, forthcoming era of aquarius (which is supposed to last around two thousand years) is all about friendships and networks.

here is theory: each of the 12 labels given to the constellations of the milky way (onto which the planets of the solar system are projected) is associated to points within the continuous but finite spectrum of archetypes for human personalities or characters (and since humans are complex, multidimensional beings, obviously each of us is a mixture, or linear combination, of these archetypes). note the word finite there. it's quite interesting that the characteristics given to each of these 12 labels actually cover every possible type of human personality. 

let's look at the aquarius archetype. according to robot claude:
"aquarius is stereotyped as an independent, intellectual, and progressive sign, valued for originality and a humanitarian outlook. in friendships and networks, aquarians are thought to build wide, diverse circles based on shared ideas and ideals rather than tradition, acting as loyal connectors who bring people together around common causes."

robot gemini:
"aquarius is the free-spirited visionary of the zodiac, known for being independent, intellectual, and unconventional. when it comes to friendships and networks, they thrive as natural community builders who connect diverse groups and care deeply about collective progress."

in other words, aquarius is related to new technologies, to saturn as the wall breaker and the bringer of the new world. in a future of abundance and superintelligence and everything we want from science fiction, the aquarian ethos is also the ethos of networks and friendships. 

if there is any truth in this whole idea that we are entering the age of aquarius, the good news is that, together with the robots and the flying cars, we will also need to revolutionize the whole concept of human connection. it's time.

(well, either this, or we are all going to move to the dystopian bleak world of complete isolation, loneliness, and disconnection)

-------
outro
------

i hope i have given you a few breadcrumbs as to why the subject of friendship is perhaps one of the most important of our age, and one of the ingredients in creating a world we are proud of.

and because of that realization, my dear anon friend, it is what i will be working toward in the many years to come. perhaps you will be there with me, so that many of my stories become some of your many histories, and our memories interconnect into good records, and we, together, help to build a beautiful future of collective human superintelligence.
  
lots of love, your wannabe lifelong friend
`)
            },

            {
                id: 'prelude',
                date: '2026-09-28T00:00:00.000Z',
                titleKey: 'notes.prelude.title',
                contentKey: 'notes.prelude.content',
                title: 'prelude: this is d-day',
                content: this.cleanContent(`
hello there, all my dear anon friends
artists, philosophers, youtubers, scientists, engineers
all of you who have entered my life when i needed angels
all of you who stay my friends now that i've my own wings

(and to all those who decided to part ways, 
my respectful goodbye; thanks for everything)

there is so much i want to tell you
there is so much i want to show you

things i've been dreaming about in secret
the things you grasp when you transcend
when you become your final and best self

when i look back at these last few years
and abstract my human ego as much as i can
i see how this crime that happened to me 
could be translated as a huge quest to 
level up into what i always could have been
but nobody told me

only after everything is stripped from you
do you realize that you can finally be who 
you really are, without excuses or fear
and now that i know, i can be it all

the big shift from the last events is that
i now understand the plot a little bit more
(not all of it; enough to let it go for good)

the big thing of the last few months is that
i have built so much; have produced so much
i completely detached from old outdated ideas

and what before was a torture every day
trying to figure out what was going on
has slowly turned into something else
the final story of the past character

i look at all my work over the years
the influence i've had in the world
the impact i've had on so many lives
all the complex problems i've solved
how much i know about so many things
how cool and fun i am

and i just think...
i am freaking awesome =p
and, i don't know, man...
i'm tired of the drama...
not really my thing...

what is my thing is that
i'm the best engineer i've ever met
i have built so many cool things
i can build anything
i can solve any problem

i have never found a problem in my 
life that i couldn't solve by myself
usually in the most creative clever way
and i have so many achievements

so, i think i will pass on the whole
“not being completely happy and 
awesome every single second” thing

and whoever matches this energy:
i can't wait to meet you down the road
and have a million laughs together
and watch sunsets and shining stars
and dance and play and run and live

i can't wait to show you the things i've been building in secret
and the puzzles and art and fun i have planned for the future
and all the things i will do that have never been done before

so yes, let's get this party ready
whoever wants to be in my world
you gotta match this high energy
and i promise you a ride for life
`)
            },

            {
                id: 'hi',
                date: '2026-08-02T00:00:00.000Z',
                titleKey: 'notes.hi.title',
                contentKey: 'notes.hi.content',
                title: 'hello starlit world',
                content: this.cleanContent(`
hello my dear friend, if you are new here, welcome
i'm that cool scholar always creating the sublime

in the years ahead, as i continue to grow
my career, home, family, and all my dreams,
i'll be talking about good books, films, music, art
and all the beauties of this life; with you, here

i'll be documenting our journey and the party
usually on friday nights or over the weekends
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
