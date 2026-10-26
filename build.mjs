// Assembles client.js from src/skin.css plus one wallpaper image.
//
// The client bundle is a single served file, so the picture travels as a data
// URI inside the stylesheet instead of a sibling request.
//
//   node build.mjs assets/wallpaper.webp   # your own picture
//   node build.mjs                         # no picture -> warm gradient fallback
//
// The repository deliberately ships no artwork: pick an image you have the
// right to use. Without one the skin still loads, painted as a lantern-light
// gradient.
import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
const readText = (rel) => fs.readFile(path.join(root, rel), 'utf8')

const MIME = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
}

// Warm lantern light: deep lacquer at the top-left, glowing paper at the centre.
const FALLBACK = [
  'radial-gradient(120% 90% at 50% 0%, rgb(255, 205, 148) 0%, rgba(255, 205, 148, 0) 55%)',
  'linear-gradient(155deg, rgb(46, 26, 18) 0%, rgb(104, 44, 24) 32%, rgb(206, 122, 62) 68%, rgb(255, 216, 164) 100%)',
].join(', ')

const candidate = process.argv[2]
let wallpaper
let value
let note

if (candidate !== undefined) {
  const buffer = await fs.readFile(path.resolve(root, candidate))
  const mime = MIME[path.extname(candidate).toLowerCase()] ?? 'image/jpeg'
  wallpaper = `url("data:${mime};base64,${buffer.toString('base64')}")`
  note = `${candidate} (${(buffer.length / 1024).toFixed(1)} KB)`
} else {
  wallpaper = FALLBACK
  note = 'built-in gradient (no image given)'
}

const [template, cssSource] = await Promise.all([
  readText('src/client.template.js'),
  readText('src/skin.css'),
])

const css = cssSource.replaceAll('__WALLPAPER_VALUE__', wallpaper)
if (css.includes('__WALLPAPER')) throw new Error('unreplaced wallpaper placeholder in skin.css')
if (!template.includes('"__SKIN_CSS__"')) throw new Error('client template is missing the __SKIN_CSS__ slot')

const bundle = template.replace('"__SKIN_CSS__"', JSON.stringify(css))
await fs.writeFile(path.join(root, 'client.js'), bundle)

console.log(`wallpaper: ${note}`)
console.log(`client.js: ${(Buffer.byteLength(bundle) / 1024).toFixed(1)} KB`)
