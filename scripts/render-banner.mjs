import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const rootDir = process.cwd();
const svgPath = resolve(rootDir, 'assets/hookli-banner.svg');
const svg = readFileSync(svgPath, 'utf8');

// Mirror SVG to apps/docs/public/
const docsSvgPath = resolve(rootDir, 'apps/docs/public/hookli-banner.svg');
writeFileSync(docsSvgPath, svg);

// Render 3000x1080 (2x of 1500x540)
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 3000 },
  font: { loadSystemFonts: true },
});
const pngBuffer = resvg.render().asPng();

// Write PNG to all destinations
writeFileSync(resolve(rootDir, 'assets/hookli-banner.png'), pngBuffer);
writeFileSync(resolve(rootDir, 'assets/hookli-banner-simple.png'), pngBuffer);
writeFileSync(resolve(rootDir, 'apps/docs/public/hookli-banner.png'), pngBuffer);

console.log('✓ Successfully rendered hookli-banner across all assets and public surfaces (3000x1080)');
