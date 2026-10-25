// Compila la app a un único index.html autocontenido (JS + CSS inline).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'

rmSync('dist', { recursive: true, force: true })
mkdirSync('dist', { recursive: true })

const result = await Bun.build({
  entrypoints: ['src/main.tsx'],
  outdir: 'dist/assets',
  minify: true,
  target: 'browser',
  naming: '[name].[ext]',
  define: { 'process.env.NODE_ENV': '"production"' },
})
if (!result.success) {
  for (const l of result.logs) console.error(l)
  process.exit(1)
}

const js = readFileSync('dist/assets/main.js', 'utf8').replace(/<\/script/gi, '<\\/script')
let css = ''
try { css = readFileSync('dist/assets/main.css', 'utf8') } catch {}
const html = readFileSync('index.html', 'utf8')
  .replace('<script type="module" src="/src/main.tsx"></script>', '')
  .replace('</head>', `<style>${css}</style>\n</head>`)
  .replace('</body>', `<script type="module">${js}</script>\n</body>`)
writeFileSync('dist/index.html', html)
console.log('OK dist/index.html', (html.length / 1024).toFixed(0) + ' KB')

// Variante para publicar como Artifact (sin <html>/<head>/<body>)
const fontsLink = html.match(/<link href="https:\/\/fonts\.googleapis[^>]+>/)?.[0] ?? ''
const art = `<title>aka dosa</title>
<meta name="description" content="Plataforma de búsqueda y solicitud de productos internacionales">
${fontsLink}
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`
writeFileSync('dist/artifact.html', art)
console.log('OK dist/artifact.html', (art.length / 1024).toFixed(0) + ' KB')
