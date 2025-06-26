#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building MindTrace for mobile deployment...');

// Step 1: Build the client for mobile
console.log('1. Building client for mobile deployment...');
try {
  execSync('npx vite build --config vite.config.mobile.ts', { stdio: 'inherit', cwd: 'client' });
} catch (error) {
  console.error('Mobile build failed:', error.message);
  process.exit(1);
}

// Step 2: Sync with Capacitor
console.log('2. Syncing with Capacitor...');
try {
  execSync('npx cap sync', { stdio: 'inherit' });
} catch (error) {
  console.error('Capacitor sync failed:', error.message);
  process.exit(1);
}

console.log('Mobile build completed successfully!');
console.log('\nNext steps:');
console.log('- For iOS: Run "npx cap add ios && npx cap open ios"');
console.log('- For Android: Run "npx cap add android && npx cap open android"');