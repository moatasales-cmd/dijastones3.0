<?php
header('Content-Type: image/svg+xml');
header('Cache-Control: public, max-age=86400');

$id = $_GET['id'] ?? 'unknown';
$name = $_GET['name'] ?? 'Natural Stone';
$type = $_GET['type'] ?? 'Stone';
$country = $_GET['country'] ?? 'Mediterranean';
$tone = $_GET['tone'] ?? 'beige';

$tones = [
    'white'  => ['bg1'=>'#f7f3ec','bg2'=>'#e6eef2','accent'=>'#4a8fa8','text'=>'#1e4d7b'],
    'grey'   => ['bg1'=>'#d1d5db','bg2'=>'#9ca3af','accent'=>'#6b7280','text'=>'#1f2937'],
    'beige'  => ['bg1'=>'#f5f0e8','bg2'=>'#e8dcc8','accent'=>'#b06b4a','text'=>'#5c3d2e'],
    'black'  => ['bg1'=>'#1f2937','bg2'=>'#111827','accent'=>'#f59e0b','text'=>'#f3f4f6'],
    'green'  => ['bg1'=>'#2d5016','bg2'=>'#1a3a0a','accent'=>'#a8c9d4','text'=>'#f0fdf4'],
    'red'    => ['bg1'=>'#7f1d1d','bg2'=>'#450a0a','accent'=>'#fca5a5','text'=>'#fef2f2'],
    'yellow' => ['bg1'=>'#e8c84a','bg2'=>'#d4a843','accent'=>'#5c4033','text'=>'#292524'],
    'brown'  => ['bg1'=>'#5c4033','bg2'=>'#3e2723','accent'=>'#d4a574','text'=>'#fefce8'],
    'pink'   => ['bg1'=>'#e8b4b8','bg2'=>'#d4949a','accent'=>'#7f1d1d','text'=>'#4c0519'],
    'blue'   => ['bg1'=>'#1e3a5f','bg2'=>'#0f2440','accent'=>'#93c5fd','text'=>'#eff6ff'],
];
$c = $tones[$tone] ?? $tones['beige'];

$initials = '';
$words = explode(' ', $name);
foreach ($words as $w) { if (trim($w) !== '') $initials .= strtoupper($w[0]); }
$initials = substr($initials, 0, 3);
$size = 800;
?>
<svg xmlns="http://www.w3.org/2000/svg" width="<?=$size?>" height="<?=$size?>" viewBox="0 0 <?=$size?> <?=$size?>">
  <defs>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer>
    </filter>
    <filter id="vein-filter">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.1" numOctaves="2" seed="<?=rand(1,999)?>"/>
      <feDisplacementMap in="SourceGraphic" scale="<?=rand(30,60)?>"/>
    </filter>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="<?=$c['bg1']?>"/>
      <stop offset="50%" stop-color="<?=$c['bg2']?>"/>
      <stop offset="100%" stop-color="<?=$c['bg1']?>"/>
    </linearGradient>
    <radialGradient id="glow" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="<?=$c['accent']?>" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="<?=$c['accent']?>" stop-opacity="0"/>
    </radialGradient>
    <pattern id="vein-pattern" x="0" y="0" width="<?=$size?>" height="<?=$size?>" patternUnits="userSpaceOnUse">
      <path d="M0,<?=rand(200,600)?> Q<?=rand(100,300)?>,<?=rand(100,500)?> <?=rand(400,600)?>,<?=rand(200,500)?> T<?=$size?>,<?=rand(200,600)?>" stroke="<?=$c['accent']?>" stroke-width="<?=rand(1,3)?>" fill="none" opacity="0.15" filter="url(#vein-filter)"/>
      <path d="M0,<?=rand(100,300)?> Q<?=rand(200,400)?>,<?=rand(300,600)?> <?=rand(400,700)?>,<?=rand(100,400)?> T<?=$size?>,<?=rand(300,500)?>" stroke="<?=$c['accent']?>" stroke-width="<?=rand(1,3)?>" fill="none" opacity="0.1"/>
    </pattern>
  </defs>
  <rect width="<?=$size?>" height="<?=$size?>" fill="url(#bg)"/>
  <rect width="<?=$size?>" height="<?=$size?>" fill="url(#glow)"/>
  <rect width="<?=$size?>" height="<?=$size?>" fill="url(#vein-pattern)"/>
  <rect width="<?=$size?>" height="<?=$size?>" filter="url(#grain)" opacity="0.5"/>
  <circle cx="<?=rand(100,300)?>" cy="<?=rand(100,300)?>" r="<?=rand(10,40)?>" fill="<?=$c['accent']?>" opacity="<?=round(mt_rand(300,600)/1000,2)?>"/>
  <circle cx="<?=rand(500,700)?>" cy="<?=rand(400,700)?>" r="<?=rand(60,90)?>" fill="<?=$c['accent']?>" opacity="<?=round(mt_rand(100,300)/1000,2)?>"/>
  <g transform="translate(<?=$size/2?>,<?=$size/2?>)">
    <text text-anchor="middle" y="-60" font-family="'Cormorant Garamond',Georgia,serif" font-size="<?=round($size/6)?>" font-weight="300" fill="<?=$c['text']?>" opacity="0.85"><?=htmlspecialchars($initials)?></text>
    <text text-anchor="middle" y="40" font-family="'Manrope',sans-serif" font-size="18" font-weight="300" letter-spacing="4" fill="<?=$c['text']?>" opacity="0.6"><?=htmlspecialchars($type)?></text>
    <text text-anchor="middle" y="90" font-family="'Manrope',sans-serif" font-size="12" font-weight="200" letter-spacing="3" fill="<?=$c['text']?>" opacity="0.4"><?=htmlspecialchars($country)?></text>
    <circle cx="0" cy="-120" r="120" fill="none" stroke="<?=$c['accent']?>" stroke-width="0.5" opacity="0.2"/>
    <circle cx="0" cy="-120" r="80" fill="none" stroke="<?=$c['accent']?>" stroke-width="0.3" opacity="0.15"/>
  </g>
</svg>
