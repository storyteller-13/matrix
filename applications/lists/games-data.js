/**
 * The games of my youth – one table per console / setup, unranked.
 * Add a game with { title: 'name' } (optionally url: '') inside its category's `games`.
 */

const GAMES_YOUTH = {
    title: 'the games of my youth',
    shareId: 'games-youth',
    categories: [
        {
            id: 'atari-arcades',
            label: 'atari 2600 / arcades',
            ranked: false,
            games: [
                { title: 'space invaders' },
                { title: 'asteroids' },
                { title: 'pac-man' },
                { title: 'demon attack' },
                { title: 'raiders of the lost ark' },
                { title: 'donkey kong' },
            ],
        },
        {
            id: 'snes',
            label: 'snes',
            ranked: false,
            games: [
                { title: 'super mario, super mario world' },
                { title: 'super mario kart' },
                { title: 'toejam & earl 🎁' },
                { title: 'the legend of zelda' },
                { title: 'sonic' },
                { title: 'final fantasy vi' },
                { title: 'super metroid' },
                { title: 'street fighter ii' },
                { title: 'bomberman series' },
            ],
        },
        {
            id: 'n64',
            label: 'nintendo 64',
            ranked: false,
            games: [
                { title: 'the legend of zelda' },
                { title: 'super mario 64' },
                { title: 'goldeneye 007' },
                { title: 'mario kart 64' },
                { title: 'doom 64' },
                { title: 'bomberman 64' },
            ],
        },
        {
            id: 'playstation-xbox',
            label: 'playstations and/or xboxes',
            ranked: false,
            games: [
                { title: 'metal gear solid' },
                { title: 'silent hill 1 && 2' },
                { title: 'resident evil series' },
                { title: 'tomb raider series' },
                { title: 'tony hawk\'s pro skater 2' },
                { title: 'final fantasy series' },
                { title: 'god of war' },
                { title: 'castlevania' },
                { title: 'devil may cry series' },
                { title: 'gta series' },
                { title: 'the witcher' },
                { title: 'bloodborne' },
                { title: 'batman: arkham city' },
                { title: 'call of duty' },
                { title: 'red dead redemption 2' },
                { title: 'halo series' },
                { title: 'star wars series' },
                { title: 'borderlands 2' },
                { title: 'dead space 1 && 2' },
                { title: 'dead rising 1 && 2' },
                { title: 'tom clancy' },
                { title: 'the elder scrolls' },
                { title: 'mass effect 2' },
                { title: 'half-life / portal 2' },
                { title: 'fallout series' },
            ],
        },
        {
            id: 'pc-lan',
            label: 'pc lan setup',
            ranked: false,
            games: [
                { title: 'blizzard classics: warcrafts, starcrafts, diablos, overwatch (bonus: the legend of california)' },
                { title: 'counter-strike' },
                { title: 'age of empires series' },
                { title: 'quake iii arena / quake ii' },
                { title: 'duke nukem 3d' },
                { title: 'wolfenstein' },
                { title: 'left 4 dead 1 && 2' },
                { title: 'simcity series' },
            ],
        },
    ],
};

window.GAMES_YOUTH = GAMES_YOUTH;
