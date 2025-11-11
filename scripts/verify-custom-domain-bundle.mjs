#!/usr/bin/env node
/**
 * Verifies that the custom domain is serving a Production bundle with VITE_MAPBOX_TOKEN injected.
 * Fetches the custom domain HTML, finds the JS asset, and checks for token injection.
 */

import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

const CUSTOM_URL = 'https://hesam.me/quakeweather/';

function pickAssetSrc(document) {
  const scripts = [...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src'));
  // Prefer the main index chunk under /quakeweather/assets/
  return scripts.find(s => /\/quakeweather\/assets\/index-.*\.js$/.test(s)) || scripts.find(s => /\/quakeweather\/assets\/.*\.js$/.test(s));
}

try {
  const html = await (await fetch(CUSTOM_URL, { redirect: 'follow' })).text();
  const { window: { document } } = new JSDOM(html);
  const src = pickAssetSrc(document);

  if (!src) {
    console.error('❌ No JS asset found in custom-domain HTML (wrong base or serve).');
    process.exit(1);
  }

  const assetUrl = new URL(src, CUSTOM_URL).toString();
  const js = await (await fetch(assetUrl)).text();

  const hasToken = /pk\.[A-Za-z0-9._-]{20,}/.test(js);
  const hasPlaceholder = /import\.meta\.env\.VITE_MAPBOX_TOKEN/.test(js);

  console.log(`ℹ️ Checked asset: ${assetUrl}`);
  console.log(`   Token present: ${hasToken ? '✅' : '❌'}`);
  console.log(`   Placeholder remains: ${hasPlaceholder ? '❌' : '✅'}`);

  if (!hasToken || hasPlaceholder) {
    console.error('❌ Custom domain is serving a bundle without injected token (or still has placeholders).');
    console.error('   Fix: ensure Production build has VITE_MAPBOX_TOKEN "Available during build" and that you deployed to Production.');
    process.exit(1);
  }

  console.log('✅ Custom domain is serving a token-injected Production bundle.');
} catch (e) {
  console.error('❌ Verification failed:', e.message);
  process.exit(1);
}

