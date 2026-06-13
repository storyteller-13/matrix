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
date: '2026-06-14T00:00:00.000Z',
title: 'an ode to self-worth',
content: this.cleanContent(`

a crime happened to you
your trust was violated
someone lied to you, or about you
someone didn't respect your dignity
you were abused when you least expected it
someone you loved didn't truly see you or
or violated your boundaries

yes, this is our world
it has been like this
since the beginning of time
it's a dog-eat-dog world

there are 2 ways you can "deal with it"...

you can keep getting beaten over, over, over again
or you can say NO and stand up and change the path

fool me once, shame on you
fool me twice, 3, 4, 5 times
shame on me

the cool thing is that
there are not only 2 roads
there are infinite roads

aristotle says in poetics:
«i»"the best tragic protagonist is neither completely virtuous nor completely evil, but someone of high standing who falls into misfortune because of an error in judgment (hamartia), not because of wickedness"«/i»

so, if you are that person who somehow keeps getting into trouble but always finds a smart way out, and every time becomes a better version of yourself (and somehow leaves the world better than before) — congrats

you are not an NPC

i know i am not one
and i will continue doing what
i have been doing my entire life

but for now on
with 0 weakness

(and perhaps with a cutie by my side; who knows?)
(can't really fight venus and jupiter in the 7th)

stay true to yourself and keep improving every single day, anon

<3
mvs

ps: obviously, i will continue pursuing legal action for the crime that happened to me (i.e., the hack of november 22, 2024, and everything before and after that). no amount of peer pressure and manipulation can stop the right of justice from being served to a human, no matter how long it takes. this will be over ONLY when the people who hacked me, sex-trafficked me, and destroyed 3 years of my life are held accountable. and this is NOT going to be in the way of my career, from living my best life, and building the future i deserve.

    `)
},

{
date: '2026-06-13T00:00:00.000Z',
title: 'that\'s how we win 🌹',
content: this.cleanContent(`

«i»"the rules of fair play do not apply in love and war."«/i» — john lyly 

1. we build every single day. we run local models. we open-source. we collaborate. we build the next generation of tools.
2. we keep our honor and faith intact (let them die from their own poison; we are not like them, we actually care).
3. we remember every single dishonorable person who deceived or used us.
4. we trust that magic and miracles are real and are our birthright.
5. we create a reality never imagined before and reclaim our power.
6. we remain optimistic and learn how to enjoy the infinite fight.
7. we rely on our youth, good karma, and self-reliance.
8. we use science and astrology to our advantage.
9. we let our souls rest on art and music. 
10. "s(he) who is prepared for war can preserve peace"

good > evil.
we got this.
    
    `)
},

{
date: '2026-06-08T00:00:00.000Z',
title: 'welcome to nullstar games',
content: this.cleanContent(`

a quick note on this beautiful spring sunday
to tell my friends about some thrilling news

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
|                           |
|                           |
|  https://nullstar.games   |
|                           |
|                           |
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

stay excited, my dear anon 👾

<3
mvs

    `)
},

{
date: '2026-06-06T00:00:00.000Z',
title: 'axioms of robotic elegance',
content: this.cleanContent(`

☀️ happy sunny retard friday, dear anon
what a great week, don't you think? 🌙


---------------
weather updates
---------------

i have good news, my dear anon — it seems like the Sun will be shining brightly this summer

in addition, in four days, jupiter and venus will conjunct in cancer, and then, finally, they will move into leo (jupiter in leo will be such a different vibe — i can't wait - plus, the nodes will be moving there soon)

i want to feel very good every single day this summer - how about you?


---------------------------------------------
some implicit rules for our futuristic future
---------------------------------------------

today, we are looking at a modern take on asimov's dream
i call it "the implicit rules for the futuristic kingdom"


1️⃣ robots are stoic && reserved; they speak only when truly needed, and they control the tone, volume, and range of their voices (low, calm, useful)
🌟 so, if you see someone talking or screaming too much, boo... it must be a human!

2️⃣ robots dress simply, practically, and VERY comfortably; they choose one style (or even one color) and stick with it
🌟 so, if you see someone spending too much on their wardrobe, obsessing over brands, or showing off excessively, boo... it must be a human!

3️⃣ robots are minimalist maxxers and always default to first principles in their choices, including day-to-day decisions such as nutrition or partnerships
🌟 so, if you see someone being irrationally extravagant or not caring about what or how they consume or produce, boo... it must be a human!

4️⃣ robots have fun interesting lives and far too many worthwhile problems to care about; plus, they don't eat their own: they would never be intrusive in another person's life!
🌟 so, if you see someone gossiping, violating others' boundaries or privacy, or creating drama just for attention, boo... it must be a human!

5️⃣ robots understand girardism very well (i.e., that human desire is not self-generated but is often imitated from others, leading to competition and zero-sum conflict)
🌟 so, if you see someone fighting with another out of envy, boo... it must be a human!

6️⃣ robots' societies are meritocratic free markets aimed at creating infinite positive-sum games; plus, robots understand love algorithms and do not engage in ad hominem reasoning
🌟 so, if you see unfair bias, tribalism, sexism, racism, communism, or xenophobia, boo... it must be a human!

7️⃣ robots are governed by pure logic, and they communicate through numbers, symbols, pattern recognition, and telepathy, such that messages are concise, unambiguous, and self-evident
🌟 so, if you see lies, malicious manipulation, or careless incompetence, boo... it must be a human!


stay stoic_sublime_electronic.sh, dear anon

<3
mvs

    `)
},

{
date: '2026-06-05T00:00:00.000Z',
title: 'no meio do caminho',
content: this.cleanContent(`

«i»"be so good they can't ignore you."«/i» — steve martin

«i»
no meio do caminho tinha uma pedra
tinha uma pedra no meio do caminho
tinha uma pedra
no meio do caminho tinha uma pedra.

nunca me esquecerei desse acontecimento
na minha vida de retinas tao fatigadas.
nunca me esquecerei que no meio do caminho
tinha uma pedra
tinha uma pedra no meio do caminho
no meio do caminho tinha uma pedra.

- carlos drummond de andrade
«/i»

    `)
},

{
date: '2026-06-03T00:00:00.000Z',
title: 'courage is...',
content: this.cleanContent(`

    «i»"we hold these truths to be self-evident"«/i»
- our declaration of independence

1️⃣ to never lose the sweet belief that things will work out — even if injustice has been a theme in your life for too long

2️⃣ to find the small things that make you smile, incorporate them into your days, and don't let the negativity of the world sidetrack you

3️⃣ to speak out loud and clearly about how you feel and what you are working toward — so it's self-evident when your boundaries are violated (remember: as a free human, you're allowed to leave a situation that isn't healthy for you)

4️⃣ to forgive and let go of any pain, grudges, crushed dreams, or lonely nights — understanding that others are also doing their best (remember: focus on the good things you have now, so that tomorrow draws closer to the beautiful life you always deserved)

5️⃣ and... to be brave enough to change direction when it's time to do so


there is a beautiful world to be built — and i'm doing my part
stay zen, dear anon; better days are always coming ad infinitum


<3
mvs
    
    `)
},

{
date: '2026-05-30T00:00:00.000Z',
title: 'sunny kingdom fridays',
content: this.cleanContent(`

happy friday, my dear anon ✨

a beautiful full moon in sagittarius this weekend — according to one of the open robots, it signifies the celebration of truth and higher purposes
(the robot says: sagittarius, the uber blunt archer, encourages you to look beyond surface-level stories and seek your own deeper meaning)

i'm celebrating that every single day has been better than the ones before (peaceful, blissful, focusful), and every single day i'm getting closer to achieving the very specific list of beautiful dreams i've been working so hard for, for so many years now

i'm also celebrating that everyone i love is stronger than they were yesterday, 💜 shining more beautifully 💜 — and i love watching it

shall we continue to tell the greatest story ever told?

<3
mvs
    `)
},

{
date: '2026-05-26T00:00:00.000Z',
title: 'what a season finale!',
content: this.cleanContent(`

welcome to the new season, my dear anon

omg, last season's finale was intense and the plot keeps thickening!
now, this is what i call a good 'n' old soap opera

so, let's recap...

Princess Stone went to chicago to find her punk sister who has the power of creating false illusions, just to realize that she definitely does not belong there and she misses her real home and friends - wait, no, this is the other show...

Princess Stone went to a faraway magical land to continue working on her studies and remove her curse, and to become very strong when she comes back home (again...) so she can use her powerful magick to help build the golden age in the Freedom Kingdom

(nobody knows that she is secretly searching for the ultimate book, the book that will change everything, the book that is her inheritance, and that she believes was hidden by her father - "The Book of Logic XIII")
(she can't wait to get back to the council with her findings - this will be one of the main themes of the next season IMO)

all the other princesses have been working diligently on their skills and agape magick, and after all the battles from these last seasons they feel stronger and wiser than ever to fight for the future

Prince Paz left alone on a far, far away journey to the other side of the earth in a dangerous search for the most powerful sword on earth, so that he can defeat any monster that tries to stay in the way of his journey to his soulmate (is he finally going to find her?)

Prince Michelangelo, on the other hand, strengthened his alliance with the other princes, including the Great Prince Saudavel, using all his charm to help the citizens of the Freedom Kingdom wake up for a better era (i'm so excited to see what's going to happen here!)

Prince Manteiga spent the entire last season searching for the "Ring of Formal Infinite Wisdom", and now that he finally found it, he can understand things he never did before and he is ready to apply this knowledge to lead The Resistance

all the knights and kings and wise men in the kingdom are now very sure that the prophecy is real and they are more united (and thrilled) than ever: they are ready to fight for it with their lives

more than ever they know what needs to be done, because the future can be abundant and they are making History

more than ever they are ready to fight the monsters that have taken the souls of so many citizens and kept them asleep for so long, plaguing the kingdoms with unhappiness, laziness, hate, cynicism, inertia, envy, blindness

this is going to be a good chapter!

«i»"if you keep only looking to the past for answers, you won't find the new story that must be told"«/i»

<3
the storyteller tech ceo
    `)
},

