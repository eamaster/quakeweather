#!/usr/bin/env node
/**
 * Script to help configure custom domain for Cloudflare Pages
 * This provides instructions and checks if the domain is configured correctly
 */

console.log('🔧 Custom Domain Configuration Helper\n');
console.log('Since custom domain configuration is done in Cloudflare Dashboard,');
console.log('follow these steps to point hesam.me/quakeweather/ to the latest deployment:\n');

console.log('📋 Step-by-Step Instructions:\n');

console.log('1. Go to Cloudflare Pages Dashboard:');
console.log('   https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/domains\n');

console.log('2. Check if hesam.me is listed as a custom domain\n');

console.log('3. If hesam.me is NOT listed:');
console.log('   - Click "Set up a custom domain"');
console.log('   - Enter: hesam.me');
console.log('   - Select "Path-based routing"');
console.log('   - Enter path: /quakeweather');
console.log('   - Click "Save"\n');

console.log('4. If hesam.me IS listed but pointing to wrong deployment:');
console.log('   - Click on the domain');
console.log('   - Change "Production deployment" to: e7ce9c66');
console.log('   - Or click "Promote to Production" on the latest deployment\n');

console.log('5. Alternative: Use Cloudflare Workers to route hesam.me/quakeweather/*');
console.log('   - Go to Workers & Pages → Workers');
console.log('   - Create or edit a Worker for hesam.me');
console.log('   - Add route: hesam.me/quakeweather/*');
console.log('   - Forward to: https://e7ce9c66.quakeweather.pages.dev\n');

console.log('6. After configuration, wait 1-2 minutes for DNS to propagate\n');

console.log('7. Test:');
console.log('   - Visit: https://hesam.me/quakeweather/');
console.log('   - Hard refresh: Ctrl+Shift+R');
console.log('   - Check Network tab for: index-u8v2K9Y_.js (new build)\n');

