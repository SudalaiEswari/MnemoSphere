const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const sizes = [192, 512]

async function main() {
  for (const size of sizes) {
    const svg = fs.readFileSync(path.join(root, 'public', 'icons', `icon-${size}.svg`))
    const png = await sharp(svg).resize(size, size).png().toBuffer()
    fs.writeFileSync(path.join(root, 'public', 'icons', `icon-${size}.png`), png)
    console.log(`Generated icon-${size}.png (${png.length} bytes)`)
  }
}

main().catch(console.error)
