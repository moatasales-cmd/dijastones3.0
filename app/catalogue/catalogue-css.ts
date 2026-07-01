// Print catalogue styles — ported verbatim from api/catalogue.php, with the
// four class names that collided with the site's app.css renamed:
//   .page-header→.cat-hd  .page-footer→.cat-ft  .section-label→.cat-lbl
//   .logo→.cat-logo   (and the loading .status→.cstatus)
// Rendered inline on the /catalogue page only, so it never leaks to the site.

export const catalogueCss = `
  @page { size: A4; margin: 0; }
  .catdoc * { box-sizing: border-box; margin: 0; padding: 0; }
  .catdoc { font-family: 'Outfit', sans-serif; color: #1a1a1a; background: #fff; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  .catdoc .page { width: 210mm; min-height: 297mm; position: relative; overflow: hidden; page-break-after: always; }
  .catdoc .page-inner { padding: 15mm 18mm; min-height: 297mm; display: flex; flex-direction: column; }

  .catdoc .page-cover { background: #13172C; color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
  .catdoc .page-cover .cat-logo { margin-bottom: 3rem; }
  .catdoc .page-cover .cat-logo img { height: 60px; width: auto; filter: brightness(0) invert(1); }
  .catdoc .page-cover h1 { font-family: 'Playfair Display', serif; font-size: 48pt; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
  .catdoc .page-cover .subtitle { font-size: 13pt; font-weight: 300; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 2rem; }
  .catdoc .page-cover .line { width: 80px; height: 2px; background: #915D36; margin: 1.5rem auto; }
  .catdoc .page-cover .meta { font-size: 10pt; color: rgba(255,255,255,0.5); letter-spacing: 0.15em; }
  .catdoc .page-cover .meta span { display: block; margin-top: 0.3rem; }
  .catdoc .page-cover .footer-text { position: absolute; bottom: 20mm; font-size: 8pt; letter-spacing: 0.15em; color: rgba(255,255,255,0.3); }
  .catdoc .page-cover .cover-badges { position: absolute; bottom: 35mm; left: 0; width: 100%; text-align: center; }
  .catdoc .page-cover .cover-badges span { display: inline-block; margin: 0 0.3rem; padding: 0.2rem 0.6rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 2px; font-size: 6.5pt; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
  .catdoc .page-cover .cover-stat { position: absolute; bottom: 45mm; left: 0; width: 100%; text-align: center; font-size: 8pt; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.3); }

  .catdoc .page-why-dija { background: #13172C; color: #fff; display: flex; flex-direction: column; justify-content: center; padding: 20mm 25mm; }
  .catdoc .page-why-dija .cat-lbl { font-size: 7pt; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 0.5rem; }
  .catdoc .page-why-dija h2 { font-family: 'Playfair Display', serif; font-size: 36pt; font-weight: 400; margin-bottom: 0.75rem; line-height: 1.15; }
  .catdoc .page-why-dija .accent-line { width: 50px; height: 2px; background: #915D36; margin-bottom: 1.5rem; }
  .catdoc .page-why-dija p { font-size: 10pt; line-height: 2; color: rgba(255,255,255,0.8); margin-bottom: 0.8rem; max-width: 80%; }
  .catdoc .page-why-dija .signoff { margin-top: 1.5rem; font-size: 9pt; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; }
  .catdoc .page-why-dija .cat-ft { border-top-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); }

  .catdoc .page-index { background: #fff; }
  .catdoc .page-index h2 { font-family: 'Playfair Display', serif; font-size: 28pt; font-weight: 400; margin-bottom: 0.5rem; color: #1a1a1a; }
  .catdoc .page-index .accent-line { width: 50px; height: 2px; background: #915D36; margin-bottom: 1.5rem; }
  .catdoc .page-index .index-content { column-count: 3; column-gap: 1rem; column-rule: 1px solid #f0ece6; }
  .catdoc .page-index .index-section-title { font-family: 'Playfair Display', serif; font-size: 9pt; color: #915D36; margin-bottom: 0.15rem; margin-top: 0.6rem; padding-top: 0.15rem; }
  .catdoc .page-index .index-section-title:first-child { margin-top: 0; }
  .catdoc .page-index .index-entry { font-size: 7pt; line-height: 1.65; color: #5a5a5a; display: flex; justify-content: space-between; break-inside: avoid; }
  .catdoc .page-index .index-entry .entry-name { color: #1a1a1a; }
  .catdoc .page-index .index-entry .entry-page { color: #915D36; }

  .catdoc .page-about { background: #fff; }
  .catdoc .page-about h2 { font-family: 'Playfair Display', serif; font-size: 28pt; font-weight: 400; margin-bottom: 0.75rem; color: #1a1a1a; }
  .catdoc .page-about .accent-line { width: 50px; height: 2px; background: #915D36; margin-bottom: 1.5rem; }
  .catdoc .page-about p { font-size: 10pt; line-height: 1.8; color: #4a4a4a; margin-bottom: 1rem; }
  .catdoc .page-about .facts { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; }
  .catdoc .page-about .fact { padding: 1rem; background: #f8f6f3; }
  .catdoc .page-about .fact-num { font-family: 'Playfair Display', serif; font-size: 18pt; color: #915D36; }
  .catdoc .page-about .fact-label { font-size: 8pt; letter-spacing: 0.15em; text-transform: uppercase; color: #8a8a8a; margin-top: 0.25rem; }
  .catdoc .page-about .contact { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e0d8d0; font-size: 9pt; color: #6b6560; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .catdoc .page-about .contact strong { color: #1a1a1a; }
  .catdoc .page-about .values { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-top: 1rem; }
  .catdoc .page-about .values .val { padding: 0.8rem; background: #f8f6f3; }
  .catdoc .page-about .values .val-title { font-family: 'Playfair Display', serif; font-size: 12pt; color: #915D36; margin-bottom: 0.2rem; }
  .catdoc .page-about .values .val-desc { font-size: 7.5pt; line-height: 1.5; color: #6b6560; }

  .catdoc .page-section { background: #13172C; color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
  .catdoc .page-section .section-num { font-size: 10pt; letter-spacing: 0.3em; text-transform: uppercase; opacity: 0.6; margin-bottom: 1.5rem; }
  .catdoc .page-section h2 { font-family: 'Playfair Display', serif; font-size: 42pt; font-weight: 400; margin-bottom: 1rem; }
  .catdoc .page-section .section-line { width: 60px; height: 2px; background: rgba(255,255,255,0.4); margin: 1rem auto; }
  .catdoc .page-section p { font-size: 11pt; font-weight: 300; line-height: 1.7; max-width: 70%; opacity: 0.85; }
  .catdoc .page-section .count { font-size: 9pt; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.5; margin-top: 1.5rem; }
  .catdoc .page-section .section-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8rem 1rem; margin-top: 1.2rem; max-width: 80%; text-align: left; }
  .catdoc .page-section .section-grid .sg-label { font-size: 6.5pt; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.5; margin-bottom: 0.15rem; }
  .catdoc .page-section .section-grid .sg-val { font-size: 7.5pt; line-height: 1.5; opacity: 0.85; }

  .catdoc .page-product { background: #fff; }
  .catdoc .page-product .page-inner { padding: 12mm 15mm; gap: 0.3rem; }
  .catdoc .page-product .product-grid { display: grid; grid-template-columns: 89mm 1fr; gap: 1rem; flex: 1; }
  .catdoc .page-product .product-image { width: 100%; height: 100%; overflow: hidden; background: #f0ece6; display: flex; align-items: center; justify-content: center; }
  .catdoc .page-product .product-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .catdoc .page-product .product-info { display: flex; flex-direction: column; justify-content: flex-start; min-height: 0; }
  .catdoc .page-product .product-info h2 { font-family: 'Playfair Display', serif; font-size: 22pt; font-weight: 400; color: #1a1a1a; line-height: 1.2; margin-bottom: 0.25rem; }
  .catdoc .page-product .product-info .origin { font-size: 9pt; letter-spacing: 0.15em; text-transform: uppercase; color: #915D36; margin-bottom: 0.4rem; }
  .catdoc .page-product .product-info .thickness-line { font-size: 7pt; color: #8a8a8a; margin-top: -0.4rem; margin-bottom: 0.4rem; letter-spacing: 0.1em; }
  .catdoc .page-product .product-info .desc { font-size: 9pt; line-height: 1.6; color: #5a5a5a; margin-bottom: 0.5rem; }
  .catdoc .page-product .product-info .note { padding: 0.4rem 0.6rem; background: #f8f6f3; border-left: 3px solid #915D36; font-style: italic; font-size: 8pt; color: #6b6560; margin-bottom: 0.5rem; }
  .catdoc .page-product .specs { width: 100%; border-collapse: collapse; margin-bottom: 0.4rem; }
  .catdoc .page-product .specs td { padding: 0.2rem 0; border-bottom: 1px solid #f0ece6; font-size: 7.5pt; vertical-align: top; }
  .catdoc .page-product .specs td:first-child { width: 38%; color: #915D36; font-size: 6.5pt; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; }
  .catdoc .page-product .specs td:last-child { color: #3a3a3a; }
  .catdoc .page-product .sizes-section { margin-bottom: 0.3rem; }
  .catdoc .page-product .sizes-cols { display: flex; gap: 1rem; margin-bottom: 0.2rem; }
  .catdoc .page-product .sizes-col { flex: 1; min-width: 0; }
  .catdoc .page-product .sizes-col-title { color: #915D36; font-weight: 500; font-size: 6.5pt; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.1rem; }
  .catdoc .page-product .sizes-col-item { font-size: 7pt; color: #3a3a3a; padding: 0.05rem 0; line-height: 1.35; }
  .catdoc .page-product .sizes-inline-title { color: #915D36; font-weight: 500; font-size: 6.5pt; letter-spacing: 0.1em; text-transform: uppercase; }
  .catdoc .page-product .sizes-inline { font-size: 7pt; color: #3a3a3a; line-height: 1.4; }
  .catdoc .page-product .stone-architect-note { padding: 0.3rem 0.5rem; background: #f8f6f3; border-left: 3px solid #915D36; font-style: italic; font-size: 7pt; color: #6b6560; margin-bottom: 0.3rem; }
  .catdoc .page-product .product-thumbs { display: flex; gap: 0.3rem; flex: 0 0 auto; height: 336px; min-height: 0; }
  .catdoc .page-product .product-thumbs .product-thumb { flex: 1; overflow: hidden; background: #f0ece6; display: flex; align-items: center; justify-content: center; }
  .catdoc .page-product .product-thumbs .product-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .catdoc .page-product .cat-ft { margin-top: 0; }

  .catdoc .cat-hd { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 1px solid #e0d8d0; margin-bottom: 1rem; }
  .catdoc .cat-hd .brand-name { font-size: 8pt; letter-spacing: 0.15em; text-transform: uppercase; color: #915D36; }
  .catdoc .cat-hd .page-label { font-size: 7pt; color: #b0a8a0; }
  .catdoc .cat-ft { display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid #e0d8d0; margin-top: auto; font-size: 7pt; color: #b0a8a0; }
  .catdoc .page-num { display: inline-block; min-width: 1.2em; }

  .catdoc .page-back { background: #13172C; color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
  .catdoc .page-back .cat-logo img { height: 50px; width: auto; filter: brightness(0) invert(1); margin-bottom: 2rem; }
  .catdoc .page-back .back-info { font-size: 9pt; line-height: 2; color: rgba(255,255,255,0.6); }
  .catdoc .page-back .back-info a { color: #915D36; text-decoration: none; }
  .catdoc .page-back .back-line { width: 40px; height: 1px; background: rgba(255,255,255,0.2); margin: 1.5rem auto; }

  .catdoc .page-ref { background: #13172C; color: #fff; }
  .catdoc .page-ref .page-inner { padding: 15mm 18mm; display: flex; flex-direction: column; }
  .catdoc .page-ref .cat-hd { border-bottom-color: rgba(255,255,255,0.1); margin-bottom: 0.8rem; }
  .catdoc .page-ref .cat-hd .brand-name { color: #915D36; }
  .catdoc .page-ref .cat-hd .page-label { color: rgba(255,255,255,0.4); }
  .catdoc .page-ref .cat-ft { border-top-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); margin-top: auto; }
  .catdoc .page-ref h2 { font-family: 'Playfair Display', serif; font-size: 24pt; font-weight: 400; margin-bottom: 0.2rem; color: #fff; }
  .catdoc .page-ref .ref-line { width: 40px; height: 2px; background: #915D36; margin-bottom: 1rem; flex-shrink: 0; }
  .catdoc .page-ref .ref-lead { font-size: 9pt; line-height: 1.7; color: rgba(255,255,255,0.7); max-width: 85%; margin-bottom: 0.8rem; }
  .catdoc .page-ref .ref-table { width: 100%; border-collapse: collapse; font-size: 7.5pt; }
  .catdoc .page-ref .ref-table th { text-align: left; padding: 0.35rem 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.15); color: #915D36; font-size: 6.5pt; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; }
  .catdoc .page-ref .ref-table td { padding: 0.25rem 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); vertical-align: top; line-height: 1.4; }
  .catdoc .page-ref .ref-icon-yes { color: #4ade80; font-weight: 700; }
  .catdoc .page-ref .ref-icon-no { color: #f87171; }
  .catdoc .page-ref .ref-icon-caution { color: #fbbf24; }
  .catdoc .page-ref .ref-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8rem; }
  .catdoc .page-ref .ref-card { background: rgba(255,255,255,0.04); padding: 0.6rem 0.8rem; border-left: 2px solid rgba(255,255,255,0.1); }
  .catdoc .page-ref .ref-card-title { font-family: 'Playfair Display', serif; font-size: 11pt; color: #915D36; margin-bottom: 0.15rem; }
  .catdoc .page-ref .ref-card-text { font-size: 7pt; line-height: 1.55; color: rgba(255,255,255,0.75); }
  .catdoc .page-ref .ref-stat-num { font-family: 'Playfair Display', serif; font-size: 28pt; color: #915D36; }
  .catdoc .page-ref .ref-stat-label { font-size: 7pt; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 0.1rem; }
  .catdoc .page-ref .ref-stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.8rem; text-align: center; margin-bottom: 0.8rem; }
  .catdoc .page-ref .ref-matrix { width: 100%; border-collapse: collapse; font-size: 7.5pt; }
  .catdoc .page-ref .ref-matrix th { text-align: center; padding: 0.25rem 0.15rem; border-bottom: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.4); font-size: 6pt; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 400; }
  .catdoc .page-ref .ref-matrix th:first-child { text-align: left; }
  .catdoc .page-ref .ref-matrix td { text-align: center; padding: 0.2rem 0.15rem; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 10pt; }
  .catdoc .page-ref .ref-matrix td:first-child { text-align: left; font-size: 7pt; color: rgba(255,255,255,0.85); }

  #loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #1a1a1a; z-index: 9999; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #fff; font-family: 'Outfit', sans-serif; transition: opacity 0.6s; }
  #loading-overlay.hidden { opacity: 0; pointer-events: none; }
  #loading-overlay h2 { font-family: 'Playfair Display', serif; font-size: 28pt; font-weight: 400; margin-bottom: 0.5rem; }
  #loading-overlay p { font-size: 10pt; color: rgba(255,255,255,0.6); margin-bottom: 2rem; }
  #loading-overlay .bar-track { width: 320px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; overflow: hidden; }
  #loading-overlay .bar-fill { height: 100%; border-radius: 2px; transition: width 0.3s; background: linear-gradient(90deg, #915D36, #c08458, #915D36); background-size: 200% 100%; }
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

  @media print {
    .print-ui, #loading-overlay { display: none !important; }
    .catdoc .page { margin: 0; box-shadow: none; }
  }
  @media screen {
    .catdoc { background: #333; padding: 20px 0; }
    .catdoc .page { margin: 0 auto 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
  }
`;
