import { spawnSync } from 'node:child_process';
const r = spawnSync('npm', ['run','build:check'], { stdio: 'inherit', env: { ...process.env, VITE_MAPBOX_TOKEN: '' } });
if (r.status === 0) { console.error('❌ Expected build to fail without VITE_MAPBOX_TOKEN, but it succeeded.'); process.exit(1); }
console.log('✅ Build correctly failed without VITE_MAPBOX_TOKEN');


