# Pokelike — Pokemon Roguelike Clone

A browser-based Pokemon Roguelike built with vanilla HTML/CSS/JavaScript.

## Features
- 🎮 Roguelike map with random node events
- ⚔️ Auto-battle with type effectiveness
- ⬟ Catch wild Pokemon (3 choices)
- ✦ Item pickups with real effects
- 🏅 8 Gym Leaders + Elite Four
- 📖 Pokédex tracker
- 🏆 Hall of Fame
- 💾 Auto-save via localStorage
- ☠ Nuzlocke mode

## Play it
Visit: `https://YOUR_USERNAME.github.io/pokelike`

## Setup on GitHub Pages
1. Fork or upload this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Save — your game is live in ~1 minute!

## Tech Stack
- Vanilla HTML/CSS/JavaScript (no framework)
- [PokeAPI](https://pokeapi.co/) for Pokemon data & sprites
- localStorage for save data
- GitHub Pages for hosting (free!)

## File Structure
```
├── index.html
├── css/
│   └── style.css
└── js/
    ├── data.js    ← Pokemon data, items, formulas
    ├── map.js     ← Map generation & rendering
    ├── battle.js  ← Auto-battle simulation
    ├── ui.js      ← UI rendering helpers
    └── game.js    ← Main game loop & state
```
