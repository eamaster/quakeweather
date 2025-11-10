import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
let token = process.env.VITE_MAPBOX_TOKEN;
if (!token) {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf8');
    const match = envContent.split('\n')
      .map(l => l.trim()).filter(l => l && !l.startsWith('#'))
      .map(l => l.split('=')).find(([k]) => k === 'VITE_MAPBOX_TOKEN');
    if (match && match[1]) token = match[1].trim().replace(/^"(.*)"$/, '$1');
  }
}
const hint = `
❌ VITE_MAPBOX_TOKEN is not set.
REQUIRED because Map.tsx reads import.meta.env.VITE_MAPBOX_TOKEN at build time.
Fix one of:
  • Cloudflare Pages → Settings → Environment Variables → set VITE_MAPBOX_TOKEN and mark "Available during build"; then redeploy.
  • Local/Manual builds: create .env with VITE_MAPBOX_TOKEN=<your Mapbox pk token>.
`;
if (!token) { console.error(hint); process.exit(1); }
if (!/^pk\./.test(token)) { console.error('⚠️ VITE_MAPBOX_TOKEN does not look like a Mapbox "pk." token.'); }