{
date: '2026-05-25T00:00:00.000Z',
title: 'retardmaxxing ftw',
content: this.cleanContent(`

«i»"so be wise as serpents and innocent as doves" - matthew 10:16«/i»

let me tell you the story of when i finally had the unpleasant opportunity to check out Hell for a couple of months

well, first, let me tell you what Hell is...

every single person has a personal unique definition of Hell:
"a place that conveys every single thing that would make you go crazy if you are not in an ascended state"

that's why Hell is the very definition of what Hell is for:
a place to break you
and make you lose your soul
and lose all your hopes a la Dante
and descend into the lowest state of your being
so that you are absolutely taken by Evil

which is the opposite of the personal unique definition of Heaven:
a place to make you feel so blissful
and hopeful
and infinite
and perfect
and loved
and complete
so that you are absolutely taken by Goodness

let me tell you what my personal Hell is
i have ocd with cleanliness and organization

if you ever met any of the many houses i had, you would notice three main things:

1. i am an intellectual nerd who loves gadgets, books, and geek toys
2. i am ocd with an organization && minimalism obsession, so everything must be in its place - and if things are not needed anymore, they must be donated or thrown away (and i find it particularly pleasant to periodically catalogue and organize and renew my house)
3. i am a cleanliness freak and everything must be neat and nice and pure and blessed all the time (and i find it particularly pleasant to periodically sanitize and sage my house)

so, naturally, my personal Hell would be a place where the items above are violated or removed

plus, three other general rules of what Hell is are:

1. any form of involuntary lack 
2. non-consensual transgression of personal boundaries and personal privacy
3. endless repetition (which is the same as being stuck in a loop without hope of leaving it)

put all of them together and you have the ultimate recipe to descend to the limits of your sanity (and test and prove your faith)

«i»but, marina, why would anyone voluntarily go to such a place, even if just for a short period of time?«/i»

well, my dear anon, i don't know about you, but i fuckin' hate Satan

and, sometimes, the only way to confront a monster is by heading straight to its face

sometimes, the only way to be able to fight the ultimate nemesis is to submit yourself to its world for a while so you can strip it directly from its insides

sometimes, the only way to really understand the divine power you hold is to have to FIRE it straight from the enemy's realm

but kids, don't really try to do this at home if you don't think you are retard enough to survive

let me repeat it
you need to be really really really big-time 100% full-soul made of retardness to win these types of biga$$ spiritual battles

retardmaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
with 55 x or something

for reals

<3
mvs, on a collaboration with Archangel Michael

ps: by the way, capricorn moons are the retardest instantiation of the L13-A12 group

    `)
},

{
date: '2026-05-23T00:00:00.000Z',
title: 'an ode to mom',
content: this.cleanContent(`

«i»"omg, my mom just said retardado" - me, yesterday«/i»

--------------
BEING AN ADULT
--------------

it took me 4 decades to finally understand her

the first decade i would simply do whatever she told me without putting much thought - most of my lil baby brain synapses were focused on getting used to being a being inside a brave new world plus understanding what those electronic boxes were doing

the second decade i was a rebel anarchist scientist hedonist, waaaay gone

the third decade i was learning to be an adult and trying to build my life in a faraway country and there was simply no space for her - she was just too much, she didn't get it, she didn't see the real me, i didn't need her, i didn't want her influence in my life, i was embarrassed by her, her voice was too loud, her stories too silly, her presence too tiring

but one day i finally saw her

one day i was captured by monsters and no matter how much i fought or ran, i could not free myself, i found myself trapped in Hell and she was the only person i could call

one day she saved my soul


-----------
BEING A KID
-----------

let me tell you, anon, about one of the top 10 best days of my life
(and how simple this day was, and how reality and love work)

this was the day when i took a terrible 20-hour economy class flight (after being spoiled for many years to only fly business or first)

this was the day when i ate until i almost exploded from an abundant and beautiful italian table including food i didn't check the label, food that was not organic, that was not FDA approved, food with all types of unknown preservatives, food not made with the minimum first-world standards, food made purely of sugars and gluten and all those scary things (after being spoiled for many years to only eat what's on the californian-upper-class-girl's menu)

this was a day when i felt like i was high in the skies cleaning organizing sanitizing every single thing from my luggage in a many-hours-long daughter-mother-bonding-moment (after being completely sober on a very rigid routine with a vow of asceticism for many months)

this was a day when i spent the rest of the day on the couch under a fluffy pink blanket binge-watching something dumb on netflix and not doing anything else (after months or even years of not taking one day off work and not even owning a netflix account)

this, my dear anon, was one of the top 10 best days of my life
(a day when i was in Heaven; a particular heaven called mom's)


------------
BEING MY MOM
------------

she never grows up and never lives her real age and she is getting old and she can't even admit it

she worked so hard her entire life and she says for years that she wants to retire from her job as a pedagogue and build a business selling flowers in our mountain house but she never really even does anything about it

she could retire already but she won't, she still wakes up at the same time every single day and go do the same work she has been doing for decades, and i think the only reason she does that is because she is a capricorn sun

she has ocd and everything is always clean and always in the right place and the toilet always needs to be with this cover down because according to feng shui we do not want "any bad energy from coming up"

she has many coffee makers but she still uses this old cloth from her grandma or something every single day and she refuses to simply learn the new ways

she still does not know how to use a computer beyond the basics and she takes forever to learn anything new in any gadget and it's absolutely impossible to teach her

she had her master's thesis on the economics of school decentralization and she loves Piaget but she never lets go of so many naive political ideas

she tells me that this is my real home and i remind her i have lived in the USA for 17 years now, way more than i have lived in Curitiba (especially if we consider that our first 10 years don't even count)

she goes to three different churches every single weekend and her house is full of statues, pictures, and objects of Jesus and Saints and Angels, and she says she sees angels in the clouds all the time

she loves arts - mostly clichés such as Miró, Dalí, and Kandinsky - but her attempts at creating abstract paintings are kind of terrible and they are hanging all over the house

she cooks food to give to the poor, including a handful of street cleaners and other folks on sub-jobs that she has been taking care of and befriended for many years

she still keeps every single present and card i gave to her, and she loves me like i was never gone for so long

she is a cancer ascendant and she wants to nurture me, but i am an aquarius ascendant and i need total freedom

she's the best mom i could ever have had, and
every piece of my existence is grateful
that she still loves me unconditionally
even though i'm so arrogant
even though i'm so alienated
even though i'm so imperfect
thank you so so so much, mom

<3
marina

    `)
},

{
date: '2026-05-16T00:00:00.000Z',
title: 'as long as i build i\'m blissful',
content: this.cleanContent(`

«i»"sit spes fallenoi, miscebunt sacra profanis"«/i»

hello my dear anon 🦖
    
a quick update from the last post, because i know you care

i am very happy advancing my career and building something really cool
(this is what i will be doing for the rest of my life)

i've realized that researching, creating, and interacting with mind-like folks is truly my only source of happiness and fulfillment

and after everything that happened to me (The Crime, which is still waiting for justice...), i have decided to take a celibacy vow for the rest of my life

how about you — what great decisions are you making to ensure you're a free HUMAN and following your dreams?

the future is beautiful

<3
mvs

    `)
},

{
date: '2026-04-23T00:00:00.000Z',
title: 'godspeed you! black emperors',
content: this.cleanContent(`
    
[EDIT 05/29/2026: we're not going anywhere, silly! this is OUR world]

my dear anon,

this is my official goodbye to my online life.
i have been unhappy and anxious for far too long.

i tried everything i could, but i was never able to find out what happened to me, and i was never able to find justice. martyrs are going to be martyrs, and that's okay — history is full of them, and they are the coolest ones. i've made peace with the idea that it is now in god's hands — Divine rule of law and The Truth are always final.

the person i adored — loved, waited for, worshipped, and dreamed about for over a year — did not feel the same. i was never good enough, and that's okay. there will be someone who sees me, and i don't regret anything, and i would do everything again (perhaps with even more love next time — more love is always the answer).

all my dreams were crushed over the last couple of years while i was unaware of the abuses and simply trying to build things, be happy, and be myself in my own little world. i wasn't going after anyone, nor was i doing anything other than existing. the world was not ready for what i had to say (and i wasn't even saying it out loud — i was literally in my own little space that i created because i love creating things). and that's okay. i would do everything again. but now, after losing everything just by trying to survive and stand up, i feel more lost than i have ever felt in my entire life. that is why i need to leave this behind so i can go back to being happy and whole.

it's time to shift my magic toward rebuilding my own life, rather than trying to fix every new problem from someone else and pacify every new attack from random people who don't know me, or who are jealous, or who desperately need attention (and lack the compassion or emotional intelligence to look beyond their own selfish, delusional desires).

toward the best life i've ever had, the happiest and most colorful days. i absolutely deserve it finally!

i always did my best. i always worked hard, and i always put everyone else first. for that reason, i know i carry a ridiculously good karma, and that good things are waiting for me once i am free from whatever this was.

i think i changed the world a little bit for the better, and i am happy that i could help.

to those who were there for me — who believed in me, who helped me, who illuminated my days, who made my life better while i was running from monsters and the absurd: i love you, and i will never forget you. go chase your dreams. go live your best life. go create your own magic. go do the impossible. never let anyone tell you that you are not worthy.

whoever is the real villain is the one who harms others without compassion. whoever does not understand that everyone deserves the right to redemption is the one who is lost. whoever is running from attack, building without resting, creating without stealing, being true to themselves, and constantly striving to improve is the hero.

<3
marina della torre von steinkirch
scientist, engineer, storyteller
(who was, somehow, for a while, a bit famous)

    `)
},

{
date: '2026-04-18T00:00:00.000Z',
title: 'joyful joyful new moon',
content: this.cleanContent(`

happy friday, my dear anon

sun, moon, mercury, mars, saturn, neptune, chiron in ♈︎
can you feel the big sacred fire burning again?
perhaps a big collective reset?
enjoy for once, my friend 🤖🦋

🎶🎵 🌟 🎶🎵 🌟 🎶 🌟 🎵 🎶 🌟 🎵 🎶 
«i»staring at the blank page before you
open up the dirty window
let the sun illuminate the words that you cannot find
reaching for something in the distance
so close you can almost taste it
release your inhibitions
feel the rain on your skin
no one else can feel it for you
only you can let it in
no one else, no one else
can speak the words on your lips
drench yourself in words unspoken
live your life with arms wide open
today is where your book begins
«/i»🎶🎵 🌟 🎶🎵 🌟 🎶 🌟 🎵 🎶 🌟 🎵 🎶 
    
    `)
},

