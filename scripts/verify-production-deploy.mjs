#!/usr/bin/env node
/**
 * Verifies that the last deployment is PRODUCTION for the quakeweather project.
 * This ensures we're deploying to Production, not Preview.
 */

import { execSync } from 'node:child_process';

let output;
try {
  output = execSync('npx wrangler pages deployment list --project-name=quakeweather --json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
} catch (e) {
  console.error('❌ Failed to list deployments:', e.message);
  console.error('stderr:', e.stderr?.toString() || '');
  process.exit(1);
}
let list;
try {
  list = JSON.parse(output);
} catch (e) {
  console.error('❌ Bad JSON from wrangler:', e.message);
  console.error('Output:', output);
  process.exit(1);
}

if (!Array.isArray(list) || !list.length) {
  console.error('❌ No deployments returned');
  process.exit(1);
}

const latest = list[0];
const env = latest?.Environment || (latest?.production ? 'Production' : 'Preview');
const deploymentId = latest?.Id || latest?.id || '<unknown>';
const deploymentUrl = latest?.Deployment || latest?.url || '';

console.log(`ℹ️ Latest deployment: ${deploymentId} [${env.toUpperCase()}] → ${deploymentUrl}`);

if (env !== 'Production' && env !== 'production') {
  console.error('❌ Latest deployment is not PRODUCTION. Use npm run pages:deploy:prod.');
  process.exit(1);
}

console.log('✅ Latest deployment is PRODUCTION.');
