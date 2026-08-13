/** Dev tool: render every pose in the library into one PNG contact sheet. */
import sharp from 'sharp'
import { POSES } from '../src/data/poses.ts'

const ids = Object.keys(POSES)
const COLS = 6
const CELL_W = 240
const CELL_H = 200
const rows = Math.ceil(ids.length / COLS)

function propSvg(prop) {
  const s = 'stroke="#7d86a3" stroke-linecap="round"'
  switch (prop.kind) {
    case 'floor':
      return `<line x1="6" y1="72" x2="114" y2="72" ${s} stroke-width="2"/>`
    case 'wall':
      return `<line x1="${prop.x}" y1="4" x2="${prop.x}" y2="72" ${s} stroke-width="2"/>`
    case 'bar':
      return `<line x1="${prop.x1}" y1="${prop.y}" x2="${prop.x2}" y2="${prop.y}" ${s} stroke-width="2.6"/>
        <line x1="${prop.x1 + 2}" y1="${prop.y}" x2="${prop.x1 + 2}" y2="2" ${s} stroke-width="2" opacity="0.5"/>
        <line x1="${prop.x2 - 2}" y1="${prop.y}" x2="${prop.x2 - 2}" y2="2" ${s} stroke-width="2" opacity="0.5"/>`
    case 'pole':
      return `<line x1="${prop.x}" y1="2" x2="${prop.x}" y2="72" ${s} stroke-width="2.6"/>`
    case 'box':
      return `<rect x="${prop.x}" y="${prop.y}" width="${prop.w}" height="${prop.h}" rx="3" fill="#7d86a3" fill-opacity="0.16" stroke="#7d86a3" stroke-width="1.6"/>`
    case 'ball':
      return `<circle cx="${prop.x}" cy="${prop.y}" r="${prop.r}" fill="none" stroke="#7d86a3" stroke-width="1.8"/>`
  }
}

let cells = ''
ids.forEach((id, i) => {
  const pose = POSES[id]
  const col = i % COLS
  const row = Math.floor(i / COLS)
  const x = col * CELL_W
  const y = row * CELL_H
  const body = pose.lines
    .map((line) => `<polyline points="${line.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#bef264" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join('')
  cells += `<g transform="translate(${x + 20},${y + 14}) scale(1.65)">
    <rect x="-4" y="-4" width="128" height="92" rx="6" fill="#141722"/>
    ${(pose.props ?? []).map(propSvg).join('')}
    ${body}
    <circle cx="${pose.head[0]}" cy="${pose.head[1]}" r="5" fill="#bef264"/>
  </g>
  <text x="${x + CELL_W / 2}" y="${y + CELL_H - 14}" font-size="15" fill="#aab1c7" text-anchor="middle" font-family="sans-serif">${id}</text>`
})

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * CELL_W}" height="${rows * CELL_H}">
  <rect width="100%" height="100%" fill="#0a0b0f"/>
  ${cells}
</svg>`

await sharp(Buffer.from(svg)).png().toFile('/tmp/pose-sheet.png')
console.log(`rendered ${ids.length} poses to /tmp/pose-sheet.png (${COLS * CELL_W}x${rows * CELL_H})`)