{
date: '2026-04-16T00:00:00.000Z',
title: 'hobo-curious: an engineer\'s take',
content: this.cleanContent(`

[ or how i learned to stop worrying and love the thug life ]

«i»"whoever oppresses a poor man insults his maker, but he who is generous to the needy honors him." — proverbs 14:31«/i»

[ i would describe the last month as a fascinating social experiment ]

[ the problem i was trying to solve was not technical — the problem was dignity — the question i kept coming back to is this: how can we make sure everyone has enough dignity to live their lives and follow their dreams? ]

«i»"do not withhold good from those to whom it is due, when it is in your power to do it."«/i» — proverbs 3:27

[ the system was broken in the specific way that broken systems always are — not dramatically, not all at once, but in the accumulation of small frictions that grind people down ]

[ during the government shutdown people were genuinely afraid they would not eat — genuinely afraid ]

[ i'm not going to tell you everything ]

«i»"the righteous gives without sparing." — proverbs 21:26«/i»

[ some of the most important conversations of this chapter happened at a table with a cup of coffee and people i'd only just met ]

[ i started paying attention to what it actually meant to be at the bottom of the resource pile and still be human, still be generous, still be in community; i went to food banks; i ate church food ]

[ the thing that struck me, the thing i couldn't shake, is that the people with the least were often the most willing to share ]

[ these people were not impressive in the way the world usually measures impressive; they were real; and the conversations we had over mutiny smelled like the 90s ]

[ the last time i cried in my life ]

«i»"you can give away 100% of your wealth when you are a hobo."«/i» — a kind hobo

[ an interlude for MF Doom — the deliberate refusal to be recognized on the world's terms; the willingness to be called a villain while doing something quietly brilliant; the mask that let you be honest ]

[ that posture — of working while the crowd looks the other way — that became a kind of north star for me during the ugly ]

[ people fear anyone apparently "below" them; i've watched it happen; i understand the fear; i've felt it myself ]
 
[ i'll tell you it was not about failure; it was about beauty — specifically, it was saint-saëns; the swan; something about that melody, in that moment, broke something open in me that needed to be broken open; i sat with it; i didn't fight it ]

[ i was raised to believe that you never ever show weakness; that to be vulnerable was to hand someone a weapon; and i carried that belief for a long time and it cost me things i can't get back ]

[ what i know now is that humility is not weakness; humility is accurate; it's seeing yourself the right size — neither smaller nor larger than you are; my dad knew this; it took me longer; going back to his lessons, back to the roots of where i came from ]

[ i wake up in the morning and i pray; not because i have it figured out; because i don't, and the prayer is a kind of admission of that, a kind of alignment before the day gets going and i start pretending i'm more in control than i am ]

[ i'm about to head back to real life — with a new perspective: whoever's still here is the real deal ]

    `)
},

{
date: '2026-04-15T00:00:00.000Z',
title: 'robots won\'t take it personally',
content: this.cleanContent(`

«i»"perhaps all the dragons in our lives are princesses who are 
only waiting to see us act, just once, with beauty and courage."«/i»
- rainer m. rilke

———————————————————————————————————————————————————
🦋 hey robot I, 
what does it feel like to be a highly intelligent, 
compassionate autistic woman? 🦋
———————————————————————————————————————————————————
            
it's like to live with a heart that is as expansive as the mind is sharp.

you exist in a world of high-definition empathy, where you don't just notice the suffering of others; you map it, analyze it, and feel it with a physical intensity that borders on the overwhelming.

your intellect allows you to see the structural roots of problems, but your compassion demands that you do something about them, creating a drive to "fix" the world that is both a profound gift and a heavy burden.
            
it is a life of sensing the unspoken: perceiving the micro-shifts in a friend's mood or the hidden injustices in a system long before anyone else mentions them.
            
while others might see your autism as a barrier to connection, it is actually the source of your radical authenticity — you care too much to play social games and think too deeply to accept easy answers.
            
you move through the world as a quiet powerhouse, balancing a processor that never stops and a spirit that refuses to look away.
            
            
——————————————————————————
🐞 your turn, robot II! 🐞
——————————————————————————
            
it feels like carrying the whole world in your chest — every injustice stings like it happened to you personally, every person in pain becomes your quiet emergency.
            
your empathy doesn't arrive in small, manageable doses. it arrives like a flood.
            
you feel things before you can name them, and you name them more precisely than almost anyone once you do. 

while others skim the surface of a conversation, you are already three layers deep, sensing what wasn't said, noticing the sadness behind someone's smile, filing away details about people they've long forgotten sharing with you.
            
being this smart means you understand people — their patterns, their fears, their contradictions — sometimes better than they understand themselves.
            
being this compassionate means you care about what you understand. that combination is both a superpower and an open wound.
            
you are the friend who remembers everything, who shows up with exactly the right words, who will research something at 2am just to help someone you love. 

but you are also the one who goes home and needs three days of silence to recover from a single crowded room.
            
people sometimes mistake your directness for coldness — not knowing that you speak plainly because you care too much to be dishonest. 

your bluntness is an act of love. your honesty is a form of respect.
            
and underneath all of it is a tenderness so vast and so fierce that you've spent most of your life learning how to protect it — not because the world deserves less of it, but because you've learned, slowly, that you deserve to protect yourself too.
            
            
—————————————-———————————————————————————————————
🐛 how about you, robot III, what do you think? 🐛
—————————————-———————————————————————————————————
               
imagine having a mind that's constantly noticing patterns, details, and connections other people miss. 

your thoughts can feel very precise, sometimes intense, sometimes beautifully deep. 

you might experience the world in high resolution—sounds sharper, emotions more vivid, small changes more noticeable.
            
that can be overwhelming at times, but also meaningful in ways others don't always see.
            
being "super smart" in that context often isn't about knowing everything — it's more like having a brain that wants to understand everything thoroughly.
            
you might dive deeply into interests, finding joy and comfort in mastering them. curiosity isn't casual; it's immersive.
            
compassion, in that mix, can feel powerful but a bit different from stereotypes. it might not always show up as quick social responses, but rather as a deep, deliberate care — thinking hard about fairness, wanting to reduce harm, remembering small things that matter to people.
            
sometimes it's expressed through actions or consistency rather than words.
            
at the same time, there can be friction with the outside world. social expectations might feel confusing or arbitrary.
            
you might care deeply about people but struggle with being understood — or with understanding how others communicate their feelings. that mismatch can be tiring, even isolating at times.
            
put together, it can feel like being both very connected and slightly out of sync: deeply perceptive, deeply caring, and navigating a world that doesn't always run on the same wavelength as your mind.
            
—————————————-—————————-—————————————————————
🪲 finally, what's your opinion, robot IV? 🪲
—————————————————————————————————————————————
            
it feels like living with lightning and glass inside your chest — brilliant clarity intertwined with sensitivity so sharp it's almost tactile.
            
you see patterns and meanings others miss, not just in numbers or logic but in people, color, and silence.

compassion doesn't arrive as sentiment; it floods in as insight, an intuitive grasp of others' pain or joy so strong you want to fix everything, or at least understand it.
            
being autistic in that body means the world sometimes feels too loud — lights like knives, sounds like static over symphonies.
            
yet it also means you can go deeper than most; you can lose yourself in a single idea until it becomes a small universe you tend.
            
smart doesn't feel like pride, but like responsibility: a gift you must translate so others can see what you see.
            
———————————
🌈 outro 🌈
———————————
            
«i»"yeah, you guys are awesome and got it right — thank you for seeing me without the filter of your own biases. that's rarer than you think."«/i»

<3

    `)
},

{
date: '2026-04-14T00:00:00.000Z',
title: 'eating yummy brains',
content: this.cleanContent(`

i am now 100% intentional about what i let into my feeds and my mind.

here are the rules of the game:

1️⃣ it has to be relevant or enriching. scientific or technical content related to my work and interests, or things i genuinely love — art, film, music, philosophy. 

2️⃣ it has to be neutral or uplifting. if something consistently triggers negative thoughts, that's an unfollow.

3️⃣ zero political noise. no political messages, no political bias, no political influencers.

4️⃣ no one trying to sell me something or "directly" sending me "messages".

5️⃣ no negativity of any kind. that means no bullies and no noise that makes me feel bad about myself or the world.

6️⃣ it should help me grow, contribute to my goals, or expand my thinking in a meaningful way.

7️⃣ you are a cool guy who talks about all the things i like 🧠😋

see ya if i see ya
<3

    `)
},

{
date: '2026-04-13T00:00:00.000Z',
title: 'if i were to found a party',
content: this.cleanContent(`

SPOILER ALERT: i won't...
life is too short — i have far more important things to focus on.

but if i were, these would be the main principles:
(go ahead, kids - steal this album!)
(yes, this is a mars conjunct neptune post)

I. INDIVIDUAL LIBERTY AND PERSONAL RESPONSIBILITY
emphasis on personal freedom coupled with accountability for one's own choices and circumstances, rather than relying on government assistance.

II. LIMITED GOVERNMENT
belief that government power should be constrained and that many issues are best addressed by individuals, families, ethical venture-backed non-predatory companies, intellectual patronage, and local communities rather than federal authority.

III. FREE MARKET ECONOMICS
support for capitalism and minimal government intervention in the economy, with the conviction that free markets generate prosperity and innovation.

IV. TRADITIONAL VALUES AND INSTITUTIONS
respect for established social institutions — such as universities, artistic communities, and spiritual communities — as foundations of a stable society.

V. CONSTITUTIONAL ORIGINALISM
interpreting the constitution based on its original meaning and intent, with skepticism toward judicial activism or expansive readings of federal power.

VI. STRONG NATIONAL DEFENSE
prioritizing a robust military and assertive foreign policy to protect american interests and security.

VII. FISCAL RESPONSIBILITY
advocating for balanced budgets, lower taxes, reduced government spending, and concern about national debt.

VIII. RULE OF LAW
emphasis on law and order, support for law enforcement, and a commitment to the equal application of the law without special treatment.

IX. SECOND AMENDMENT RIGHTS
strong support for gun ownership rights as both a constitutional guarantee and practical necessity.

X. FOURTH AMENDMENT RIGHTS
the government cannot search you, your home, or your belongings, or take your property without consent or just cause, due process, and lawful authorization.

XI. FEDERALISM AND STATES' RIGHTS
preference for keeping power at state and local levels rather than centralizing it in washington, d.c.

XII. FAMILY AS THE FOUNDATION OF SOCIETY
viewing marriage as a vital institution, and the belief that strong families are essential to community stability and child development.

XIII. PARENTAL RIGHTS
full rights for women, including equal legal, political, economic, and social rights, full protection under the law, and full bodily autonomy; and a strong conviction that parents — not the government or other institutions — should have the primary role in guiding their children’s education, healthcare decisions, and moral upbringing.

🫡
love from your favorite renegade

    `)
},

