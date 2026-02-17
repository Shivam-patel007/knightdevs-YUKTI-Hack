import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const publicDir = path.join(__dirname, '..', '..', 'public', 'resume-builder')

if (!fs.existsSync(distDir)) {
  console.error('dist folder not found. Run vite build first.')
  process.exit(1)
}

if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true })
}
fs.mkdirSync(publicDir, { recursive: true })

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true })
      copyRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

copyRecursive(distDir, publicDir)
console.log('Copied dist to public/resume-builder')
