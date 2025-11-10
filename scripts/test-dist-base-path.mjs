import { readFile } from 'node:fs/promises';
const html = await readFile('dist/index.html', 'utf8');
if (!/\/(quakeweather)\/assets\//.test(html)) {
  console.error('❌ dist/index.html does not reference /quakeweather/assets/... (wrong Vite base).');
  process.exit(1);
}
console.log('✅ dist/index.html uses /quakeweather/ base for assets.');