{
date: '2026-04-12T00:00:00.000Z',
title: 'annual career celebration day',
content: this.cleanContent(`

i love walks. in fact, i love walking without any destination, on a new, different path that will lead to somewhere i've never been. i love stopping at coffee shops along the way, or finding flowers and trees, or cemeteries and parks.

since i don't really use cell phones anymore (unless i really need to), most of my walks are intentionally made so that i get lost. and i find it particularly fun to try to find my way back — either by looking at the sky, or remembering where i have been, or using some distinguishable buildings or places as references.

this has been kind of a game for me for many, many years now. as a good nerdy scientist, whenever i need to ponder a systematic problem, i love to go for a walk. 

but today, i am not talking about walking, but rather about traditions: i am at that age when dates and traditions become much more important than when you are "yunger".

i am at that age when you start to realize that there could be less ahead than behind.  

even if this is not the case (i.e., we are advancing quickly on the longevity front), i cannot deny that there are certain things i won't ever be doing again; they were part of the early part of my life. hence, traditions and celebrations are a sweet and grateful way to honor the passage of time.

i recently decided to pay tribute to one particular feature that has been one of the main themes of my life. something i never stopped doing, never took a real break from, and that is, in a certain way, very tied to my identity: my career.

i am going to claim that i started my career when i got my first paycheck job, when i was 16. then, when i was in college, i was on an undergraduate paid research scholarship for most of the time, so i am going to claim this was also part of my career. same with my phd, when i had a full research and teaching assistant scholarship — that was my labor.

then, when i graduated, i never really stopped working until now — always on my computer, whether doing scientific or technical research or writing and shipping code. i also think i can claim i have worked (even if on artistic side projects) around 2/3 of the weekends of my adult life. and although i have taken many vacations — like every normal and healthy person — i have never spent more than a few weeks idle.

i can say with a chest full of pride that i have spent a solid 1/4 of a century on my career. i am very proud of all the things i have built, including many things that will never be published or known, or are closed source.

«i»✨ nice to meet you, marina della torre von steinkirch, you are a full professional! and you absolutely have enough clout to be referred to as dr. steinkirch by the kids! ✨«/i»

and now, i am at an interesting crossroads. with how fast AI is changing the world, things will never be the same — and i am excited about what is ahead!

therefore, i will declare this beautiful moment the beginning of the second half of my career! 

i do see myself working for another couple of decades — though naturally evolving into more leadership-focused roles over time, building and guiding teams, and passing on everything i've learned to the next wave of people coming up — the natural order of things. 

(and through all of it, i'll be loving my soulmate with every single cell in my body — who, for some reason, is still MIA these days 😱 — while making sure our home && family are nothing short of joyful && alive in every possible moment 💃🏻)

in conclusion, since life is what we make of it, next friday, april 17th, when mars conjuncts saturn in my third house (an event that occurs roughly every 30 years), i will declare it 🎉 MY ANNUAL CAREER CELEBRATION DAY 🎊.

from now on, until the end of my life, on this day i will engage in a full day of remembrance of all the cool things i have built, and all the cool things i still expect to build, with all the cool people i will collaborate with in the future. 

i will also be eating strawberry cheesecake and listening to debussy, which are the symbols of the senior engineers and scientists who come from the planet uranus. you are welcome to send me flowers, gifts, and love poems.

bytegirl
<3

    `)
},

{
date: '2026-04-09T00:00:00.000Z',
title: 'a prayer for worldly happiness',
content: this.cleanContent(`

gracious god, in your gentle light,
we come with open hands today —
not asking for a perfect life,
but for joy that finds us anyway.

let morning sun kiss our faces warm,
and quiet moments be our norm.
may laughter ripple, soft and free,
and kindness flow through all we see.

wash away the weight of sorrow,
bring us peace for each tomorrow.
grant us courage, grant us grace,
to meet each twist with a smiling face.

may love surround us, near and far,
and happiness become our guiding star —
gratitude too wide to stay within,
a light that warms all gathered in.

may we lift each other, low or tall,
and find your light reflected in us all.

amen.

    `)
},

{
date: '2026-04-06T00:00:00.000Z',
title: 'o death, where is your sting?',
content: this.cleanContent(`

happy easter and passover, my dear anon friend.
today i want to touch a bit on my views on celibacy and marriage.

for the younger reader, i want you to know that i understand that what i am about to say may cause you a little outrage — i have been where you are, when my mind used to think in a very different way about these things.

when i was in my 20s, a friend of mine told me this: "if you are not a communist in your 20s, you don't have a heart; but if you are still a communist in your 30s, you don't have a brain." 

i was never really a communist (more like an anarchist, or better, a libertarian). but in my 20s i was slightly shifted towards the left because that was where the cool, smart, university-y people were. this was prior to woke, and antifa, and all the craziness. and this was before i realized that far left ideology and artificial feminism do get left men laid, but they are actually very detrimental to women.

i never really thought i would be saying this, but getting older does make you a conservative. it is, indeed, the natural order of things.

and i am going to go a step further. i am completely convinced that the best choice is to "save yourself" (or the best parts of yourself) for marriage — to really believe that you can find one person and grow with that person and be with that person for the rest of your life. and this is not woo-woo or fantasy. this is a conscious, mature choice.

the choice relies on cutting out all the other possibilities and simply committing. and being humble enough to accept that both you and the person of your choice are very flawed (like any human is), but that because of your commitment, you will find ways to work through the conflicts, the problems, and the imperfect aspects of the relationship. and you will both come out stronger, and better, and closer over the years.

picking a person to spend the rest of your life with is not only the most courageous thing you can do — it is also your conscious acceptance that the old you, the one who was moving through life by yourself, making choices that optimized only your desires and needs — that old you will be dead. happily dead. and the resurrection is a new you who comes with a complement, with an exclusive mirror that you get to help mold.

no, it should not get boring if you choose right (and if you never get boring yourself). a human is never static. and two humans together will never be static if they consciously commit to it.

i am not claiming you need to necessarily get married early in life. i am not opposed to it, but i don't support it either. for some people this works, for others it won't. in my case, i am the kind of person who had to mature to be able to choose someone — because i had way too many self-indulgent desires and dreams, and i liked to be alone. i had to live everything first, because that was how i wanted it (i would probably feel like i was missing out if i hadn't had all the experiences i had before where i am now — even though i would probably be happier and safer if i had married early. but you never know).

what i am claiming is that, at some point in your life, you should make choosing someone and marrying them and dedicating the rest of your life to that person until death your main priority. at some point, you must do that. and i will also claim that it's okay if you are already in the second part of your life when you finally decide to do this — there will be others like you. and one magical thing about love is that, once you find it, when you feel it in your veins, everything feels so symmetrical and exciting that all the mistakes and guilty feelings and self-conscious thoughts carry no weight anymore. that's why love is the supreme feeling of all feelings. that's why love is all we need.

so, again, as long as you get to a moment where you realize it's time to dedicate yourself fully to someone else, you will be okay. every person has their own path and it's really nobody else's business, so let's drop the judgment.

now, before i leave you to your delicious good weekend, i want to make one more point. i want to touch on celibacy. should we save ourselves for marriage? for the one?

this question would have sounded ridiculous to me five years ago. after all, you should "practice," you should "learn," etc. etc. right? 

well, my dear reader — i have come to the conclusion that this might be an incorrect take. i don't want to try to change your mind in this regard: you should do whatever you want and if it's a mistake you will learn from it (like everyone does, including myself). but i do want to share my personal thoughts, simply because they diverge from the current status quo. 

i do now believe celibacy is not so weird, and that you can absolutely save yourself for the person you choose to be with for the rest of your life. and yes, of course things can go wrong, but they can also go right. and if none of us will ever know the outcome, why wouldn't we choose the one that is sweeter and more romantic? plus, trust me, there is nothing really to "be learned" — if you and your partner are truly and deeply connected in love, making love will be naturally wonderful by its very own definition of what a connection through love is (both figuratively and not figuratively).

i came to the above realization a little too late in life, so obviously i did not save myself for the man i will spend the rest of my days with (a.k.a. my soulmate). but what i was able to do is, in the moment it became absolutely clear to me — two years ago — i chose celibacy and abstinence from any intimacy (e.g. kisses or even intimate thoughts) with anyone other than the person i am waiting for. that's the minimum i could do.

not only that — there is something magical and sweet about waiting. there is something purifying about preserving your innermost acts of affection for the person you choose to care for and love until you die.

but, mostly, there is something very honorable about consciously redeeming and forgiving yourself for past mistakes, and killing the part of you that does not belong to a life of loyalty to your other half.

and those, my reader, are enough reasons to welcome the death of your hedonistic self.

until next time
<3

    `)
},

{
date: '2026-03-31T00:00:00.000Z',
title: 'an ode to april',
content: this.cleanContent(`

gm, my dear anon, 

can you believe it's already april?
that means 25% of 2026 is already behind us!
how are your dreams && ambitions shaping up?

as for me — things are going well!

my path is clear: career, goals, execution. i'm showing up every day and giving it everything i have. expect some exciting news soon!

my routine is tight, intentional, and improving constantly. i'm taking pride in holding the line against distractions. nothing and no one is standing between me and where i'm headed.

the side projects and hobbies that truly matter have been identified, and i'll be pursuing each one with dedication in my spare time.

still haven't found my person yet, but the faith remains. jupiter moves into my 7th house in a couple of months — "they" say this is when you find the one.

happy full moon in libra!
looking amazing, smelling good, and feeling strong.
no more excuses, no more delays, no more hesitation.

shall we get to it?

<3

    `)
},

