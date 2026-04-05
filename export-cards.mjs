#!/usr/bin/env node
/**
 * export-cards.mjs
 *
 * Renders each card from cards.html as an individual PNG at 600 DPI
 * with bleed margins, ready for MakePlayingCards.com upload.
 *
 * Usage:
 *   npm install puppeteer   (one-time)
 *   node export-cards.mjs
 *
 * Output goes to ./card-images/
 */

import puppeteer from 'puppeteer';
import http from 'http';
import { mkdir, readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, 'card-images');

// 600 DPI with 0.12in bleed per side (36px at 300 DPI = 72px at 600 DPI)
// Card: 2.5×3.5in → with bleed: 2.74×3.74in
const DPI = 600;
const BLEED = 0.12; // inches per side
const FULL_W = (2.5 + 2 * BLEED) * DPI;  // 1644
const FULL_H = (3.5 + 2 * BLEED) * DPI;  // 2244
const CSS_W = (2.5 + 2 * BLEED) * 96;    // ~263 CSS px
const CSS_H = (3.5 + 2 * BLEED) * 96;    // ~359 CSS px
const SCALE = FULL_W / CSS_W;             // ≈ 6.25

const MIME = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
};

/** Spin up a tiny static server so fetch('cards.json') works in Puppeteer */
function startServer() {
  return new Promise(resolve => {
    const server = http.createServer(async (req, res) => {
      const urlPath = new URL(req.url, 'http://localhost').pathname;
      const filePath = join(__dirname, urlPath === '/' ? 'cards.html' : urlPath);
      try {
        const data = await readFile(filePath);
        const ext = extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const { server, baseUrl } = await startServer();
  console.log(`Static server on ${baseUrl}\n`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // First, load the page normally to count non-empty cards
  await page.goto(`${baseUrl}/cards.html`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.card:not(.empty)');
  const cardCount = await page.evaluate(() =>
    document.querySelectorAll('.card:not(.empty)').length
  );
  console.log(`Found ${cardCount} cards to export.\n`);

  for (let i = 0; i < cardCount; i++) {
    // Load in single-card mode
    await page.setViewport({
      width: Math.ceil(CSS_W),
      height: Math.ceil(CSS_H),
      deviceScaleFactor: SCALE,
    });
    await page.goto(`${baseUrl}/cards.html?card=${i}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.export-card');

    // Get the card's label for the filename
    const label = await page.evaluate(() => {
      const card = document.querySelector('.export-card');
      if (!card) return null;
      const num = card.querySelector('.card-number')?.textContent.trim() || '';
      const title = card.querySelector('.card-title')?.textContent.trim() || '';
      return { num, title };
    });

    // Build a clean filename
    const slug = (label?.title || `card-${i}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const num = (label?.num || String(i + 1)).replace(/\s+/g, '');
    const filename = `${num}-${slug}.png`;

    // clip is in CSS pixels; deviceScaleFactor handles the upscale
    await page.screenshot({
      path: join(OUT_DIR, filename),
      clip: { x: 0, y: 0, width: CSS_W, height: CSS_H },
      omitBackground: false,
    });

    console.log(`  ✓ ${filename}`);
  }

  await browser.close();
  server.close();
  console.log(`\nDone! ${cardCount} card images saved to ${OUT_DIR}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
