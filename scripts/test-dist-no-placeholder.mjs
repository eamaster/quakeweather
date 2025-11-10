import { readdir, readFile } from 'node:fs/promises';
const files = (await readdir('dist/assets')).filter(f => f.endsWith('.js'));
let ok = true;
for (const f of files) {
  const s = await readFile(`dist/assets/${f}`, 'utf8');
  if (s.includes('import.meta.env.VITE_MAPBOX_TOKEN')) { console.error(`❌ Placeholder not replaced in: ${f}`); ok = false; }
}
if (!ok) process.exit(1);
console.log('✅ No un-replaced VITE_MAPBOX_TOKEN placeholders in dist bundle');


