#!/usr/bin/env node
/**
 * Diagnoses custom domain routing issues for hesam.me/quakeweather/
 * Checks both the custom domain and direct Pages URLs
 */

import fetch from 'node-fetch';

const CUSTOM_DOMAIN = 'https://hesam.me/quakeweather/';
// Get latest deployment from wrangler
let latestDeployment = '7f5885dd.quakeweather.pages.dev'; // Will be updated dynamically
const PAGES_URL = `https://${latestDeployment}/quakeweather/`;

console.log('🔍 Diagnosing Custom Domain Routing Issues\n');
console.log('='.repeat(60));

// Check custom domain
console.log('\n1. Checking Custom Domain:', CUSTOM_DOMAIN);
try {
  const customResponse = await fetch(CUSTOM_DOMAIN, { redirect: 'follow' });
  console.log(`   Status: ${customResponse.status} ${customResponse.statusText}`);
  
  if (customResponse.ok) {
    const html = await customResponse.text();
    const hasAssets = /\/quakeweather\/assets\//.test(html);
    const hasIndex = /index\.html|index-.*\.js/.test(html);
    console.log(`   ✅ Custom domain is accessible`);
    console.log(`   Has asset paths: ${hasAssets ? '✅' : '❌'}`);
    console.log(`   Has index: ${hasIndex ? '✅' : '❌'}`);
    
    if (!hasAssets || !hasIndex) {
      console.log(`   ⚠️  HTML might be incomplete or wrong`);
    }
  } else {
    console.log(`   ❌ Custom domain returns ${customResponse.status}`);
    console.log(`   This means the custom domain is not properly configured.`);
  }
} catch (e) {
  console.log(`   ❌ Error accessing custom domain: ${e.message}`);
}

// Check direct Pages URL
console.log('\n2. Checking Direct Pages URL:', PAGES_URL);
try {
  const pagesResponse = await fetch(PAGES_URL, { redirect: 'follow' });
  console.log(`   Status: ${pagesResponse.status} ${pagesResponse.statusText}`);
  
  if (pagesResponse.ok) {
    const html = await pagesResponse.text();
    const hasAssets = /\/quakeweather\/assets\//.test(html);
    const hasIndex = /index-.*\.js/.test(html);
    console.log(`   ✅ Direct Pages URL is accessible`);
    console.log(`   Has asset paths: ${hasAssets ? '✅' : '❌'}`);
    console.log(`   Has index: ${hasIndex ? '✅' : '❌'}`);
  } else {
    console.log(`   ❌ Direct Pages URL returns ${pagesResponse.status}`);
  }
} catch (e) {
  console.log(`   ❌ Error accessing Pages URL: ${e.message}`);
}

// Check root Pages URL (without /quakeweather/)
console.log('\n3. Checking Root Pages URL: https://4920c58e.quakeweather.pages.dev/');
try {
  const rootResponse = await fetch('https://4920c58e.quakeweather.pages.dev/', { redirect: 'follow' });
  console.log(`   Status: ${rootResponse.status} ${rootResponse.statusText}`);
  
  if (rootResponse.ok) {
    const html = await rootResponse.text();
    console.log(`   ✅ Root Pages URL is accessible`);
    console.log(`   This confirms the deployment exists.`);
  }
} catch (e) {
  console.log(`   ❌ Error accessing root Pages URL: ${e.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('\n📋 DIAGNOSIS:');
console.log('\nIf the custom domain returns 404 but the Pages URL works:');
console.log('  → The custom domain is not properly configured in Cloudflare.');
console.log('\n🔧 SOLUTION:');
console.log('  1. Go to Cloudflare Dashboard: https://dash.cloudflare.com');
console.log('  2. Select the "hesam.me" zone (NOT the quakeweather Pages project)');
console.log('  3. Check for:');
console.log('     - Workers & Pages → Workers (look for Worker routing /quakeweather/*)');
console.log('     - Rules → Page Rules (look for rule matching /quakeweather/*)');
console.log('  4. Update Worker/Page Rule to point to:');
console.log('     https://4920c58e.quakeweather.pages.dev');
console.log('     OR: https://main.quakeweather.pages.dev (always latest)');
console.log('\n  5. Alternative: Configure custom domain in Cloudflare Pages:');
console.log('     - Go to: Pages → quakeweather → Custom domains');
console.log('     - Add: hesam.me with path: /quakeweather');
console.log('\n  6. Wait 2-5 minutes for changes to propagate');
console.log('  7. Test: Visit https://hesam.me/quakeweather/');

