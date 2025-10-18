# Birthday Surprise

Interactive birthday website with animated treasure chest and glass rose shards.

## Setup

```bash
npm install
npm start
```

Open http://localhost:3000

## How It Works

1. Treasure chest appears and shakes
2. Click the chest to open it
3. Glass shards fly out and assemble into a rose
4. Hover over each shard to reveal your photos
5. Birthday message appears when all shards are revealed

## Add Your Images

Place your images in `public/images/` directory.
- Supported: JPG, PNG, GIF, WebP, SVG
- The rose automatically adjusts to the number of images

## Customization

**Colors:**
- Background: `styles.css` line 10
- Chest: `styles.css` lines 62-80
- Birthday text: `styles.css` line 211

**Animation Speed:**
- Chest shake: `styles.css` line 77
- Chest open: `styles.css` line 121
- Shard assembly: `script.js` line 157

**Confetti:**
- Amount: `script.js` line 279
