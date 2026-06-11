import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BASE = '/Salamander-Labs';
const PREVIEW_URL = `${BASE}/preview/salamander1.mp4`;

// Absolute path to the bundled salamander image used as the thumbnail.
const THUMBNAIL_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'salamander1.jpg'
);

async function setColor(page, hex) {
  await page.locator('#target-color').evaluate((el, val) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
      .set.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, hex);
}

// Helper: set the threshold slider to a given value and wait for
// React's onChange handler to fire and the canvas to re-draw.
async function setThreshold(page, value) {
  await page.locator('#threshold').evaluate((el, val) => {
    // Use the native setter so React's controlled-input check sees the change.
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    ).set.call(el, String(val));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

// Helper: return true once the canvas has non-zero dimensions,
// meaning the image was drawn and binarisation has run.
function canvasIsReady() {
  const canvas = document.querySelector('canvas');
  return canvas && canvas.width > 0 && canvas.height > 0;
}

// Helper: scan the canvas for at least one orange pixel (the centroid dot).
// Orange: rgb(249, 115, 22) — allow ±5 tolerance per channel.
function findOrangeDot() {
  const canvas = document.querySelector('canvas');
  if (!canvas || canvas.width === 0) return null;
  const ctx = canvas.getContext('2d');
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < data.length; i += 4) {
    if (
      Math.abs(data[i]     - 249) <= 5 &&
      Math.abs(data[i + 1] - 115) <= 5 &&
      Math.abs(data[i + 2] -  22) <= 5
    ) {
      const pixelIndex = i / 4;
      return {
        x: pixelIndex % canvas.width,
        y: Math.floor(pixelIndex / canvas.width),
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      };
    }
  }
  return null;
}

// Helper: count white (255,255,255) pixels on the canvas.
function countWhitePixels() {
  const canvas = document.querySelector('canvas');
  if (!canvas || canvas.width === 0) return 0;
  const ctx = canvas.getContext('2d');
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) count++;
  }
  return count;
}

test.describe('Preview page – centroid overlay', () => {
  test.beforeEach(async ({ page }) => {
    // Serve the thumbnail deterministically from the local image instead of
    // depending on the backend proxy (localhost:8080), which isn't running in CI.
    await page.route('**/thumbnail/**', async (route) => {
      await route.fulfill({ path: THUMBNAIL_FILE, contentType: 'image/jpeg' });
    });

    await page.goto(PREVIEW_URL);
    // Wait for the full useEffect chain:
    // fetch → mock delay → image load → binarisation → canvas draw
    await page.waitForFunction(canvasIsReady, { timeout: 15000 });
  });

  // -----------------------------------------------------------------------
  test('canvas renders with image dimensions', async ({ page }) => {
    const { width, height } = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return { width: canvas.width, height: canvas.height };
    });
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  // -----------------------------------------------------------------------
  test('binarisation produces only black and white pixels', async ({ page }) => {
    // The binarisation loop sets every pixel to 0 or 255 — no mid-tones.
    const hasNonBinaryPixel = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // Allow the orange centroid dot (non-binary) — skip those pixels.
        const isOrange =
          Math.abs(r - 249) <= 5 && Math.abs(g - 115) <= 5 && Math.abs(b - 22) <= 5;
        // Also allow the black border stroke drawn around the dot.
        const isBlack = r === 0 && g === 0 && b === 0;
        const isWhite = r === 255 && g === 255 && b === 255;
        if (!isBlack && !isWhite && !isOrange) return true;
      }
      return false;
    });
    // Every pixel must be black, white, or the centroid dot colour.
    expect(hasNonBinaryPixel).toBe(false);
  });

  // -----------------------------------------------------------------------
  test('raising threshold increases the number of white (active) pixels', async ({ page }) => {
    // Dark red #610000 (R=97) targets the salamander body, not the pink background.
    await setColor(page, '#610000');
    await setThreshold(page, 30);
    // Let the low-threshold render settle before measuring the baseline.
    await page.waitForTimeout(300);
    const whiteBefore = await page.evaluate(countWhitePixels);

    await setThreshold(page, 120);
    await page.waitForFunction(
      (prev) => {
        const canvas = document.querySelector('canvas');
        if (!canvas || canvas.width === 0) return false;
        const ctx = canvas.getContext('2d');
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) count++;
        }
        return count > prev;
      },
      whiteBefore,
      { timeout: 8000 }
    );

    const whiteAfter = await page.evaluate(countWhitePixels);
    expect(whiteAfter).toBeGreaterThan(whiteBefore);
  });

  // -----------------------------------------------------------------------
  test('centroid dot is drawn on the canvas', async ({ page }) => {
    // Dark red #610000 (R=97) matches the salamander body, so the BFS finds a
    // connected region and draws the orange dot.
    await setColor(page, '#610000');
    await setThreshold(page, 80);

    await page.waitForFunction(findOrangeDot, { timeout: 8000 });

    const dot = await page.evaluate(findOrangeDot);
    expect(dot).not.toBeNull();
  });

  // -----------------------------------------------------------------------
  test('centroid dot lies inside canvas bounds', async ({ page }) => {
    await setColor(page, '#610000');
    await setThreshold(page, 80);
    await page.waitForFunction(findOrangeDot, { timeout: 8000 });

    const dot = await page.evaluate(findOrangeDot);
    expect(dot.x).toBeGreaterThan(0);
    expect(dot.x).toBeLessThan(dot.canvasWidth);
    expect(dot.y).toBeGreaterThan(0);
    expect(dot.y).toBeLessThan(dot.canvasHeight);
  });

  // -----------------------------------------------------------------------
  test('lowering threshold to 0 removes the centroid dot', async ({ page }) => {
    // With threshold=0 every pixel must be exactly the target colour to match.
    // No pixel in a real photo is pure #ff0000, so the canvas is all black
    // and no connected region exists — no dot should be drawn.
    await setThreshold(page, 0);

    // Give React time to re-render and the effect to run.
    await page.waitForFunction(
      () => {
        const canvas = document.querySelector('canvas');
        if (!canvas || canvas.width === 0) return false;
        const ctx = canvas.getContext('2d');
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // True once all pixels are black (no white, no orange).
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) return false;
        }
        return true;
      },
      { timeout: 8000 }
    );

    const dot = await page.evaluate(findOrangeDot);
    expect(dot).toBeNull();
  });
});