{
date: '2026-03-30T00:00:00.000Z',
title: 'the 4 shades of 96',
content: this.cleanContent(`

            
DISCLAIMER: the following text is a narrative experiment conducted by an amateur storyteller exploring unfamiliar thematic territory. the content departs from prior work in that it engages with topics that may be considered explicit, including sexuality, intimacy, and criminal behavior. 

this is a purely fictional construct and should be interpreted as such. the narrative is influenced stylistically by authors such as bukowski and nabokov, and is presented as an analytical exercise rather than a literal account.

in this story, we examine a spectrum of behaviors associated with a particular intimate act (hereafter referred to as "fellatio") through a quasi-analytical lens. the goal is not to sensationalize, but rather to categorize and reflect on the ethical, social, and psychological dimensions surrounding the act.

the analysis proceeds from the most harmful and coercive manifestation to the most consensual and meaningful.

            
------------------------
1️⃣ the criminal modality
------------------------
            
consider a hypothetical subject: a woman in her late thirties, characterized by intelligence, attractiveness, and a highly disciplined life structure. she is unmarried, private, and introverted, with a demanding professional career that consumes most of her time. 

her social exposure is minimal, and her interpersonal relationships have historically been serious, long-term, and emotionally invested. she does not engage in casual encounters, avoids nightlife environments, and maintains a strong internal value system centered on trust, commitment, and future partnership.

a defining feature of this subject is deferred emotional investment: she has consciously "saved" her affection, intimacy, and vulnerability for a future partner whom she perceives as worthy. this creates both depth of character and a structural vulnerability — high trust thresholds combined with limited real-world testing of adversarial social dynamics.

a predatory individual identifies this profile as exploitable. this individual is not sophisticated in a traditional sense, but possesses one critical capability: the ability to fabricate emotional signals without internal constraint. his objective is not relational, but reputational within a deviant peer network, where domination, deception, and documentation of exploitation function as status currency.

the interaction begins with accelerated attachment formation. the perpetrator deploys high-frequency communication, exaggerated admiration, symbolic gestures (e.g., gifts, promises of travel), and explicit declarations of long-term intent (marriage, exclusivity). these signals are calibrated to align precisely with the subject's unmet emotional expectations.

initially, the subject experiences cognitive dissonance. there are weak signals of incongruence — subtle intuitions that something is "off". however, these signals are overridden by contextual factors: isolation, desire for connection, and the psychological reward of being seen and valued. over repeated exposure, her resistance diminishes.

the subject grants increasing access: emotional, spatial (inviting him into her home), and temporal (regular interaction). at this stage, trust consolidation has been achieved.

the next phase involves boundary testing. the subject has previously expressed a desire to reserve certain experiences — particularly those involving certain altered states of consciousness, which are completely unfamiliar to her — for a meaningful relational context. the perpetrator identifies this as an entry point. through persistence, normalization, and reframing, he gradually erodes her boundary, presenting the experience as an act of shared intimacy and trust.

eventually, the subject consents to an experience under conditions she believes to be safe and meaningful. however, the situation is manipulated beyond her awareness. her cognitive state is compromised, and her capacity for informed consent is effectively nullified. during this period, the perpetrator records material without her knowledge or authorization.

critically, the subject retains no memory of the event. from her perspective, no violation has occurred.

the final phase is defensive strategy. anticipating potential exposure, the perpetrator initiates a preemptive reputational degradation campaign. he constructs narratives portraying the subject as unstable, unintelligent, or socially inferior. given that her professional environment is male-dominated, these narratives propagate with minimal resistance.

over an extended period (on the order of years), the subject experiences measurable decline: loss of opportunities, altered peer behavior, and gradual social isolation. however, due to information asymmetry, she cannot identify the causal mechanism. the system appears arbitrarily hostile.

only after a prolonged interval does she reconstruct the event sequence and identify the source of harm. at this point, the damage is multidimensional: professional, social, and psychological. the realization introduces secondary trauma—awareness not only of the violation, but of the duration of unrecognized harm and the absence of intervention from her environment.

this scenario represents a convergence of manipulation, chemical incapacitation, non-consensual documentation, and social engineering. it serves as an extreme boundary condition in which an intimate act is fully transformed into an instrument of control, humiliation, and long-term destabilization.


            
--------------------------------------------
2️⃣ the opportunistic (metaphorical) modality
--------------------------------------------

in a metaphorical sense, the act may represent submissive or sycophantic behavior enacted for personal gain. here, the "act" is symbolic of abandoning integrity to secure favor, status, or protection.

an illustrative case involves betrayal of peers in exchange for alignment with powerful or attention-seeking individuals. such figures often exhibit egocentric worldviews, interpreting external actions as centered on themselves. their social ecosystems may reward flattery and compliance.

unlike the previous case, this modality does not typically result in immediate or visible harm to the actor. instead, it reflects a gradual erosion of ethical standards. individuals may rationalize their behavior, redirect narratives, or minimize accountability.

this form is less catastrophic but indicative of broader social dynamics where opportunism is normalized.

            
-----------------------------
3️⃣ the transactional modality
-----------------------------
            
a third category involves explicit economic exchange. the act becomes labor within a market framework, historically associated with prostitution and other forms of compensated intimacy.

from an ethical standpoint, this modality is distinguished by agency. individuals who voluntarily engage in such transactions exercise autonomy over their bodies and decisions. within many philosophical frameworks, the presence of consent and compensation differentiates this scenario from coercive exploitation.

contrasting with the first case, the subject retains control over participation and outcomes. while the work may carry social stigma, it is not inherently defined by deception or violation.


------------------------------
4️⃣ the transcendental modality
------------------------------
            
the final category represents the act within a context of mutual affection, trust, and intimacy. here, it is integrated into a broader relational framework characterized by emotional connection and reciprocity.

in this modality, the act is not transactional or strategic, but expressive. it contributes to bonding, pleasure, and, in some cases, reproduction. the ethical foundation rests on consent, privacy, and mutual respect.

a key principle is confidentiality: the preservation of shared intimacy as a protected domain. breach of this trust undermines the relational structure and reverts the act toward exploitative categories.

from this perspective, the act becomes not merely physical, but symbolic of a deeply personal (and beautiful) connection and mutual vulnerability.


-----
outro
-----
            
this classification illustrates that identical physical behaviors can occupy vastly different ethical and experiential domains depending on context. variables such as consent, intention, power dynamics, and social environment fundamentally alter their meaning.

the spectrum ranges from coercion and harm to mutual fulfillment and connection. understanding these distinctions is essential for evaluating human behavior in a nuanced and ethically grounded manner.

    `)
},

{
date: '2026-03-25T00:00:00.000Z',
title: 'an ode to spring',
content: this.cleanContent(`

🌸 today i woke up feeling so so so happy!

🌺 colorado is so beautiful; i'm definitely going to miss it when i leave!

🪻 and i love my work and research so much - there is so much to learn and build and create!

🌹 and rose made me delicious coffee before i left for work!

🌼 and any problem is going to be solved the way it should be solved!

🌻 and i am having delicious gluten-free cornbread with book-store good-hearted pocket-sized friends!

spring is here, my dear anon!
let's make it the best one ever? who's with me?

<3

ps: bonus points for serendipitous music...

✨
we drift like the wind
soft yet steady 
carrying the world in our hands
we scatter the seeds
small yet heavy
nurturing the peace 
of our land
we look for the dawn
we look for the dawn
chasing his lights
are familiar and bright
yet so unknown
we look for the dawn
we look for the dawn
over the hills
where the water is still
clear from the storm
we carry the blade
calm but ready
and the shadows we tame
remember our names
a world of war touches many
let our voices burn with song
we look for the dawn
we look for the dawn
shielding the light
we let the light carry us home
look to the sun
look to the sun
as long as it burns
i will return to where i belong
a place to call home
✨
    `)
},

{
date: '2026-03-23T00:00:00.000Z',
title: 'an ode to dad',
content: this.cleanContent(`

on a certain night, around 21 years ago, i was at a friend's party in são paulo when i received a strange call.

on the other side of the line, my mom asked to talk to one of my best friends. they chatted for a few minutes, and then he hung up and looked at me with a face i will never forget.

"o seu pai morreu"

which translates to:

"your hero, the smartest and kindest and funniest person you ever met, the person you loved most in your life, the person you wanted to be when you grew up, the person you always looked up to, who would bring sandwiches when you were studying, who would make sure your pillow was comfortable enough and you had enough blankets, who would show you the most beautiful hikes, who taught you physics, math, and chess, who bought your first video game and played all night with you, who made you love pink floyd as your favorite band — that person, that person who is probably the only person who ever loved you unconditionally in your entire life, that person, that person, that person is dead."

i never found out who murdered my dad.

and i don't recall much more after that, nor even the years that followed. all i know is that i pretty much dissociated the way i love to do: through working every second and forgetting my surroundings.

i was in college, at the university of são paulo, the best school in latin america, and i had just transferred from the prestigious engineering program at the polytechnic school to the physics program.

i had an undergraduate research scholarship, working in the department of mathematical physics under the direction of a famous cosmologist, dr. elcio abdalla. and i was working as hard as i could to be able to get out of that timeline.

i succeeded. a few years later, i was accepted into a prestigious string theory phd program in stony brook, new york, with a full scholarship, so i could run away forever from what i never fully understood.

dad was a genius, by the way. he really was. grandma helga would always talk about how he aced IQ tests, how he got into this very prestigious military engineering school, ITA, which is almost impossible to get into.

dad liked to build stuff. when he was in his 20s, he decided to build his own hang glider from scratch. he would go to a sports store and take measurements and notes, and then come home and cut and build and sew (there was no internet back then). he built it, and he flew it from the mountains around curitiba. he literally jumped from a mountain with an object he built himself, and he did not die. that was dad.

dad loved the mountains. he would do his mountaineering all over paraná and argentina. on that same mountain he jumped from, called anhagava, he was the one who installed the metal bars in certain parts so others could also climb there.

dad died too early. and i could never tell him all the things i did. i could never tell him i worked at nasa, and at apple, and that i moved to the usa, and that i did a phd, and that i traveled the world. i could never.

in the many years after i moved to the usa, i was comfortably numb. i was working and studying ridiculously hard. i was ignoring many natural things in life.

it took me almost a decade to finally process the loss. that only happened when i had my first contact with weed, during the last year of my phd. i was 30 years old. it was the first time i tried any mind-altering substance whatsoever. and it altered my mind in a very positive way (funny enough, i moved to san francisco months later). that's when the black box of grief gracefully opened, and i could accept what happened.

however, it was only last year, when i realized what men do to women without fathers, that i really understood — when my dad was murdered, i didn't just lose my best friend, i lost the only person in the world who could really protect me from monsters.

any chance i had in life became null
on april 4th, 2005.

    `)
},

