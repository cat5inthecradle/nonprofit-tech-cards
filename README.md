# Nonprofit Tech Cards

A deck of 30 playing cards designed to help nonprofits assess their technology health. Built by [dsmHack](https://dsmhack.org).

**25 topic cards** across five categories — Communications, Day-to-Day Tools, People & Devices, Infrastructure & Safety, and Strategy & Growth — plus **5 game cards** with facilitation activities for teams, boards, and solo EDs.

Each card has a plain-language question and a "Why it matters" explanation. No jargon, no prerequisites. Spread them on a table and start talking.

## Quick start

All you need is a browser:

1. Clone this repo
2. Open `cards.html` in your browser, or run a local server:

```bash
npm install
npm run dev
```

Then visit [http://localhost:3000/cards.html](http://localhost:3000/cards.html)

## Editing cards

All card content lives in **`cards.json`**. Each card looks like this:

```json
{
  "number": "01",
  "category": "comm",
  "title": "Email Newsletters & Campaigns",
  "description": "How do you stay in touch with supporters and donors?...",
  "why": "Email is still the most reliable way to reach people..."
}
```

Game cards use `"bestFor"` instead of `"why"`. Edit the JSON, refresh the browser — that's it.

## Printing

The cards are poker-sized (2.5 x 3.5 inches) and laid out 8 per page for home printing. Use your browser's print dialog from `cards.html`.

### Professional printing (MakePlayingCards.com, etc.)

Export individual card images at 600 DPI with bleed margins:

```bash
npm run export
```

This generates one PNG per card in the `card-images/` folder, sized at 1644 x 2244 px (2.74 x 3.74 in) with 0.12-inch bleed on all sides. Upload directly to your print service.

## npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start a local dev server on port 3000 |
| `npm run export` | Generate card images for professional printing |
| `npm run clean` | Delete generated card images |

## Project structure

```
cards.json          ← All card content (edit this)
cards.html          ← Card renderer (layout + styles + export mode)
export-cards.mjs    ← Puppeteer script for generating print-ready PNGs
package.json
```

## Categories

| Key | Category | Color |
|---|---|---|
| `comm` | Communications & Content | Orange |
| `tools` | Day-to-Day Tools | Blue |
| `people` | People & Devices | Purple |
| `infra` | Infrastructure & Safety | Green |
| `strategy` | Strategy & Growth | Red |
| `game` | Game / How to Play | Teal |

## License

[BSD Zero Clause License](LICENSE) — do whatever you want with this.
