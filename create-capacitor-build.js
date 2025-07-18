#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Creating Capacitor-compatible build...');

// Create basic index.html for Capacitor
const indexHtml = `<!DOCTYPE html>
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
      :root {
        /* Safe area insets for iOS devices */
        --safe-area-inset-top: env(safe-area-inset-top);
        --safe-area-inset-right: env(safe-area-inset-right);
        --safe-area-inset-bottom: env(safe-area-inset-bottom);
        --safe-area-inset-left: env(safe-area-inset-left);
        
        /* App colors */
        --bg-primary: #1f2937;
        --bg-secondary: #374151;
        --text-primary: #f3f4f6;
        --text-secondary: #9ca3af;
        --accent: #27c4b4;
        --accent-hover: #22b8aa;
        
        /* Responsive spacing */
        --content-padding-x: max(16px, var(--safe-area-inset-left), var(--safe-area-inset-right));
        --content-padding-y: 16px;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        height: 100dvh;
        overflow: hidden;
        padding-top: var(--safe-area-inset-top);
        padding-right: var(--safe-area-inset-right);
        padding-bottom: var(--safe-area-inset-bottom);
        padding-left: var(--safe-area-inset-left);
      }
      
      .app-container {
        height: 100dvh;
        display: flex;
        flex-direction: column;
        max-width: 100%;
        overflow: hidden;
      }
      
      .header {
        padding: var(--content-padding-y) var(--content-padding-x);
        background: var(--bg-secondary);
        text-align: center;
        border-bottom: 1px solid #4b5563;
        flex-shrink: 0;
      }
      
      .logo {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }
      
      .brain-icon {
        width: 24px;
        height: 24px;
        fill: currentColor;
      }
      
      .main-content {
        flex: 1;
        padding: 2rem var(--content-padding-x);
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      .welcome-message {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        color: var(--text-primary);
      }
      
      .subtitle {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: 2rem;
      }
      
      .status-card {
        background: var(--bg-secondary);
        border-radius: 0.5rem;
        padding: 1.5rem;
        margin: 1rem 0;
        border: 1px solid #4b5563;
      }
      
      .status-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent);
        margin-bottom: 0.5rem;
      }
      
      .status-text {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
      
      .footer {
        padding: var(--content-padding-y) var(--content-padding-x);
        text-align: center;
        font-size: 0.8rem;
        color: var(--text-secondary);
        border-top: 1px solid #4b5563;
        flex-shrink: 0;
      }
      
      /* Responsive breakpoints */
      @media screen and (min-width: 768px) {
        :root {
          --content-padding-x: max(24px, var(--safe-area-inset-left), var(--safe-area-inset-right));
          --content-padding-y: 24px;
        }
        
        .app-container {
          max-width: 768px;
          margin: 0 auto;
        }
        
        .main-content {
          padding: 3rem var(--content-padding-x);
        }
      }
      
      @media screen and (min-width: 1024px) {
        :root {
          --content-padding-x: max(32px, var(--safe-area-inset-left), var(--safe-area-inset-right));
          --content-padding-y: 32px;
        }
        
        .app-container {
          max-width: 1024px;
        }
      }
      
      /* Orientation handling */
      @media screen and (orientation: landscape) and (max-height: 600px) {
        .header {
          padding: 12px var(--content-padding-x);
        }
        
        .main-content {
          padding: 1rem var(--content-padding-x);
        }
        
        .logo {
          font-size: 1.2rem;
        }
      }
      
      /* Touch target optimization */
      button, [role="button"] {
        min-height: 44px;
        min-width: 44px;
      }
    </style>
  </head>
  <body>
    <div class="app-container">
      <div class="header">
        <div class="logo">
          <svg class="brain-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          MindTrace
        </div>
      </div>
      
      <div class="main-content">
        <div class="welcome-message">Mental Health Support</div>
        <div class="subtitle">Your journey to better mental health starts here</div>
        
        <div class="status-card">
          <div class="status-title">Ready for Mobile</div>
          <div class="status-text">
            This app is optimized for iOS and Android deployment through Capacitor
          </div>
        </div>
        
        <div class="status-card">
          <div class="status-title">Core Features</div>
          <div class="status-text">
            • Thought tracking and analysis<br>
            • Cognitive distortion identification<br>
            • Progress visualization<br>
            • Data export capabilities
          </div>
        </div>
      </div>
      
      <div class="footer">
        MindTrace v1.0.0 | Built with React + Capacitor
      </div>
    </div>
  </body>
</html>`;

// Write the index.html file
fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), indexHtml);

console.log('✅ Capacitor build created successfully!');
console.log('');
console.log('Files created:');
console.log('  - dist/index.html');
console.log('');
console.log('Next steps:');
console.log('1. Run: npx cap sync');
console.log('2. Run: npx cap add ios (if iOS not already added)');
console.log('3. Run: npx cap open ios');
console.log('4. Build and test in Xcode');