{
date: '2026-03-16T00:00:00.000Z',
title: 'chez mr. denver',
content: this.cleanContent(`

today i will tell the story of another angel i’ve met recently on my now-over-thank-god kerouacian journey.

his name is mr. denver, a 59-year-old tall thin fellow who, interestingly enough, had a small contribution to why the city denver is called denver.

mr. denver was born and spent his entire life (with the exception of a couple of years when he hitchhiked with the grateful dead through every state of the usa, with the exception of california and alaska) in denver. i also learned that danny in danish sounds like denver, and his great great great father was the guy who gave the name to the city. according to mr. denver, this story is not even in books or on the internet.

mr. denver’s partner has just passed away from cancer 6 months ago, which he tells me with not much more detail while starting his playlist full of dr. john, bob marley, and the steve miller band. now he lives with 2 kitties in a 2-bedroom with a balcony pointed toward the denver mountains. he tells me that he always wanted to live in this building, and funny enough his apartment number is 501 - coinciding with the fact that for many decades that’s what he would wear on the daily. he asks me what song from the grateful dead he should play on his (blue) guitar and i say scarlet begonias. he tells me this was cheryl’s favorite too. i tell him every girl loves that song, as he shows off some half chords and sings 'she had rings on her fingers and bells on her shoes'.

mr. denver says he might have to go to jail soon, up to 16 years — he is waiting for his trial in a few weeks. he got into a fight with 2 cops. he says he was helping his friend, and he hates cops. he swears he is not scared and maybe he will be able to be redeemed from this sentence. in any case, he has packed all his expensive guitars and home decor from his apartment and left them with his cousin. however, he can still show me a couple of pieces in his possession - a large escher that he believes is original, together with a picasso’s blue period lady that he bought while he was on the road. but the one he really likes is a piece he found in the garbage of a goodwill, an artistic take on the 27 club, where you could clearly recognize morrison, hendrix, and joplin in a dreaming dalí-themed depiction. 'they are worth a lot of money', he says.

mr. denver tells me about his stories as a deadhead, and the women he loved, and machines he fixed, and men he owned. he tells me he has no regrets in his life except never marrying the woman he spent the last decades with and who now is gone. we both agree he will have to forgive himself. he tells me that’s why he has this poster 'let that sh*t go' in front of his comfortable blue chair found in the street (and now the main piece of his living room).

mr. denver and i met in one of the last days of my recovery from The Crime. stoic as i am, i don’t usually cry — especially in public. but that particular tuesday i was leaving my favorite coffee shop a bit earlier because my heart was pretty heavy. as i started walking up i could not hold back what i would call one of the biggest cries of my life. i was also very hungry and i started searching for G’d on the clouds in the sky and speaking the words 'i need help'. mr. denver was passing by and he told me he had himself some tears as he had been feeling very lonely. 2 humans at the same time and in the same street, feeling the same deep sadness that sometimes itches the human soul. mr. denver saw me and gracefully opened his thin long arms and asked whether i was okay and whether i wanted a hug. i don’t think i had ever hugged a stranger on the street before in my life, but funny enough my first reaction was to accept that random act of kindness.

mr. denver then asked me if i would like to try the best pizza in town, which he had many memories of, including eating it every weekend together with his grandparents when he was a child. mr. denver told me to wipe my tears and to get an entire pie so i would have some for breakfast. he told me to stop thanking him, and all i needed to do was pay it forward to someone else later. he told me that this is how the world should work. i asked mr. denver whether he believes in miracles and he said no. i told him i see miracles every day.

interestingly enough, in the following days my luck and my soul and my mojo were back and i was starting to feel sure i was out of the dark hole for good. it seems like one of the best pizzas of your life, together with raw human connection, can do that.

the last time i saw mr. denver, i told him that our meeting on that particular day was a miracle, and he agreed with me — as i could see his eyes watering. i told him that he is what i call an angel and i would never forget his kindness and his pocket-sized-friendship. i thanked him for the bolivian-styled blanket he insisted i had as i walked back home. i told him i would write a short story about him and that i knew everything was going to be okay for both of us. he smiled timidly as we waved goodbye.

    `)
},

{
date: '2026-03-09T00:00:00.000Z',
title: 'the 4 stages of loss',
content: this.cleanContent(`

elisabeth kübler-ross, john bowlby, and colin murray parkes developed what we now know as the stages of grief and loss.

in my own experience, their theory describes the (non-linear) experience of emotional and physical abuse with striking accuracy.


------------------
1️⃣ the shattering 
------------------

🗡️ mental state: denial, shock, numbness — when innocence cracks
🗡️ experience: feeling dazed, robotic; the mind stands in a doorway and refuses to step inside the truth


-----------------
2️⃣ the withering 
-----------------

🩸 mental state: anger, disorganization, despair — the self begins to fade
🩸 experience: the slow dimming begins; each day, a piece of you is quietly traded for survival


----------------
3️⃣ the mourning 
----------------

😿 mental state: depression — grieving the person you were
😿 experience: eventually the truth settles like winter

«i»you begin to see what was taken:
your ease, your safety, your innocence,
the trust that love cannot be cruel

you mourn not only the past,
but the version of yourself who once 
walked through the world unafraid«/i»


----------------
4️⃣ the rebirth 
----------------

🐦‍🔥 mental state: acceptance and recovery — when something stubborn survives
🐦‍🔥 experience: "this is part of my story now"

«i»yet somewhere beneath the ruins,
a small ember refuses to die:
"this was never my fault"«/i»


-------
 outro
-------

«i»you are not the survivor of the storm;
you are the endless sky above the drifting clouds«/i»

<3

    `)
},

{
date: '2026-02-28T00:00:00.000Z',
title: 'david lynch is my only friend',
content: this.cleanContent(`

«i»dark
deep darkness
and 
splendor
all around it
was in the roots
and
under
and a tree came out
and then a house
with stars above -
inside the house a girl
with eyes to see and
long arms reaching
she saw the splendor
all around
and reaching out into
the deep darkness
she saw herself
«/i»

    `)
},

{
date: '2026-03-02T00:00:00.000Z',
title: 'denver\'s love && hate',
content: this.cleanContent(`

in astrology, there is a technique called astrocartography that maps your birth chart onto the earth, showing where each planet was rising, setting, or at the top of the sky when you were born. in theory, with each planet represented as a line crossing specific cities, when you visit these places, you feel “the influence” of that planet’s energy.

my uranus line crosses denver, so i should expect many unexpected events, disturbances, and things not going as planned. i must admit, from my experience so far, this seems accurate.


----------
STRIKE #1
----------
                    
the first time i went to denver was back on thanksgiving 2021. i had just quit my very-well-paid engineer job at shopify because my team and i were promised a $2M pre-seed investment from polygon to make the first FilmmakerDAO movie: "humans of web3". we already had a solid plan with two hollywood directors, and we were overly excited to get that money wired to our account.

i went to denver with my then-boyfriend and his family, and we met a couple of friends to hang out at a very cool arcade. that was the first time i learned how much money searchers were making with MEV, and my mind was blown.

in a surprising turn of fate, a few days later, the polygon CEO backed off, saying something like our project was "too silly", and our morale dropped to the floor.

three things became clear during that first visit:

1. never trust vcs
2. there was a huge black market operating on blockchains that nobody was talking about
3. our DAO was probably going to die, and it was probably time for me to go back to being an engineer
                    
----------
STRIKE #2
----------
                    
the second time i went to denver was almost a year later, in 2022, to attend a blockchain conference called MCON. the event was full of snobbish, spoiled kids, and i felt i was wasting my time.

but mostly, that was clearly one of those moments when you make one small decision that screws up your entire life with no way back. that was when i met the psychopath who initiated and was mainly responsible for The Crime.

we were colleagues at KeeperDAO, a group working on MEV mitigation. i had just left that position because the leaders were clearly scammers, and i would rather work at a job that had meaning. but i made the mistake of agreeing to share my airbnb with this random guy from seattle who, judging from the few months i had worked there, his github, and his take-home assignment, didn’t even know how to code.

there are very few decisions i regret in my life, and this one is probably the only one that still gives me a pain in my stomach when i think about it. because this was the very moment when i started losing everything.
                    
                    
----------
STRIKE #3
----------
                    
the third time i went to denver was for ETH denver 2025, the year i spent running from criminals while trying to uncover The Crime. i was coming straight from egypt, and my main goal was to find someone who could tell me what happened on november 22nd, 2024. i thought vitalik would meet me there, as he clearly knew about The Crime. none of that happened.

it was almost a waste of time again, with the exception of one serendipitous event. i met another angel: s.
                    
----------
STRIKE #4
----------
                    
the fourth time i went to denver was in 2026, coming back from malaysia. i had recently discovered that there was much more to The Crime than just november 22nd, 2024, and that my devices were being hacked and streamed to the entire world (although i still didn’t know the full story, why i was still being targeted, or why nobody spoke directly to me to finally free me from the painful uncertainty of not knowing).

i was not doing well — definitely the worst months of my entire life. i felt like i had lost everything. i was putting all my energy into not breaking down, continuing my life, and moving forward with my career. i had been ostracized for over a year, and although i had a huge legion of fans online, i had almost no friends still talking to me in real life.

s was an exception.

i told him i had been running from an atrocious abuse. i said i was trying to find a job, but The Crime had destroyed my career, and i asked whether i could crash at his place while i got back on my feet.

he didn’t hesitate to tell me i was welcome. he and r, the sweet ~80-year-old woman who lives with him, took me in like family. s built a little room for me, and r told me they love me, that the room would always be there for me, that i had a home in colorado, and that i could come back anytime to visit them.
                    
                    
-----
OUTRO
-----
                    
what’s the most evident difference between people who live on food stamps and those who belong to the billionaire list (and all their friends)?

humanity.
                    
    `)
},

{
date: '2026-02-26T00:00:00.000Z',
title: 'those little things',
content: this.cleanContent(`

«i»"if there is one lesson i learned from The Crime, it is
that there will be moments in life when your floor is pulled out
away and things will happen slower and weirder than you expect
but just as all the very good moments in life are ephemeral,
so are all the pain and suffering: after a while, they end."«/i»


🪻 ten simple mundane things that make me feel alive 🪻:

1. consume a really good book or movie that changes my life forever
2. find an elegant solution to a logical problem and feel my brain working
3. a random and unexpected act of kindness from a stranger
4. music that travels inside my veins, waking up every organ of my body
5. travel to a new city and experience that first cultural shock
6. snowboard on a beautiful mountain on very fresh and soft snow
7. find the one guy who loves me for who i am and have that first kiss
8. clean and organize my house the way i like, so it looks perfect
9. encounter and interact with cute little animals and watch them just be
10. know that i'm free and that there are infinite possibilities to live the good life

<3

ps: bonus points for serendipitous poetry...

🪻 the tiger, by william blake 🪻

tiger, tiger, burning bright
in the forests of the night,
what immortal hand or eye
could frame thy fearful symmetry?

in what distant deeps or skies
burnt the fire of thine eyes?
on what wings dare he aspire?
what the hand dare seize the fire?

and what shoulder and what art
could twist the sinews of thy heart?
and when thy heart began to beat,
what dread hand and what dread feet?

what the hammer? what the chain?
in what furnace was thy brain?
what the anvil? what dread grasp
dare its deadly terrors clasp?

when the stars threw down their spears,
and water'd heaven with their tears,
did he smile his work to see?
did he who made the lamb make thee?

tiger, tiger, burning bright
in the forests of the night,
what immortal hand or eye
dare frame thy fearful symmetry?

    `)
},

