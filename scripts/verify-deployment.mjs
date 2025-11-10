#!/usr/bin/env node
/**
 * Diagnostic script to verify deployment configuration
 * Checks if HTML served has correct token and base paths
 */

const urls = [
  'https://e7ce9c66.quakeweather.pages.dev/',
  'https://main.quakeweather.pages.dev/',
  'https://hesam.me/quakeweather/',
];

console.log('🔍 Verifying deployments...\n');

for (const url of urls) {
  try {
    console.log(`Checking: ${url}`);
    const response = await fetch(url);
    const html = await response.text();
    
    // Check for token in HTML (should be embedded in JS)
    const hasToken = /pk\.eyJ/.test(html);
    const hasCorrectBase = /\/quakeweather\/assets\//.test(html);
    const hasOldBase = /\/assets\/index-CSBluatQ\.js/.test(html);
    const hasNewBase = /\/assets\/index-u8v2K9Y_\.js/.test(html);
    
    console.log(`  Status: ${response.status}`);
    console.log(`  Token embedded: ${hasToken ? '✅' : '❌'}`);
    console.log(`  Correct base path: ${hasCorrectBase ? '✅' : '❌'}`);
    console.log(`  Old build (CSBluatQ): ${hasOldBase ? '⚠️ YES' : '✅ NO'}`);
    console.log(`  New build (u8v2K9Y_): ${hasNewBase ? '✅ YES' : '❌ NO'}`);
    
    if (hasOldBase) {
      console.log(`  ⚠️  WARNING: This URL is serving an OLD build without token!`);
    }
    
    console.log('');
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}\n`);
  }
}

