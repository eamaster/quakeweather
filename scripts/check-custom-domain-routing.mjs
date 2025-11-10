#!/usr/bin/env node
/**
 * Script to diagnose custom domain routing issue
 * Checks which deployment the custom domain is pointing to
 */

console.log('🔍 Diagnosing Custom Domain Routing Issue\n');

// Check what hesam.me/quakeweather/ is actually serving
const customDomainUrl = 'https://hesam.me/quakeweather/';
const latestDeployment = 'https://1fc0a156.quakeweather.pages.dev/';
const mainAlias = 'https://main.quakeweather.pages.dev/';

console.log('Checking custom domain...');
try {
  const response = await fetch(customDomainUrl);
  const html = await response.text();
  
  // Check which build is being served
  const hasOldBuild = /index-CSBluatQ\.js/.test(html);
  const hasNewBuild = /index-u8v2K9Y_\.js/.test(html);
  const hasToken = /pk\.eyJ/.test(html);
  
  console.log(`  Status: ${response.status}`);
  console.log(`  Old build (CSBluatQ): ${hasOldBuild ? '⚠️ YES' : '✅ NO'}`);
  console.log(`  New build (u8v2K9Y_): ${hasNewBuild ? '✅ YES' : '❌ NO'}`);
  console.log(`  Token in HTML: ${hasToken ? '✅' : '❌'}`);
  
  if (hasOldBuild) {
    console.log('\n⚠️  ISSUE FOUND: Custom domain is serving OLD build!');
    console.log('\n📋 SOLUTION:');
    console.log('The custom domain hesam.me/quakeweather/ is pointing to an old deployment.');
    console.log('Since there\'s no deployment setting to change, it\'s likely configured via:');
    console.log('  1. Cloudflare Worker (routing hesam.me/quakeweather/* to Pages)');
    console.log('  2. Cloudflare Page Rule (forwarding hesam.me/quakeweather/* to Pages)');
    console.log('  3. DNS/Zone configuration (hesam.me might be in a different zone)');
    console.log('\n🔧 FIX STEPS:');
    console.log('1. Go to Cloudflare Dashboard for hesam.me domain');
    console.log('2. Check Workers & Pages → Workers for any Worker routing /quakeweather/*');
    console.log('3. Check Rules → Page Rules for any rule routing /quakeweather/*');
    console.log('4. Update the Worker/Page Rule to point to: https://main.quakeweather.pages.dev');
    console.log('   OR: https://1fc0a156.quakeweather.pages.dev (latest deployment)');
    console.log('\n5. After updating, wait 1-2 minutes for changes to propagate');
    console.log('6. Test: Visit https://hesam.me/quakeweather/ and hard refresh (Ctrl+Shift+R)');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('\nChecking latest deployment...');
try {
  const response = await fetch(latestDeployment);
  const html = await response.text();
  const hasNewBuild = /index-u8v2K9Y_\.js/.test(html);
  const hasToken = /pk\.eyJ/.test(html);
  
  console.log(`  Status: ${response.status}`);
  console.log(`  New build (u8v2K9Y_): ${hasNewBuild ? '✅ YES' : '❌ NO'}`);
  console.log(`  Token in HTML: ${hasToken ? '✅' : '❌'}`);
  
  if (!hasToken) {
    console.log('\n⚠️  WARNING: Latest deployment also missing token!');
    console.log('This means the build process on Cloudflare doesn\'t have VITE_MAPBOX_TOKEN.');
    console.log('\n🔧 FIX: Set VITE_MAPBOX_TOKEN in Cloudflare Pages environment variables');
    console.log('  1. Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/environment-variables');
    console.log('  2. Add VITE_MAPBOX_TOKEN with your token');
    console.log('  3. ✅ CHECK "Available during build"');
    console.log('  4. Redeploy (or wait for next Git push to trigger build)');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

