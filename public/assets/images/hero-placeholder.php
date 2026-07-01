<?php
header('Content-Type: image/svg+xml');
header('Cache-Control: public, max-age=86400');
?><svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.08"/></feComponentTransfer></filter>
    <linearGradient id="sky" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0a1f3d"/><stop offset="40%" stop-color="#1e4d7b"/><stop offset="70%" stop-color="#4a8fa8"/><stop offset="100%" stop-color="#a8c9d4"/></linearGradient>
    <radialGradient id="glow1" cx="20%" cy="30%" r="60%"><stop offset="0%" stop-color="#4a8fa8" stop-opacity="0.3"/><stop offset="100%" stop-color="transparent"/></radialGradient>
    <radialGradient id="glow2" cx="80%" cy="70%" r="50%"><stop offset="0%" stop-color="#b06b4a" stop-opacity="0.15"/><stop offset="100%" stop-color="transparent"/></radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sky)"/>
  <rect width="1920" height="1080" fill="url(#glow1)"/>
  <rect width="1920" height="1080" fill="url(#glow2)"/>
  <path d="M0,800 Q200,600 400,750 T800,700 T1200,780 T1600,650 T1920,720 L1920,1080 L0,1080 Z" fill="#0a1f3d" opacity="0.3"/>
  <path d="M0,900 Q300,750 600,850 T1200,800 T1920,880 L1920,1080 L0,1080 Z" fill="#0a1420" opacity="0.5"/>
  <rect width="1920" height="1080" filter="url(#grain)"/>
  <g opacity="0.08"><circle cx="200" cy="200" r="300" fill="white"/><circle cx="1600" cy="300" r="200" fill="white"/><circle cx="900" cy="500" r="150" fill="white"/></g>
  <text x="960" y="480" text-anchor="middle" font-family="'Cormorant Garamond',Georgia,serif" font-size="120" fill="white" opacity="0.04" letter-spacing="20">DIJA</text>
  <text x="960" y="560" text-anchor="middle" font-family="'Cormorant Garamond',Georgia,serif" font-size="60" fill="white" opacity="0.03" letter-spacing="40">STONE</text>
</svg>
