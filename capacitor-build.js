#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Setting up Capacitor build from existing files...');

// Check if we have built files already
const publicPath = path.join(__dirname, 'dist', 'public');
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(publicPath)) {
  console.log('🔄 Moving files from dist/public to dist/ for Capacitor...');
  
  const files = fs.readdirSync(publicPath);
  files.forEach(file => {
    const srcPath = path.join(publicPath, file);
    const destPath = path.join(distPath, file);
    
    // Check if file already exists in dist root, if so, remove it first
    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
    }
    
    fs.renameSync(srcPath, destPath);
  });
  
  // Remove the now-empty public directory
  fs.rmSync(publicPath, { recursive: true, force: true });
}

// Create a basic index.html if it doesn't exist
const indexPath = path.join(__dirname, 'dist', 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('📝 Creating basic index.html for Capacitor...');
  const basicHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="format-detection" content="telephone=no">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="theme-color" content="#374151">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="MindTrace">
    <title>MindTrace</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        background-color: #374151;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .loading {
        text-align: center;
      }
    </style>
</head>
<body>
    <div class="loading">
        <h1>MindTrace</h1>
        <p>Loading...</p>
    </div>
    <script>
        console.log('MindTrace app initializing...');
        // Basic app initialization
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded');
        });
    </script>
</body>
</html>`;
  fs.writeFileSync(indexPath, basicHTML);
}

// Optimize existing index.html for mobile
if (fs.existsSync(indexPath)) {
  console.log('📱 Optimizing index.html for mobile...');
  let indexContent = fs.readFileSync(indexPath, 'utf-8');
  
  // Add Capacitor meta tags if not present
  if (!indexContent.includes('format-detection')) {
    const capacitorMeta = `
    <meta name="format-detection" content="telephone=no">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#374151">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="MindTrace">`;
    
    indexContent = indexContent.replace('</head>', `${capacitorMeta}</head>`);
    fs.writeFileSync(indexPath, indexContent);
  }
}

console.log('✅ Capacitor build setup complete!');
console.log('');
console.log('Files in dist directory:');
const distFiles = fs.readdirSync(distPath);
distFiles.forEach(file => {
  console.log(`  - ${file}`);
});
console.log('');
console.log('Next steps:');
console.log('1. Run: npx cap sync');
console.log('2. Run: npx cap open ios (to open in Xcode)');
console.log('3. Build in Xcode for App Store deployment');