#!/usr/bin/env node
/**
 * Interactive script to help set Cloudflare Pages environment variables
 * This script provides instructions and can set runtime variables via wrangler CLI
 */

const { execSync } = require('child_process');
const readline = require('readline');

const PROJECT_NAME = 'quakeweather';
const ACCOUNT_ID = '767ce92674d0bd477eef696c995faf16';
const DASHBOARD_URL = `https://dash.cloudflare.com/${ACCOUNT_ID}/pages/view/${PROJECT_NAME}`;
const ENV_VARS_URL = `${DASHBOARD_URL}/settings/environment-variables`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function checkWrangler() {
  try {
    execSync('wrangler --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkAuth() {
  try {
    execSync('wrangler whoami', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function setRuntimeSecret(name, description) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Setting: ${name}`);
  console.log(`Description: ${description}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const answer = await question(`Do you want to set ${name}? (y/n): `);
  if (answer.toLowerCase() !== 'y') {
    console.log(`⏭️  Skipping ${name}`);
    return;
  }

  const value = await question(`Enter value for ${name} (hidden): `);
  if (!value) {
    console.log(`⚠️  Skipping ${name} (empty value)`);
    return;
  }

  if (!checkWrangler()) {
    console.log(`❌ Error: wrangler CLI is not installed`);
    console.log(`   Install it with: npm install -g wrangler`);
    console.log(`   Or set it manually in the dashboard: ${ENV_VARS_URL}`);
    return;
  }

  if (!checkAuth()) {
    console.log(`❌ Error: You are not authenticated with Cloudflare`);
    console.log(`   Run: wrangler login`);
    console.log(`   Or set it manually in the dashboard: ${ENV_VARS_URL}`);
    return;
  }

  try {
    execSync(`echo "${value}" | wrangler pages secret put ${name} --project-name=${PROJECT_NAME}`, {
      stdio: 'inherit'
    });
    console.log(`✅ Successfully set ${name}`);
  } catch (error) {
    console.log(`❌ Failed to set ${name} via CLI`);
    console.log(`   Please set it manually in the dashboard: ${ENV_VARS_URL}`);
  }
}

async function main() {
  console.log('🔧 Cloudflare Pages Environment Variables Setup');
  console.log('==================================================\n');
  console.log(`Project: ${PROJECT_NAME}`);
  console.log(`Account ID: ${ACCOUNT_ID}\n`);

  // VITE_MAPBOX_TOKEN (build-time variable)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. VITE_MAPBOX_TOKEN (BUILD-TIME VARIABLE - REQUIRED)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  IMPORTANT: Build-time variables (VITE_*) MUST be set in the dashboard');
  console.log('   They cannot be set via CLI because they\'re needed during the build process\n');
  console.log('   Manual setup required:');
  console.log(`   1. Go to: ${ENV_VARS_URL}`);
  console.log('   2. Click "Production" environment');
  console.log('   3. Click "Add variable"');
  console.log('   4. Variable name: VITE_MAPBOX_TOKEN');
  console.log('   5. Value: Your Mapbox token (get it from https://account.mapbox.com/access-tokens/)');
  console.log('   6. ✅ CHECK "Available during build" (this is crucial!)');
  console.log('   7. Click "Save"\n');
  await question('Press Enter after you\'ve set VITE_MAPBOX_TOKEN in the dashboard... ');

  // OPENWEATHER_API_KEY (runtime variable)
  await setRuntimeSecret(
    'OPENWEATHER_API_KEY',
    'OpenWeather API key for weather data (REQUIRED)'
  );

  // COHERE_API_KEY (runtime variable, optional)
  await setRuntimeSecret(
    'COHERE_API_KEY',
    'Cohere API key for AI explanations (OPTIONAL)'
  );

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Environment Variables Setup Complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⚠️  IMPORTANT: After setting environment variables, you MUST redeploy:');
  console.log(`   1. Go to: ${DASHBOARD_URL}`);
  console.log('   2. Click "Deployments" tab');
  console.log('   3. Click "Create deployment" or retry the latest deployment');
  console.log('   4. Environment variables are only applied to new builds\n');
  console.log('🔗 Quick links:');
  console.log(`   • Environment Variables: ${ENV_VARS_URL}`);
  console.log(`   • Deployments: ${DASHBOARD_URL}/deployments\n`);

  rl.close();
}

main().catch(console.error);

