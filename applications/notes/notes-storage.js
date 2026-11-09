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
    date: '2026-??-??T12:00:00-07:00',
    title: '????',
    content: this.cleanContent(`
    
    TEXT HERE
    
    `)
    },
     */

    getDefaultEntries() {
        return [

            {
                id: 'story-november-2026',
                date: '2026-11-13T12:00:00-07:00',
                title: 'grateful graceful memories',
                content: this.cleanContent(`
-------------------------------------------------------------
"we are our memory, we are that chimerical museum of shifting shapes, that pile of broken mirrors."
— jorge luis borges
-------------------------------------------------------------


hello there, my dear anon friend, and happy friday the 13th!
it's weird to realize that it's already november. one less year, and one more year. 
november's post will be about taking stock of this year, reflecting on the cycles that have ended, and welcoming the new life beginning as we declare victory and look toward the days ahead.


shall we get to it?


-----------
postmortem
-----------

this was a big year and far from being an easy one.
but i am pretty content with how far i have come after everything. so, let's recap.

the year started with the most shocking news i had ever received. first, the non-consensual video, in early december; then, right after christmas, the realization that my macbook was being streamed to the world. my year began in malaysia, where i had just discovered the crime that had been taking place in my life for years. something that, as a normal, highly educated woman in her early forties, living an upper-middle-class life, i had never even imagined could be a reality.

i was in shock for the entire month of january, processing the fact that people were thinking i was something other than an engineer and scientist, and that all my personal things, my brain, my habits, my day-to-day reading, choices, idiosyncrasies, it was all being publicly distributed (and the worst part was that there were people who thought this was all consensual).

i was in a state of shock unlike anything i had ever experienced before, with waves of complete despair alternating with total denial. i was in shock from being sadistically, mercilessly fooled for years by someone who said he loved me, who i traveled with, whose family i met, who i let into my house, with whom i shared my intimacy, my little things.

the shock of knowing that my entire life had been out in the world for a long time and nobody warned me directly. and the shock of knowing that there were people who somehow were trying to blame me, or who couldn't see how painful and surreal and cruel this abuse was, and how much strength i would have to gather to be able to move on. ah, and the desperate hope and wait for someone to be your friend in real life and speak up. this was my january. but it was my february, march, etc. it was most of my year.

at that point, though, i still didn't know exactly what was going on, but i had to take care of myself. so i went to denver. i wanted to go back home and i had acquaintances who offered me their place. i thought, "well, i am going back, i am going to get rid of my hacked macbook and get another computer, and i am going to do what i do well: find a job as a software engineer, and then i will continue with my life, find a lawyer, and try to make sense of what was happening."

rather, i had a very harsh experience in denver. first, things were worse than i had thought: changing machines didn't help, and somehow, people still seemed to have access to everything i did. it was a very weird and surreal situation, and i had to do my absolute best to keep myself grounded. this was one of those moments when, had i not managed to keep my anxiety under control, i could easily have gone insane.

second, the place was really poor, and, having lived as an upper-class girl for years, i had to do a lot of mental gymnastics to pretend i wasn't completely panicking about where i was. i just kept telling myself, "you will find a job quickly, you will get out, and you can forget whatever this is."

and, finally, i had to be very frugal because i still had no idea what was going on, why i was not able to get a job (which had been very simple before, given my cv and experience), and why whatever was happening was bigger than i thought, with a lot of bad people somehow trying to destroy my reputation for a reason i still don't know (i still don't know who these people are, why they hate me so much, or what i did to them).

i had to be so frugal that i literally starved myself and was getting free food for the homeless from the church. those were really weird times, and i am glad they will never happen again and that this experience lasted only a couple of months.

running out of options after years of running from a crime i did not understand, and having made no progress whatsoever, i went to «a:https://en.wikipedia.org/wiki/Curitiba»curitiba«/a» to stay with my mom, with whom i had maintained a rather superficial relationship for decades. (you see, i was actually raised by grandma helga von steinkirch, and mom and i never really got along. i had left curitiba in my late teens, first for são paulo and then for new york to pursue my phd, and had only returned a couple of times since, each visit lasting a week or so. so, this was a rather strange situation to find myself in.)

at that point, i was still deeply traumatized, dealing with the last vestiges of shock and denial, having nightmares, and still hoping that someone would come to help me, or at least talk to me. during the summer, however, i was able to find some comfort, begin healing, and work on my websites, blogs, books, studies, and plans. i also worked on many pieces of «a:https://www.nullstar.games/»NULLSTAR«/a», and managed to pay off a lot of my technical debt in the AI field. i am pretty proud of, and grateful for, «a:https://marina.nullstar.fun/pages/blog.html»everything i produced and learned«/a».

to complete the odyssey in curitiba, the final part of the story had to be about healing all the traumas, including generational ones. this year has been an honest journey through my identity and my ego, and the last part was about finding final closure with my childhood and my dad. during the last month, i stayed at a bed and breakfast a few blocks away from what used to be my dad's and grandma's house, pretty much where i grew up.

i can't describe the nostalgia. so many memories, so many familiar places, where i used to go biking with my dad, where we used to eat, so many little things. there has been a deep inner peace within me since going through this process.

this was the first time i had visited my dad's tomb in 21 years (remember i told you i rarely came back, and i never really returned to this part of town). i had a cathartic moment when i finally found him and had a final conversation with him. i apologized for taking so long, for all the suffering he went through, and for all the generational traumas and injustices in our family and in this country. i apologized for not being there during his last days, and i told him that i love him and miss him. i told him he would be proud of everything i still have to do in my life, and that i know he will be celebrating all my victories with me. and someday, i know we will meet again.

i felt something truly transcendental after this. whether life after death is real or not (i don't know; i never really believed in ghosts, but that doesn't mean they aren't real), the simple act of saying these things out loud, as if he were listening to me, was one of the most liberating things i have ever done in my life. as i walked back, i felt a peace of mind and a sense of lightness i hadn't felt in a long while. rest in peace, dad.

perhaps the second most vulnerable part of this tale was that a part of me, the girl who, after all these years, is still waiting for the fairy tale, still waiting for a magical prince to come and rescue her and love her forever, still had a little hope that something magical would happen on that front. nothing magical happened. it could have; it was not that big of a deal. i am a pretty lovable woman, and everywhere i go, people like me. but it didn't happen, and the show must go on.

i decided to stop waiting. «a:https://github.com/storyteller-13/the-crime»this crime«/a» had already taken years and so much from me, and the full justice i expected would never come. the only thing i still had under my control was the days ahead. after spending the summer healing, i decided that i was not going to wait for anything or anyone anymore. i was going to be the one responsible for moving my life and my career forward, and i would take my life back.

this shift in my mindset is the best thing i have ever done. i went back to who i am. the girl who got into «a:https://en.wikipedia.org/wiki/Polytechnic_School_of_the_University_of_S%C3%A3o_Paulo»the best engineering school in her country«/a» after studying in brazilian public schools her entire life. who went on to pursue «a:https://astro.sunysb.edu/steinkirch/»a phd in theoretical physics with a full scholarship in new york«/a», just three years after her dad was murdered. who did real science at literally three national labs. who «a:https://marina.nullstar.fun/»published so much in science and engineering, wrote books, spoke at conferences, and has the coolest github ever«/a».

the girl who got a six-figure job right after grad school without even having a formal computer science degree. who worked at the best tech companies. who traveled the entire world. who dropped in on tony hawk's halfpipe. who learned to snowboard in her 30s and was already riding parks just two years later. who was deeply involved in the decentralized finance revolution from its early days. who was doing «a:https://web.archive.org/web/20070322015644/http://fly.to/bytegirl»fractals, C++, and AI back when she was a kid in the 90s«/a». who actually knows quantum field theory, has solved every equation, and feels theoretical physics in her bones.

the girl who knows so much about culture, music, movies, art, and books. the girl who can solve any problem and create any reality. the girl who never dies and never gives up. the girl who is able to make miracles. the girl who will never, ever lose her kindness and her grace in this world.

this girl is me. and i did not die. i only became the strongest i have ever been. today, i am the best, clearest, wisest, and most unbreakable version of myself. and today, i am building the biggest thing of my life, with the most humanitarian purpose, and it's called «a:https://www.nullstar.games/»NULLSTAR«/a».

but don't be mistaken, my dear anon friend. this time, through the hardest hardship of my entire life, i could not have done it on my own. perhaps this is the first time i admit, or can claim, that no, this time i needed help. i got by, as i keep repeating, because of the good people in the world. even though they never spoke to me directly, they showered me with love through symbolic language. human angels saved my life.

after this experience, i've become quite convinced of humanity's inherent kindness. beyond politics, nationality, or circumstance, i've found genuine compassion in all kinds of people. i believe that, by and large, humanity has a remarkable inclination toward goodness.

now, the one thing that makes me wake up early every day, take care of myself, follow my routine, go to the gym, eat well, work until late, dream, smile, and all the rest, is the inspiration i drew from these people to build «a:https://www.nullstar.games/»NULLSTAR«/a». it's my homage to them, my gift to the world, my own unique way of giving back through all the skills and experience i've accumulated over so many decades of hard work. and that's why my whole heart and mind are devoted to it.

my chapter in curitiba has finally come to an end. i can't wait to finally, finally, finally go back to america, my home, which i miss so much. i am grateful. i am so grateful. so much pain, so much pain, but i did it: i transmuted it. i did it. at times, i couldn't even believe it was possible, couldn't imagine how i would manage to do it, or where the inner strength would come from.

but i did it, i did it. i transmuted the pain into wisdom, into a story of learning, into the memory of an experience that made me grow and become a better person. and now, as i go back home, i am not the same person i was when i left. far from it. and this is so beautiful, because i will be back with new eyes. what a blessing it is to be able to go back home, after so much longing, with completely new eyes, and better than i have ever been.

and i miss the usa so much that i will never again take it for granted. i will cheer every single day of this reborn life. i will cheer every single day that i am in one piece, that i am healthy, that i can still work, that i made so many kind friends along the way, and that i might meet them in real life someday. that i can bring something amazing to the world. that everything will be worth it. that i will find true love and marry the love of my life someday. that i will see many beautiful sunsets and meteor showers. that i will help the world move in a better, more connected, more human direction. that i was forgiven and that i forgave. that i was given a second chance by the universe.

i will cheer every day that i can still follow my dreams, that i believe we can build an amazing future together. that i will be a mom and it will be amazing. i will cheer every day that i made it, despite all the odds, all the rocks in the middle of the road, all the suffering, sorrow, grief, and all the scary, lonely nights. i made it, i made it, i made it. after the long night, i have found the dawn: it was within me all along, and i will never let it go away again.

and if i can, my dear anon friend, so can you.


-------------
pepper coffee 
--------------

as i start this much-anticipated new chapter, take on new types of responsibilities, step into a more mature and long-awaited moment in my life, and return to being the stoic agent that is also part of my personality, the kind of outpouring above should not happen quite so frequently.

all these months, when i poured my heart out to my anon readers, it was my way of making sure the world understood what happened to me, as well as a way of forging this particular healing process. but now, i am pretty confident that the old chapter is over, so we can go back to talking about fun stuff.

i want my future notes to be about the good things in life, the beautiful stories i live, the lessons i learn, the people i meet, and all the things that happen when i finally get to eat the cake, while experiencing what life is like when you're working hard towards your dreams.

i want my future notes to be very positive and inspiring, reflecting who i truly am. i also want them to sometimes be just pure storytelling. in the coming months, expect these types of stories: philosophy, learnings, wisdom, life, and the future. and since friendship and «a:https://matrix.nullstar.fun/?note=friendship»human connection«/a» are main themes of «a:https://www.nullstar.games/»NULLSTAR«/a»'s mission, let me tell you a quick one.

my most recent pocket friends, bruno and rodrigo, own a super cute coffee shop two blocks from my grandma's old house, and it's where i've been working for the last month. by the way, «a:https://matrix.nullstar.fun/?artwork=memories.jpg»the new artwork«/a» is from my workspace, and through the window, you can see the patio of one of the campuses of the university of parana, where my dad taught me how to ride a bike and roller skate when i was a child.

rodrigo was the first one i met. on the first day, i asked if i could spend the day working there. i was focusing on my project, and i had fond memories of the place. he was absolutely kind from the very beginning. between delicious coffee, free «a:https://en.wikipedia.org/wiki/Brigadeiro»brigadeiros«/a» (a brazilian delicacy), and chats on the balcony, i learned that this guy is about to win the lottery big time. he told me about this girl he is about to marry, who lives in a very small town in the middle of the state. they own a huge piece of land by the river, and he is going to move there, build a business with her, and spend his days in the water. now, this is someone very young who already understands what true happiness is.

i met bruno a few days later. he used to work in software, and now he spends his days chilling with good people. i tried his pepper coffee, and it was one of the best drinks i have ever had. my mornings became a little more exciting because i knew i'd get my pepper fix when i got there.

between the vinyl records playing MPB (brazilian jazzy music), RHCP, the cure, classic rock, and blues; delicious snacks and caffeinated beverages; all the cute, cool, clueless left-leaning kids from the university across the street; delicious street food; and the perfect sunny-but-chilly weather (it's always «a:https://web.archive.org/web/20110410001836/http://en.wikipedia.org/wiki/User:Steinkirch»my favorite season«/a» in curitiba), i must say, i had a great and productive time. and as my days there came to an end, i'm glad i got to celebrate the good life with pockets full of spice.


-----------------
friday the 13th 
----------------


let's end today's ramblings with a new tradition, plus some of my usual metaphysical divagations.

every november post will come with a special treat for you, my dear anon friends. it's called  «a:https://matrix.nullstar.fun/?folder=movies&list=zeitgeist-2026»the zeitgeist awards«/a», and it's my way of sharing my lifelong cultivated taste with you all. the tradition will involve the movies that told the story of the year and other shenanigans.

this year, since youtube had a huge influence on my life and on helping me figure out what was going on, we also have «a:https://matrix.nullstar.fun/?folder=podcasts/zeitgeist-awards-2026»the podcast version«/a». enjoy! and to the winners, thank you, from the bottom of my heart, for being who you are and for everything you have done for me.

now, more interesting than a spooky friday, though, is the fact that today happens to be a rather extraordinary day astrologically, and it coincides quite nicely with the theme of this note.

first, we have both venus and mercury going direct, meaning yay! after some much-needed "cleaning" in those areas of life, things should start moving more smoothly and quickly again. 

but that's not all. on top of it, we have a rather rare triple conjunction of mars, jupiter, and the south node at 25 degrees of leo. and, coincidentally, that's exactly where my sun is. the sun can sometimes represent the paternal figure in your life, while the south node is associated with past karma and letting go of unfinished business. i won't tell you what mars and jupiter represent, but let's just say the symbolism matches the current moment almost a little too perfectly.

so, whether you believe in astrology or not, here's to a great release, a little cosmic housekeeping, and stepping into a wonderful new chapter. see you next month!                
                `)
            },

            {
                id: 'friendship',
                date: '2026-10-16T12:00:00-07:00',
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

------
outro
------

i hope i have given you a few breadcrumbs as to why the subject of friendship is perhaps one of the most important of our age, and one of the ingredients in creating a world we are proud of.

and because of that realization, my dear anon friend, it is what i will be working toward in the many years to come. perhaps you will be there with me, so that many of my stories become some of your many histories, and our memories interconnect into good records, and we, together, help to build a beautiful future of collective human superintelligence.
  
lots of love, your wannabe lifelong friend
`)
            },

            {
                id: 'prelude',
                date: '2026-09-28T12:00:00-07:00',
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
                date: '2026-08-02T12:00:00-07:00',
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

    /**
     * Calendar date parts in San Francisco time, regardless of the viewer's timezone.
     */
    getPacificDateParts(date) {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;

        const parts = {};
        new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Los_Angeles',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            weekday: 'long'
        }).formatToParts(d).forEach(({ type, value }) => { parts[type] = value; });

        return {
            year: Number(parts.year),
            month: Number(parts.month),
            day: Number(parts.day),
            weekday: parts.weekday.toLowerCase()
        };
    }

    /**
     * Sortable YYYY-MM-DD key for the San Francisco calendar day.
     */
    getDateKey(date) {
        const p = this.getPacificDateParts(date);
        if (!p) return '';
        return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
    }

    formatDate(date) {
        const p = this.getPacificDateParts(date);
        if (!p) return '';

        const dayName = p.weekday;
        let day = dayName;
        if (window.I18n) {
            const translated = window.I18n.t(`notes.weekday.${dayName}`);
            if (translated && translated !== `notes.weekday.${dayName}`) {
                day = translated;
            }
        }

        return `${p.year}; ${p.month}; ${p.day}; ${day}`;
    }
}

window.NotesStorage = NotesStorage;
