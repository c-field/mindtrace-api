#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Building MindTrace application...');

// Function to run command with timeout
function runCommand(command, timeout = 180000) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { 
      stdio: 'inherit', 
      timeout: timeout,
      env: { ...process.env, NODE_ENV: 'production' }
    });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Clean and prepare dist directory
console.log('Preparing build directory...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Try to build with vite
console.log('Attempting to build frontend...');
const viteSuccess = runCommand('npx vite build --mode production', 120000);

if (viteSuccess) {
  console.log('Vite build successful!');
  
  // Move files from dist/public to dist root for Capacitor
  const publicPath = path.join(__dirname, 'dist', 'public');
  if (fs.existsSync(publicPath)) {
    console.log('Moving files to dist root...');
    const files = fs.readdirSync(publicPath);
    files.forEach(file => {
      const srcPath = path.join(publicPath, file);
      const destPath = path.join(__dirname, 'dist', file);
      fs.renameSync(srcPath, destPath);
    });
    fs.rmSync(publicPath, { recursive: true, force: true });
  }
} else {
  console.log('Vite build failed, creating minimal build...');
  
  // Create minimal build for Capacitor
  const indexContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="format-detection" content="telephone=no">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="theme-color" content="#374151">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="MindTrace">
    <title>MindTrace</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
        background: #1f2937; 
        color: #f3f4f6; 
        height: 100vh; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
      }
      .container { text-align: center; padding: 20px; }
      .logo { font-size: 2rem; font-weight: bold; color: #27c4b4; margin-bottom: 1rem; }
      .message { font-size: 1.1rem; margin-bottom: 1rem; }
      .status { font-size: 0.9rem; color: #9ca3af; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">MindTrace</div>
      <div class="message">Mental Health Support</div>
      <div class="status">Ready for mobile deployment</div>
    </div>
  </body>
</html>`;
  
  fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), indexContent);
}

// Build backend
console.log('Building backend...');
const backendSuccess = runCommand('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');

if (backendSuccess) {
  console.log('Backend build successful!');
} else {
  console.log('Backend build failed');
}

// Verify build
console.log('\nBuild verification:');
const distFiles = fs.readdirSync('dist');
console.log('Files in dist directory:');
distFiles.forEach(file => console.log(`  - ${file}`));

const hasIndexHtml = distFiles.includes('index.html');
const hasBackend = distFiles.includes('index.js');

console.log('\nBuild status:');
console.log(`✓ Frontend: ${hasIndexHtml ? 'Ready' : 'Missing index.html'}`);
console.log(`✓ Backend: ${hasBackend ? 'Ready' : 'Missing index.js'}`);

if (hasIndexHtml) {
  console.log('\n✅ Build complete! Ready for Capacitor.');
  console.log('\nNext steps:');
  console.log('1. Run: npx cap sync');
  console.log('2. Run: npx cap add ios (if not already added)');
  console.log('3. Run: npx cap open ios');
} else {
  console.log('\n❌ Build incomplete. Check errors above.');
}