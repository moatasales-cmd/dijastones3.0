// Single-stone datasheet print styles — ported from api/datasheet.php.
// The ds-* classes are unique (no clash with the site's app.css). The loading
// overlay + print-ui reuse the same class names PrintLoader renders.

export const datasheetCss = `
  @page { size: A4; margin: 0; }
  .dsdoc { font-family: 'Outfit', sans-serif; color: #1a1a1a; background: #fff; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .dsdoc * { box-sizing: border-box; }

  .dsdoc .ds-page { max-width: 210mm; margin: 0 auto; padding: 0; background: #fff; }
  .dsdoc .ds-header { display: flex; justify-content: space-between; align-items: center; padding: 8mm 18mm 5mm; border-bottom: 2px solid #915D36; }
  .dsdoc .ds-header .ds-brand { font-size: 7pt; letter-spacing: 0.15em; text-transform: uppercase; color: #915D36; display: flex; align-items: center; gap: 8px; }
  .dsdoc .ds-header .ds-brand img { height: 28px; width: auto; display: block; }
  .dsdoc .ds-header .ds-label { font-size: 7pt; letter-spacing: 0.2em; text-transform: uppercase; color: #915D36; font-weight: 500; }

  .dsdoc .ds-hero { display: grid; grid-template-columns: 1fr 1.3fr; gap: 2rem; padding: 6mm 18mm 4mm; }
  .dsdoc .ds-hero-img { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #f0ece6; display: flex; align-items: center; justify-content: center; }
  .dsdoc .ds-hero-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .dsdoc .ds-hero-info h1 { font-family: 'Playfair Display', serif; font-size: 22pt; font-weight: 400; color: #1a1a1a; line-height: 1.2; margin-bottom: 0.15rem; }
  .dsdoc .ds-hero-info .ds-subtitle { font-size: 7.5pt; letter-spacing: 0.2em; text-transform: uppercase; color: #915D36; margin-bottom: 0.6rem; }
  .dsdoc .ds-hero-info .ds-desc { font-size: 8.5pt; color: #6b6560; line-height: 1.6; margin-bottom: 0.6rem; }
  .dsdoc .ds-hero-info .ds-note { padding: 0.4rem 0.6rem; background: #f8f6f3; border-left: 3px solid #915D36; font-style: italic; font-size: 8pt; color: #6b6560; }
  .dsdoc .ds-dolomite { display: inline-block; padding: 2px 8px; border-radius: 3px; background: #4a7fa8; color: #fff; font-size: 6.5pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; margin-left: 6px; vertical-align: middle; }

  .dsdoc .ds-stripe { background: #13172C; color: #fff; display: grid; grid-template-columns: repeat(4, 1fr); padding: 3.5mm 18mm; margin-bottom: 4.5mm; }
  .dsdoc .ds-stripe-item .ds-stripe-label { font-size: 5.5pt; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 0.1rem; }
  .dsdoc .ds-stripe-item .ds-stripe-value { font-family: 'Playfair Display', serif; font-size: 10pt; font-weight: 400; color: #fff; }

  .dsdoc .ds-section { margin-bottom: 4mm; }
  .dsdoc .ds-section-title { font-family: 'Playfair Display', serif; font-size: 12pt; font-weight: 400; color: #1a1a1a; padding-bottom: 0.3rem; border-bottom: 1px solid #e0d8d0; margin-bottom: 0.6rem; }

  .dsdoc .ds-specs { width: 100%; border-collapse: collapse; margin-bottom: 0.3rem; }
  .dsdoc .ds-specs td { padding: 0.25rem 0.5rem 0.25rem 0; border-bottom: 1px solid #f0ece6; font-size: 8pt; vertical-align: top; }
  .dsdoc .ds-specs td:first-child { width: 32%; font-size: 6.5pt; letter-spacing: 0.1em; text-transform: uppercase; color: #915D36; font-weight: 500; }
  .dsdoc .ds-specs td:last-child { color: #1a1a1a; }
  .dsdoc .ds-specs .ds-muted { color: #999; font-size: 7pt; }

  .dsdoc .ds-app-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1.5rem; }
  .dsdoc .ds-app-table { width: 100%; border-collapse: collapse; }
  .dsdoc .ds-app-table td { padding: 0.2rem 0.4rem; font-size: 7.5pt; border-bottom: 1px solid #f0ece6; }
  .dsdoc .ds-app-table td:first-child { color: #1a1a1a; width: 24px; }
  .dsdoc .ds-app-icon { display: inline-block; width: 16px; text-align: center; font-size: 9pt; }
  .dsdoc .ds-app-icon.yes { color: #2d7d46; }
  .dsdoc .ds-app-icon.cond { color: #c97d2d; }
  .dsdoc .ds-app-icon.no { color: #c0392b; }

  .dsdoc .ds-limits { margin-bottom: 0.3rem; }
  .dsdoc .ds-limits dt { font-size: 7pt; font-weight: 600; letter-spacing: 0.05em; color: #915D36; margin-top: 0.35rem; margin-bottom: 0.05rem; }
  .dsdoc .ds-limits dd { font-size: 7.5pt; color: #6b6560; line-height: 1.5; margin-left: 0; }

  .dsdoc .ds-formats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1.5rem; }
  .dsdoc .ds-formats .ds-fmt-group { margin-bottom: 0.3rem; }
  .dsdoc .ds-fmt-label { font-size: 6pt; letter-spacing: 0.1em; text-transform: uppercase; color: #915D36; font-weight: 500; margin-bottom: 0.15rem; }
  .dsdoc .ds-fmt-value { font-size: 8pt; color: #1a1a1a; line-height: 1.5; }
  .dsdoc .ds-fmt-item { display: inline-block; margin-right: 0.3rem; font-size: 7.5pt; color: #1a1a1a; }
  .dsdoc .ds-fmt-item:not(:last-child)::after { content: '·'; margin-left: 0.3rem; color: #999; }

  .dsdoc .ds-gallery { margin-bottom: 2mm; }
  .dsdoc .ds-gallery .hero-view { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; background: #f0ece6; margin-bottom: 0.5rem; }
  .dsdoc .ds-gallery .thumb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .dsdoc .ds-gallery .thumb-grid img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; background: #f0ece6; }

  .dsdoc .ds-note-lines { padding: 0.5rem 0; }
  .dsdoc .ds-note-line { border: none; border-bottom: 1px dotted #b0a8a0; height: 2.2rem; margin: 0; }

  .dsdoc .ds-footer { padding: 3mm 18mm; border-top: 1px solid #e0d8d0; display: flex; justify-content: space-between; font-size: 7pt; color: #999; }
  .dsdoc .ds-footer a { color: #915D36; text-decoration: none; }

  #loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #1a1a1a; z-index: 9999; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #fff; font-family: 'Outfit', sans-serif; transition: opacity 0.6s; }
  #loading-overlay.hidden { opacity: 0; pointer-events: none; }
  #loading-overlay h2 { font-family: 'Playfair Display', serif; font-size: 28pt; font-weight: 400; margin-bottom: 0.5rem; }
  #loading-overlay p { font-size: 10pt; color: rgba(255,255,255,0.6); margin-bottom: 2rem; }
  #loading-overlay .bar-track { width: 320px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; overflow: hidden; }
  #loading-overlay .bar-fill { height: 100%; border-radius: 2px; transition: width 0.3s; background: linear-gradient(90deg, #915D36, #c08458, #915D36); }
  #loading-overlay .pct { margin-top: 1rem; font-size: 22pt; font-weight: 300; color: #915D36; font-family: 'Playfair Display', serif; }
  #loading-overlay .cstatus { margin-top: 0.5rem; font-size: 8pt; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); }

  .print-ui { position: fixed; bottom: 24px; right: 24px; background: rgba(255,255,255,0.96); border: 1px solid #d0c8c0; border-radius: 12px; padding: 16px 22px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); display: none; z-index: 9999; align-items: center; gap: 14px; }
  .print-ui button { padding: 12px 26px; background: #915D36; color: #fff; border: none; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; border-radius: 6px; font-family: 'Outfit', sans-serif; font-weight: 500; }
  .print-ui button:hover { background: #7a4e2d; }
  .print-ui .ready-text { font-size: 11px; color: #4a7a4a; font-weight: 500; }
  .print-ui .lang-dropdown-wrap { position: relative; display: inline-block; }
  .print-ui .lang-dropdown-btn { padding: 8px 12px; background: none; border: 1px solid #d0c8c0; border-radius: 6px; cursor: pointer; font-size: 18px; line-height: 1; display: flex; align-items: center; gap: 6px; }
  .print-ui .lang-dropdown-menu { position: absolute; bottom: 100%; left: 0; margin-bottom: 6px; background: #fff; border: 1px solid #d0c8c0; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.12); display: none; z-index: 10000; min-width: 170px; overflow: hidden; }
  .print-ui .lang-dropdown-menu.open { display: block; }
  .print-ui .lang-dropdown-menu a { display: flex; align-items: center; gap: 10px; padding: 12px 18px; text-decoration: none; color: #1a1a1a; font-size: 14px; white-space: nowrap; }
  .print-ui .lang-dropdown-menu a:hover { background: #f5f0ea; }
  .print-ui .lang-dropdown-menu a.active { background: #ede6dc; color: #915D36; font-weight: 600; }
  .print-ui .lang-arrow { font-size: 10px; color: #999; margin-left: 2px; }
  .print-ui .lang-sep { color: #d0c8c0; font-size: 16px; }
  .print-ui.visible { display: flex; }

  @media print { .print-ui, #loading-overlay { display: none !important; } }
  @media screen {
    .dsdoc { background: #333; padding: 20px 0; }
    .dsdoc .ds-page { box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
  }
`;