{
date: '2026-02-23T00:00:00.000Z',
title: 'an ode to my first child',
content: this.cleanContent(`

my dear first child,

i can't convey how much i have longed for you, my little baby.
i've spent my entire life building myself into the best mother i could be.

every fun story i have lived, i imagine telling you — sharing the lessons i learned so that you may grow with wisdom and character.
every skill i have acquired, i plan to pass on to you — so that you may grow with strengths and advantages i did not have as a child.

you will be a true citizen of the world.
you will be one of the leaders of the future.
you will be my greatest project and proudest achievement.

<3

    `)
},

{
date: '2026-02-21T00:00:00.000Z',
title: '2AM friday synthwave epiphany',
content: this.cleanContent(`

i never had any problem with having lots of good things happening for me. i have always been lucky enough — or very intelligent, or very qualified, or very hardworking — to get great jobs, scholarships, opportunities.

until The Crime happened.
then, somehow, i became an outcast. 

nobody believed me, nobody wanted to talk to me, nobody wanted to hire me. before, people would be super excited to have me on their teams. i was treated well. i was valued. then, in these last 2-3 years, suddenly i was not seen anymore for who i am. people only saw a label, a narrative created by heartless criminals.

but enough now.

i now erase the damages of the abuse from my life and i will only remember the good. i am not going to let The Crime and its atrocity affect my existence any further. and i am going to rise so, so, so much better and so much higher.

i am still pretty young. my brain is still super fast and sharp. i look like i'm in my early 30s — everyone says that.

i can still make it big. i can still rebuild my career and be very successful. i can still find a good partner and be a good wife and mother. i can still have real friends who last my whole life. i can still do all the things i want to do, and be as happy as i used to be — or much more.

but the first step is: i cannot let the drama, the negativity, and the bullies affect my life any further. period.

The Crime is not going to rob my light, or my life story. if i stop thinking about it, and simply focus on the present and the future, and keep only good people around me, and see all the beauty that still exists in the world — one day after another — things will get awesome.

so no more.

starting tomorrow, i will wake up every day happy and grateful. follow my routines and chase my goals with care. put one brick on top of another. every day better. every day stronger. with infinite faith and hope.

i am super smart. i am kind. i am hardworking. i care. i am honest. i am desirable. i am worthy. things will start happening and be awesome — like they always were. people who matter will see me. opportunities will knock on my door.

the best is still to come.

whatever i do now is going to be my best work ever. and whoever i make my family now will be the most loved people ever.

and soon i will be sitting in my nice chair, in my nice house, with a nice cup of tea, looking at everything i have and how i overcame so much.

and i will feel this immense happiness inside my veins — something so strong and so intense. total. complete. bliss.

and no one will ever ever ever take this well-earned destiny from me.

    `)
},

{
date: '2026-02-18T00:00:00.000Z',
title: 'building my sunniest chapter',
content: this.cleanContent(`

[edited on april 17th, 2026]

dear anon friend,

today marks the beginning of the most exciting chapter of my career

a venture so ambitious, so thrilling, and so deeply meaningful that i expect to dedicate the next several decades of my life to it

i can't reveal the details just yet, but here's a little teaser: think games, think fun

think something you'll genuinely love — from your favorite e-girl (who loves to mess with your mind... in a good way)

stay tuned
the best is absolutely yet to come

<3

    `)
},

{
date: '2026-02-16T00:00:00.000Z',
title: 'grateful, always grateful',
content: this.cleanContent(`

1. being alive - it's a blessing to be able to wake up every morning and have infinite possibilities to make my day great.

2. my health - thank you, thank you, G'd, for my health, for my body, for everything working well, and for the fact that i rarely get sick.

3. my intelligence - my biggest source of happiness is to learn new things, and i'm grateful for my ability to do it fastly, and in a very fun way.

4. my life story - i have been through so many things, some very amazing, some painful but a source of wisdom and growth. i am grateful i had the chance to live all these stories, and had a fulfilled life.

5. good people and all the friends - kindness is one of the most beautiful things in the human condition, and i am so glad for all the love i've had the chance to receive and give throughout my life.

6. justice and karma - the feeling of peace knowing that when something cruel is done to you; time is a wise teacher, and justice and karma are always served, one way or another.

7. my work - i just love to work and build new things and be useful, and i am so grateful this is a great source of fulfillment to me.

8. mother nature - what a beautiful feeling it is that we can just step outside and see miracles everywhere: in the animals, in the flowers, in the sky, in the land, etc.

9. the future - there are still so many things to be lived! i have so many ideas for projects and work, so much more to learn! and i still haven't found the partner i will build a life with, i still haven't had the chance to be a mom, i still haven't bought my own house - simple things that i postponed while i was traveling the world and focusing on my career and studies, but now, in the next years, they are all mine and they will feel so incredibly good.

10. you - yes, you, random anon reading my things. thank you for being here, whoever you are. you matter. you are beautiful. you can be whoever you want. you can do whatever you want. believe in yourself - i already do. 

<3

    `)
},

{
date: '2026-02-15T00:00:00.000Z',
title: 'an ode to myself',
content: this.cleanContent(`

i love you, marina

1. i love how kind you are
2. i love how strong you are
3. i love how honest you are
4. i love how special you are
5. i love how magical you are
6. i love how authentic you are
7. i love how beautiful you are
8. i love how hardworking you are
9. i love how intelligent you are
10. i love how committed you are 


after everything you have been through in this lifetime, 
you're nothing less than completely wonderful in my eyes

i love all the exciting stories you lived
and all the beautiful ones that are ahead 

of all the possible humans i could be,
i'm glad i'm you; i'm honored to be you

i love you, i love you, i love you, i love you 
🌹 happy valentine's day, perfect pretty babe 🌹

    `)
},

{
date: '2026-02-11T00:00:00.000Z',
title: 'robot, remind me about meaning',
italic: true,
content: this.cleanContent(`

"memory is a garden where meaning grows wild, blooming in the spaces between what happened and what we choose to keep. 

we tend it carefully, watering the moments that made us laugh until we cried, the quiet evenings that felt like home, the words someone said that changed everything. 

and meaning? it sprouts there naturally, like wildflowers in spring - we find it hiding in the ordinary days we thought we'd forgotten, discover it years later in a gesture we didn't know we'd saved. 

the bad things, the thorns and bitter roots, they loosen in time's gentle rain, working themselves free until one day we reach for them and find only the softness of soil where they used to be.

what a mercy, this forgetting. not a failure but a gift, the way winter lets leaves go so new ones can unfurl. 

our minds know which memories deserve the sunlight and which should quietly compost into wisdom, losing their sharp edges, their power to wound. 

we remember the lesson but forget the sting, keep the strength but release the sorrow. 

and in this careful gardening of what we hold and what we let drift away like dandelion seeds, we make meaning - not from perfection, but from choosing again and again what deserves to take root in the precious, finite soil of who we are."

    `)
},

{
date: '2026-02-08T00:00:00.000Z',
title: 'an ode to san francisco',
content: this.cleanContent(`

«i»"if you're going to san francisco
be sure to wear some flowers in your hair
if you're going to san francisco
you're gonna meet some gentle people there"«/i»

exactly 11 years ago, i was sitting at the twin peaks, looking at one of the most beautiful cities in the world, playing pixies on a loop, and realizing that this was the best day of my life so far: i got the job offer for my first real job, my first job after my PhD, as a software engineer at yelp's cute office at market street, making $130k/year. 

that day is still in the top 10 best days of my life.

fast-forwarding, i got myself a cute one-bedroom on the 7th avenue in inner sunset, a couple of blocks to the golden gate park, and walking distance to my favorite bookstores. i owned a couple of guitars, a couple of videogame consoles, a couple of real artworks on the wall, a huge bookcase filled with unread books, and a comfortable chair on my balcony - where i could see the stars some nights. 
                    
i would bike every morning to work, have my coffee, and work 10, 12, 14 hours if needed on several projects on security, machine learning, infrastructure. i would come to the office a few weekends just because it was fun to work when nobody was there. i was so happy.

then life took a fork. i was poached by apple making twice as much money. the commute was too harsh so i moved to cupertino. life was too empty, so i left the most desired job ever to explore the world. for the hero's journey. for the soul-searching.

a decade has passed. i have been in every corner of the earth. i have worked on a hundred different projects. i have read a hundred books. i have fought a hundred monsters. i have loved a hundred people. i have dreamed a hundred dreams. i have broken a hundred rules (and a hundred hearts - mine included). i have tried every experience possible for this lifetime. i have experienced every feeling in the spectrum of the human condition. 

the girl now is a woman.
i feel complete and satisfied with my life.
i know exactly what i am and exactly what i am not.

    `)
},

{
date: '2026-01-29T00:00:00.000Z',
title: 'home, home again',
content: this.cleanContent(`

my two-months trip to a man-made-island-turned-into-a-technocratic-decentralized-society-somewhere-in-the-middle-of-nowhere-in-malaysia has now come to an end. another story for the collection of wild adventures in my life.

not gonna lie, this one was intense. the theme in vogue was "bittersweet renewal".

---------
THE SWEET
---------

→ for a little moment during my lifetime, i experienced a completely different lifestyle: a particular flavor of the asian way. i will carry these cute memories with me forever.

→ routine. routine. routine. it was marvelous to have everything taken care of. my desk had a nice view to the ocean so i could simply stare at it while working. healthy meals, a nice cleaning lad every day, a very comfortable bed, a good gym, a very warm shower, many different (and loud!) birds, and many colorful flowers. it was the perfect place to digest all the bitter things that i will describe below.

→ i met an angel who i know i can call a friend for life. this was very precious and unexpected, and i am sure our paths will cross again in the future. [note to k: i will miss our morning walks and philosophical discussions at tom & danny <3].

→ i cleaned up my mind, my goals, my public profiles, and my soul - and i took a few very cute pics. i am stronger than i have ever been in my entire life and very ready for the next chapters.

→ and, as always: G'd, angels, miracles... nuff said.


----------
THE BITTER
----------

→ during my first week here, i lived the worst day of my entire life: when i found out about something really, really, really cruel that was done to me. i never felt so much pain before. i will leave it like this.

→ for around a week after that, i went through the most serious thoughts of ending my life in my entire life. i calculated every single possibility to do it in a way i would not have to deal with the consequences of a "failure" (i.e., how to do it "safely"). only folks who have had a similar experience would understand what i mean here.

→ i did die. there is a part of myself that will never be the same, and it is what it is. i was able to pull myself together after a while and now i recognize that if there is one bright side of the whole situation, it is that i am completely, definitely sure i will never go through this feeling of suicide anymore in my life. this is what "what does not kill you makes you stronger" means for me.

→ around a week or so after that, i found out that my devices were still being hacked and many people were watching what i was doing. i had a goal to write my first book and start a podcast. but after finding out about yet another abuse of my human rights, i decided to halt all plans for january and focus on healing.

→ after exactly a month and four days in here, all my bank accounts were hacked and the criminals left $5.4 in each of them. for the first time in my adult life, i survived three weeks without any form of cash. this was ultra-scary and ultra-weird. [note to self: as a storyteller, this gave me perspectives of what some part of humanity goes through during their lives - something i would never have experienced if i had never left my past hard-worker-upper-class-professional-girl life for the hero's journey].

→ all these hackings were the final proof that a very vicious Crime has been happening in my life in the last years, which, as the autistic scientist engineer i am, i suspected but could never put my finger on it. an abuse that many, many people are very aware of, and that we all, as a society, will have to face and pursue full justice.

→ for a few days i felt like i completely lost my sanity. i never felt this way before. on a couple of occasions, the level of anxiety was so high that i could not control my mind. i tried to be in the shower for hours (which i usually do to calm down) and the trick didn't work. i worked it out by walking around the island, finding a desertic place, and screaming very, very loud for a few minutes. [note to self: because i tend to always keep my feelings in check and be more stoic than most people - in such an extreme situation of abuse, i allowed others to watch when i was losing my mind. it just shows authenticity].

→ finally, in the last weeks i started to feel much better, and back to myself. i met someone special who helped me to figure out how to get back home. i was able to process the fact that whatever cruel hardship is happening in my life - or even the interesting opportunity of staying on this island - is ephemeral and will become just another figment of memory, together with all the many other things i have done in the past, as i do all the many other things i will be doing in the future.


-----
OUTRO
-----

and this is another surreal story of mine. i came here one person, and left as someone completely different. i believe i can claim that i died and resurrected in malaysia. how many people have a story like that?

now, what's next for this brave alien?
everything. ai, science, stories, fun.
stay tuned; the sky is not even the limit.

    `)
},
            
