#!/usr/bin/env node
/**
 * Verifies that the last deployment is PRODUCTION for the quakeweather project.
 * This ensures we're deploying to Production, not Preview.
 */

import { spawnSync } from 'node:child_process';

const r = spawnSync('npx', [
  'wrangler', 'pages', 'deployment', 'list',
  '--project-name=quakeweather',
  '--json'
], { encoding: 'utf8' });

if (r.status !== 0) {
  console.error('❌ Failed to list deployments:\n', r.stdout || r.stderr);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(r.stdout || '[]');
} catch (e) {
  console.error('❌ Could not parse wrangler JSON output');
  process.exit(1);
}

if (!Array.isArray(data) || data.length === 0) {
  console.error('❌ No deployments found.');
  process.exit(1);
}

// Look for most recent deployment - check Environment field
const latest = data[0];
const env = latest?.Environment || (latest?.production ? 'Production' : 'Preview');

console.log(`ℹ️ Latest deployment: ${latest?.Id || latest?.id || '<unknown>'} [${env.toUpperCase()}] → ${latest?.Deployment || latest?.url || ''}`);

if (env !== 'Production' && env !== 'production') {
  console.error('❌ Latest deployment is not PRODUCTION. You likely used --branch=main (Preview).');
  console.error('   Use: npm run pages:deploy:prod');
  process.exit(1);
}

console.log('✅ Latest deployment is PRODUCTION.');

