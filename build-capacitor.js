#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Building MindTrace for Capacitor deployment...');

// Clean dist directory
console.log('🧹 Cleaning dist directory...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Build frontend with Vite in parts
console.log('📦 Building frontend...');
const viteProcess = spawn('npx', ['vite', 'build', '--mode=production'], { 
  stdio: 'inherit', 
  timeout: 180000  // 3 minutes timeout
});

viteProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Frontend build failed');
    process.exit(1);
  }
  
  console.log('✅ Frontend build completed');
  
  // Move files from dist/public to dist/ for Capacitor
  console.log('🔄 Moving files for Capacitor...');
  const publicPath = path.join(__dirname, 'dist', 'public');
  if (fs.existsSync(publicPath)) {
    const files = fs.readdirSync(publicPath);
    files.forEach(file => {
      const srcPath = path.join(publicPath, file);
      const destPath = path.join(__dirname, 'dist', file);
      fs.renameSync(srcPath, destPath);
    });
    fs.rmSync(publicPath, { recursive: true, force: true });
  }

  // Build backend
  console.log('🏗️ Building backend...');
  const backendProcess = spawn('npx', ['esbuild', 'server/index.ts', '--platform=node', '--packages=external', '--bundle', '--format=esm', '--outdir=dist'], { 
    stdio: 'inherit' 
  });

  backendProcess.on('close', (backendCode) => {
    if (backendCode !== 0) {
      console.error('❌ Backend build failed');
      process.exit(1);
    }
    
    console.log('✅ Backend build completed');
    
    // Create a capacitor-specific version of the index.html
    console.log('📱 Optimizing for mobile...');
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      let indexContent = fs.readFileSync(indexPath, 'utf-8');
      
      // Add Capacitor meta tags for mobile optimization
      const capacitorMeta = `
        <meta name="format-detection" content="telephone=no">
        <meta name="msapplication-tap-highlight" content="no">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="theme-color" content="#374151">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="MindTrace">
      `;
      
      indexContent = indexContent.replace('</head>', `${capacitorMeta}</head>`);
      fs.writeFileSync(indexPath, indexContent);
    }

    console.log('✅ Build complete! Ready for Capacitor sync.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npx cap sync');
    console.log('2. Run: npx cap open ios (to open in Xcode)');
    console.log('3. Build in Xcode for App Store deployment');
  });
});