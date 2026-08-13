/** Rasterize the app icon SVG into the PNG sizes the PWA manifest needs. */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const OUT = new URL('../public/icons/', import.meta.url)
await mkdir(OUT, { recursive: true })

// Handstand mark on a dark rounded tile. The maskable variant keeps the
// figure inside the 80% safe zone.
function iconSvg({ size, padded }) {
  const pad = padded ? 0.18 : 0
  const s = size
  const inner = s * (1 - 2 * pad)
  const off = s * pad
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${padded ? 0 : s * 0.22}" fill="#0a0b0f"/>
  <g transform="translate(${off},${off}) scale(${inner / 64})">
    <g stroke="#bef264" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <line x1="32" y1="50" x2="32" y2="38"/>
      <line x1="32" y1="38" x2="32" y2="22"/>
      <polyline points="32,22 28,12 27,5"/>
      <polyline points="32,22 36,13 38,6"/>
    </g>
    <circle cx="38" cy="43" r="5.2" fill="#bef264"/>
    <line x1="16" y1="54" x2="48" y2="54" stroke="#4c5470" stroke-width="3.2" stroke-linecap="round"/>
  </g>
</svg>`)
}

const jobs = [
  { file: 'icon-192.png', size: 192, padded: false },
  { file: 'icon-512.png', size: 512, padded: false },
  { file: 'icon-maskable-512.png', size: 512, padded: true },
]

for (const { file, size, padded } of jobs) {
  await sharp(iconSvg({ size, padded })).png().toFile(new URL(file, OUT).pathname)
  console.log(`generated ${file}`)
}
