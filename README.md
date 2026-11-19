# Hii. Hannohh!! — ASCII Gallery prototype

## Run locally
Requires Node.js 18+. Run `npm install` then `npm run dev`.

## Included
- Hero with your supplied portrait inside an animated organic shape
- Horizontal, rounded artwork cards with hover lift and pointer tilt
- Black ASCII preview panel with copy and TXT download
- Runner-style jump interaction and playable Tic Tac Toe
- Creator footer for Appu / @aabhijithh

## Important prototype note
The ASCII panel currently uses sample placeholder text. Your Pillow converters are not connected yet. In the next stage, we'll define a standard converter interface and run each folder's `convert.py` during the Netlify build, generating static ASCII outputs and a gallery manifest. Netlify static hosting does not execute arbitrary Python when a visitor clicks a card.

## Planned artwork structure
```text
artworks/
  rose/
    image.jpg
    convert.py
  landscape/
    image.jpg
    convert.py
```

## Fonts / licences
CSS expects `public/fonts/Human-Rarity.otf` and `public/fonts/Pixelta.ttf`. The font files are not included in this archive because the supplied licence notices restrict redistribution and state personal-use-only terms. Place your own locally licensed copies in that folder for local preview. Confirm web-embedding and redistribution permissions before publishing them in a public repository or deploying. Fallback fonts are used until then.

## Netlify
Build command: `npm run build` · Publish directory: `dist`.