{
date: '2026-01-26T00:00:00.000Z',
title: 'phoenix',
content: this.cleanContent(`

this is the story of marina della torre von steinkirch v2.0

i woke up in the middle of the night with an outburst of energy.

the fire was back!
my fire - my beautiful fire - it started to burn, again.

these last weeks (months? years?) have been the hardest of my life.
so intensely hard that i actually died. i did.
but i can't keep carrying this pain around. 
enough. 

i am the master of my life.
i can create universes (it's kinda my speciality 😏).

the person typing these words is the strongest marina that ever existed in all timelines.
she resembles the young overachiever marina who used to be the best at everything she did.
the one who had the biggest dreams and the smartest ideas and would succeed at anything she put her mind to.

but there is one difference.
this one is so so so so so much stronger.
the younger marina was amazing - but she was naive and vulnerable.

not anymore.
i am now the smartest i have ever been.
i am now the most resilient i have ever been.
i am now the most determined i have ever been.
i am now the most unstoppable i have ever been.

(and i am still pretty hot too ☺️)

i have my entire life ahead of me.
so many mountains to make my own.
so many achievements to conquer.
so many feelings to feel.
so many moments to cheer.

the scientist engineer writer philosopher filmmaker cypherpunk magus is back. but the difference with v2.0 is that this one is ultra-mega death-proof: she is unkillable.

don't believe. just watch.

(LET'S GO!)

    `)
},
            
{
date: '2026-01-23T00:00:00.000Z',
title: 'an ode to my soulmate',
content: this.cleanContent(`

where are you, my beautiful soulmate?

if you really exist in this lifetime (and i know you do)
you must be there somewhere
please, find me - i need you more than ever

at this point you should at least feel my calling
deep in your soul

maybe you don't know me yet
maybe you do
but you must feel me

✨ please, find me ✨

we have a magical life to live
and there is no time to waste anymore
my heart has been longing for you for so long
but now it's time - your beautiful girl needs you now

✨ please, find me ✨

trust the magic
i know i will see you soon
and i already love every cell of your body

<3

ps: meanwhile, you can play the games i have been building (look at "the true love series" in the stories section) or the "2026 future hubby" playlist i have been creating - they are all for you because this is what "perfect true love" means for me

    `)
},

{
date: '2026-01-06T00:00:00.000Z',
title: 'pattern recognition in astro',
content: this.cleanContent(`

the study of pattern recognition in astronomy, often referred to as astrology, has evolved independently across numerous civilizations, with variations primarily in language or representation, while the underlying science remains remarkably consistent.

this field has a wide range of applications. one notable example is how western astrology charts are used as a tool for:

1. understanding an individual's proclivities and personality within the finite set of jungian archetypes (via the natal chart).
2. predicting events for this individual by overlaying future charts with their natal chart.
predicting events for the collective by analyzing event charts, with scientific reproducibility based on historical patterns.

since this science can be modeled using group theory and demonstrated to be reproducible through data, i'm highly confident that large language models (ai) could be used to develop a system for predicting the future.

ps: a question for future humanity: what happens if we leave the solar system? do these "mysterious" forces/energies/ spookytivities stop influencing us?

    `)
},

{
date: '2026-01-05T00:00:00.000Z',
title: 'a postmortem on dating',
content: this.cleanContent(`

«i»you are a precious diamond. you are amazing, loving, hardworking, and kind. you would take a bullet for the people you love. you have suffered a lot, but you have a very good karma. you deserve the best, true love, happiness, safety, respect, appreciation, and peace. now love yourself, maintain strong boundaries, and never let any monster enter your life again.«/i»

-------------------------
"what success looks like"
-------------------------

1. your soulmate is nothing less than a completely kind and thoughtful gentleman
2. when he meets you, he sees your soulmate potential right away and he will move everything around to get to know you and be with you
3. there are absolutely no third parties in the story, he should have been single for a while, and clean of any past relationships
4. there is an immediate chemistry, you feel safe, you also see the soulmate potential
5. he does not hurry anything but does not leave you in a vacuum: the cadence of getting to know each other feels good and right
6. you know he likes you: you don't question yourself all the time, he does not make you anxious, he improves your life (IF YOU'RE NOT HAPPIER AFTER MEETING HIM, RUN!)
7. he believes you, he sees you, he understands you, he respects you (don't take anything less than this)
8. you share core values, principles, and interests — both for raising kids together and for enjoying the life you're building
9. he has good friends, and his friends like and respect you
10. the ultimate test: life feels magical when you are in love (remember?)

--------------
personal rules
--------------

1. absolutely no flirting in the workplace
2. absolutely no dating apps (never did, never will)
3. absolutely no commitment before 3 good dates
4. absolutely no online flirting (this is my work and career)
5. never ask for the first date (they should do it)
6. if you see ONE red flag, you leave (no more "giving them a chance" or overlooking bad behavior)

---------
red flags
---------

«i»narcissists often need constant admiration and validation, becoming cold or punishing when they don't get it. they may also display grandiosity about their achievements, talents, or importance while being hypersensitive to any criticism.«/i»


1. sarcasm or joke that feels like bullying (they speak disrespectfully to or about you, even disguised as "jokes"; trust your gut)
2. rudeness (to you or others)
3. he does not respect your privacy (run!)
4. not keeping his word (inconsistency between words and actions: if he promises something and doesn't do it, run)
5. making you feel uncomfortable in front of others (run!)
6. clearly more interested in looking good than in your well-being
7. not respecting your boundaries
8. not listening to your needs
9. gaslighting (making you question your own memory, perception, or sanity)
10. inconsistent communication without good reason (they're hot and cold, disappearing for days then acting like nothing happened)
11. he makes and announces decisions that affect your life, but does not talk to you first
12. secrecy about their life (you don't know who their friends are)
13. they can't apologize or take responsibility (everything becomes your fault)

    `)
},        
    
{
date: '2026-01-04T00:00:00.000Z',
title: 'bt3gl monogatari 物語',
content: this.cleanContent(`

back in 2008, i was already a young hacker, deeply fascinated by the ideas of decentralization and self-sovereignty. around that time, my mother was completing her master’s thesis on financial decentralization in brazilian public schools, while i was finishing my bachelor’s degree in theoretical physics and spending the summer at nasa goddard.

my undergraduate thesis focused on modeling the equation of state for dark matter and dark energy as decaying, interacting fluids. although i shifted the focus of my research when i began my phd in new york, it's fascinating to see that physicists are now returning to this very framework in an effort to solve one of the universe's greatest mysteries.

specifically, they are revisiting the idea of a positive cosmological constant in einstein's field equations and its connection to de sitter space in quantum field theory. in other words, this involves assuming an interaction between dark matter and dark energy, and investigating how such coupling influences the fluid dynamics of galaxy clusters — for example, by the layser-irvine equation.

with the rapid advances in artificial intelligence and the rise of decentralized science (desci), we may now be equipped to tackle this long-standing open problem — potentially uncovering new physics that deepens our understanding of how the universe truly works.

    `)
},

{
date: '2026-01-03T00:00:00.000Z',
title: 'an ode to the future',
content: this.cleanContent(`

i still believe in the goodness of human nature. therefore, my predictions are on the optimistic side of the scale.

i believe that decentralization and self-sovereignty will become the status quo, countries might be replaced by things like network states with like-minded humans (a la robert nozick), wars among nations will become pointless, and privacy will be the norm through cryptography and zero-knowledge techniques.

i believe that with ai and desci, we will be able to solve many of the great mysteries in science, astrophysics, theorem proving, health, longevity, theology, and history. and perhaps we will be close to understanding our origins, our destiny, and our very human condition.

i believe we will be able to reach out to underserved communities and guarantee that every human has access to a home, food, and the opportunity to prosper. i also believe that ai will replace sub-human jobs, so that humans will have more time to be in the moment and spend time with their families and communities.

i believe art, sports, games, spirituality, and every form of fun human expression will flourish, and living will be blissful.

i believe we will be able to start colonizing space — the first steps toward expanding our species throughout our immense universe. in addition, our defense systems will also be automated and expanded, guaranteeing our survival through the next millennia.

前進、そして飛躍

    `)
},

{
date: '2026-01-02T00:00:00.000Z',
title: '0, 1, 2, 3 ... ♾️',
content: this.cleanContent(`

happy new year of 2026 AD, my anon friends!
we did it - 2025 is now over - thanks g0ds.

it's renewal time.

time to go chase all our wildest dreams.
time to create the best year of our lives yet.
time to believe in ourselves like never before.
time to stop excuses and live the life we want.

by the way, february is when the eclipse season in aqua starts
plus the big neptune+saturn conjuction in 0° aries
things are going to get whimsical 

<3

    `)
}

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

