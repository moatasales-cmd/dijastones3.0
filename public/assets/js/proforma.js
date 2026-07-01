(function() {
'use strict';

var stonesData = {};
var sizesDataMetric = {};
var sizesDataImperial = {};
var sizesData = {};
var thickMult = {};
var finishMult = {};
var sqf = 10.7639;
var items = [];
var rowCounter = 0;
var unit = 'sqm';
var currentStep = 1;
var saveKey = 'dija_proforma_draft';
var editId = '';
var clientSession = null;

var sellerFreightCodes = ['CFR','CIF','CPT','CIP','DAP','DDP'];

var costEstimates = {
  packing_pct: 2.0,
  inland_per_container: 300,
  export_customs_flat: 200,
  loading_per_container: 150,
  insurance_pct: 0.5,
  import_duty_pct: 5.0,
  delivery_per_container: 500,
  incoterm_matrix: {
    'EXW':{label:'Ex Works',packing:0,inland:0,customs:0,loading:0,freight:0,insurance:0,import:0,delivery:0},
    'FCA':{label:'Free Carrier',packing:1,inland:1,customs:1,loading:0,freight:0,insurance:0,import:0,delivery:0},
    'FAS':{label:'Free Alongside Ship',packing:1,inland:1,customs:1,loading:0,freight:0,insurance:0,import:0,delivery:0},
    'FOB':{label:'Free on Board',packing:1,inland:1,customs:1,loading:1,freight:0,insurance:0,import:0,delivery:0},
    'CFR':{label:'Cost and Freight',packing:1,inland:1,customs:1,loading:1,freight:1,insurance:0,import:0,delivery:0},
    'CIF':{label:'Cost, Insurance & Freight',packing:1,inland:1,customs:1,loading:1,freight:1,insurance:1,import:0,delivery:0},
    'CPT':{label:'Carriage Paid To',packing:1,inland:1,customs:1,loading:1,freight:1,insurance:0,import:0,delivery:1},
    'CIP':{label:'Carriage & Insurance Paid To',packing:1,inland:1,customs:1,loading:1,freight:1,insurance:1,import:0,delivery:1},
    'DAP':{label:'Delivered at Place',packing:1,inland:1,customs:1,loading:1,freight:1,insurance:1,import:0,delivery:1},
    'DDP':{label:'Delivered Duty Paid',packing:1,inland:1,customs:1,loading:1,freight:1,insurance:1,import:1,delivery:1}
  }
};

function u() { return unit; }
function isSqf() { return unit === 'sqf'; }
function toUnit(m2) { return isSqf() ? m2 * sqf : m2; }
function uSuf() { return isSqf() ? 'ft\u00B2' : 'm\u00B2'; }
function fmtM2(m2) { return isSqf() ? (m2 * sqf).toFixed(2) : m2.toFixed(3); }
function fmtPrice(n) { return n.toFixed(2); }
function isSellerFreight(inc) { return sellerFreightCodes.indexOf(inc) >= 0; }
function getContainerCap(thk) { var n = parseFloat(thk); return n > 0 ? 900 / n : 450; }

function getFlagEmoji(cc) {
  if (!cc) return '';
  var cp = cc.toUpperCase().split('').map(function(c) {
    return String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65);
  });
  return cp.join('');
}

function initProforma(stones, sizes, mults, fmults, editData) {
  stonesData = stones;
  sizesData = sizes;
  sizesDataMetric = window.sizesDataMetric || {};
  sizesDataImperial = window.sizesDataImperial || {};
  thickMult = mults;
  finishMult = fmults;
  if (editData) {
    editId = editData.id || '';
    localStorage.removeItem(draftKey());
    loadProformaData(editData);
  } else {
    localStorage.removeItem(draftKey());
  }
  var savedCountry = document.getElementById('pi-dest-country');
  if (savedCountry && savedCountry.value) {
    var portVal = savedPortValue || '';
    destCountryUpd();
    if (portVal && document.getElementById('pi-dest-port')) {
      document.getElementById('pi-dest-port').value = portVal;
      destPortUpd();
    }
  }
  var raw = sessionStorage.getItem('dija_client_session');
  if (raw) {
    try { clientSession = JSON.parse(raw); } catch(e) { clientSession = null; }
    if (clientSession && clientSession.id) {
      var ci = document.getElementById('pi-client-id');
      if (ci) ci.value = clientSession.id;
      var dlink = document.getElementById('pf-dashboard-link');
      if (dlink) dlink.style.display = 'block';
    }
  }
  showStep(currentStep);
  bindUnitToggle();
  bindStepNav();
  bindFormSubmit();
  if (items.length === 0) addItem();
  recalcAll();
  bindIncoterm();
  if (typeof clientProfileData !== 'undefined') autoFillProfile(clientProfileData);
  if (!clientSession) localStorage.removeItem('dija_proforma_draft');
}

function updateOriginPorts() {
  var el = document.getElementById('pi-origin-ports');
  if (!el) return;
  var portMap = {};
  document.querySelectorAll('.pi-row').forEach(function(r) {
    var sel = r.querySelector('.pi-sel');
    var gradeEl = r.querySelector('.pi-grade');
    if (!sel || !sel.value) return;
    var stoneId = sel.value;
    var stone = stonesData[stoneId];
    if (!stone) return;
    var country = stone[4] || '';
    var portId = countryPorts[country] || 'izmir';
    var portInfo = portData[portId] || {name:'Izmir Port',country:'Turkey',city:'Izmir',rates:{}};
    if (!portMap[portId]) portMap[portId] = {info:portInfo,stones:[],count:0};
    portMap[portId].stones.push(stone[0]);
    portMap[portId].count++;
  });
  var keys = Object.keys(portMap);
  if (keys.length === 0) {
    el.innerHTML = '<p class="pf-note"><i class="fa-solid fa-info-circle"></i> Select stones in Step 2 to see origin ports.</p>';
    return;
  }
  var html = '<div class="pf-origin-grid">';
  for (var k = 0; k < keys.length; k++) {
    var pm = portMap[keys[k]];
    var pi = pm.info;
    html += '<div class="pf-origin-card">' +
      '<div class="pf-origin-header"><strong>' + pi.name + '</strong></div>' +
      '<div class="pf-origin-body">' +
      '<span class="pf-origin-loc">' + pi.city + ', ' + pi.country + '</span>' +
      '<span class="pf-origin-stones">' + pm.stones.join(', ') + '</span>' +
      '</div></div>';
  }
  html += '</div>';
  el.innerHTML = html;
}

function destCountryUpd() {
  var countryEl = document.getElementById('pi-dest-country');
  var portEl = document.getElementById('pi-dest-port');
  if (!countryEl || !portEl) return;
  var country = countryEl.value;
  var ports = destPorts[country] || [];
  portEl.innerHTML = '<option value="">-- Select Port --</option>';
  for (var i = 0; i < ports.length; i++) {
    portEl.innerHTML += '<option value="' + ports[i] + '">' + ports[i] + '</option>';
  }
  if (ports.length > 0) {
    portEl.value = ports[0];
  }
  destPortUpd();
}

function destPortUpd() {
  var countryEl = document.getElementById('pi-dest-country');
  var portEl = document.getElementById('pi-dest-port');
  var zoneEl = document.getElementById('pi-zone');
  if (!countryEl || !portEl || !zoneEl) return;
  var country = countryEl.value;
  var port = portEl.value;
  var zone = '';
  if (country && portZones[country] && portZones[country][port]) {
    zone = portZones[country][port];
  } else if (country && countryToZone[country] && countryToZone[country].length > 0) {
    zone = countryToZone[country][0];
  }
  zoneEl.value = zone;
  recalcAll();
  saveDraft();
}

function bindUnitToggle() {
  document.querySelectorAll('input[name="unit"]').forEach(function(el) {
    el.addEventListener('change', function() {
      unit = this.value;
      sizesData = unit === 'sqf' ? sizesDataImperial : sizesDataMetric;
      updateQtyLabels();
      showStep(currentStep);
      rebuildStoneOpts();
      rebuildAllSizes();
      recalcAll();
      saveDraft();
    });
  });
}

function bindStepNav() {
  document.querySelectorAll('.pf-step-ind').forEach(function(el) {
    el.addEventListener('click', function() {
      var step = parseInt(this.getAttribute('data-step'));
      if (step > currentStep && !validateStep(currentStep)) return;
      showStep(step);
      var form = document.querySelector('.pf-form');
      if (form) window.scrollTo({ top: form.offsetTop - 20, behavior: 'smooth' });
    });
  });
}

function bindIncoterm() {
  var sel = document.querySelector('select[name="incoterm"]');
  if (sel) sel.addEventListener('change', function() {
    document.querySelectorAll('.inc-detail').forEach(function(e) { e.style.display = 'none'; });
    var d = document.getElementById('inc-' + this.value);
    if (d) d.style.display = 'block';
    recalcAll();
    saveDraft();
  });
}

function resetSubmitBtn() {
  var btn = document.getElementById('pi-btn');
  if (!btn) return;
  btn.disabled = false;
  btn.textContent = editId ? 'Update Proforma Invoice' : 'Generate Proforma Invoice';
}

function bindFormSubmit() {
  document.getElementById('proforma-form').addEventListener('submit', function(e) {
    try {
    e.preventDefault();
    if (!validateStep(4)) return;
    var btn = document.getElementById('pi-btn');
    var errors = [];
    document.querySelectorAll('.pi-row').forEach(function(r) {
      var ri = r.id.replace('pi-r-', '');
      var stone = r.querySelector('.pi-sel').value;
      var cat = r.querySelector('.pi-cat').value;
      var size = r.querySelector('.pi-size').value;
      var qty = parseFloat(r.querySelector('.pi-qty').value) || 0;
      var lbl = 'Row ' + (parseInt(ri) + 1);
      if (!stone) errors.push(lbl + ': Select a stone');
      if (!cat) errors.push(lbl + ': Select a category');
      if (cat && !size) errors.push(lbl + ': Select a size');
      if (cat && size && qty <= 0) errors.push(lbl + ': Enter quantity > 0');
    });
    if (errors.length) {
      alert('Please fix these before generating:\n\n' + errors.join('\n'));
      goToStep(2);
      return;
    }
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + (editId ? 'Updating Proforma...' : 'Generating Proforma...');
    console.log('[proforma] Starting submit, btn disabled');
    var controller = new AbortController();
    var timeout = setTimeout(function() { controller.abort(); }, 30000);
    var safetyTimer = setTimeout(resetSubmitBtn, 35000);
    var fd = new FormData(this);
    if (editId) fd.append('edit_id', editId);
    fetch('api/proforma-save.php', { method: 'POST', body: fd, credentials: 'include', signal: controller.signal })
      .then(function(r) { clearTimeout(timeout); clearTimeout(safetyTimer); console.log('[proforma] Response status', r.status); return r.json(); })
      .then(function(d) {
        if (d.ok) {
          console.log('[proforma] Success, redirecting');
          localStorage.removeItem(draftKey());
          window.location.href = '?page=proforma-view&id=' + d.id;
        } else {
          console.log('[proforma] Server error', d.error);
          alert('Error: ' + (d.error || 'Unknown'));
          resetSubmitBtn();
        }
      })
      .catch(function(err) {
        clearTimeout(timeout);
        clearTimeout(safetyTimer);
        console.log('[proforma] Fetch failed', err);
        alert('Connection error or request timed out. Please try again.');
        resetSubmitBtn();
      });
    } catch (err) {
      console.error('[proforma] Submit handler crashed', err);
      alert('An unexpected error occurred. Please try again.');
      resetSubmitBtn();
    }
  });
}

function showStep(step) {
  currentStep = step;
  document.querySelectorAll('.pf-step-content').forEach(function(el, i) {
    el.style.display = (i + 1) === step ? 'block' : 'none';
  });
  document.querySelectorAll('.pf-step-ind').forEach(function(el, i) {
    el.classList.toggle('active', (i + 1) === step);
    el.classList.toggle('done', (i + 1) < step);
  });
  if (step === 2) { rebuildStoneOpts(); rebuildAllSizes(); }
  if (step === 3) { updateOriginPorts(); destCountryUpd(); populateShippingSummary(); }
  if (step === 4) { updateCostBreakdown(); }
}

function validateStep(step) {
  var container = document.querySelectorAll('.pf-step-content')[step - 1];
  if (!container) return true;
  var msgEl = document.getElementById('pf-validation-msg');
  if (!msgEl) {
    msgEl = document.createElement('div');
    msgEl.id = 'pf-validation-msg';
    msgEl.className = 'pf-validation-error';
    msgEl.style.display = 'none';
    container.parentNode.insertBefore(msgEl, container);
  }
  var reqs = container.querySelectorAll('[required]');
  for (var i = 0; i < reqs.length; i++) {
    if (!reqs[i].value.trim()) {
      var label = reqs[i].previousElementSibling;
      var fieldName = label && (label.classList.contains('pf-label') || label.classList.contains('pi-clabel')) ? label.textContent.trim() : (reqs[i].placeholder || reqs[i].name || 'Field');
      msgEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please fill in "' + fieldName + '" before proceeding.';
      msgEl.style.display = 'flex';
      reqs[i].focus();
      reqs[i].style.borderColor = '#cc4444';
      var that = reqs[i];
      setTimeout(function() { that.style.borderColor = ''; }, 2000);
      return false;
    }
  }
  msgEl.style.display = 'none';
  return true;
}

function goToStep(step) {
  if (step > currentStep && !validateStep(currentStep)) return;
  showStep(step);
  var form = document.querySelector('.pf-form');
  if (form) window.scrollTo({ top: form.offsetTop - 20, behavior: 'smooth' });
}

function resetProforma() {
  if (!confirm('Reset all proforma data and start over?')) return;
  var form = document.getElementById('proforma-form');
  if (form) {
    form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').forEach(function(el) {
      el.value = '';
    });
    form.querySelectorAll('select').forEach(function(el) {
      var def = el.querySelector('option[value=""]');
      if (def) { el.value = ''; }
      else { el.selectedIndex = 0; }
    });
    form.querySelectorAll('input[type="radio"]').forEach(function(el) {
      el.checked = el.defaultChecked;
    });
  }
  unit = 'sqm';
  updateQtyLabels();
  var body = document.getElementById('pi-body');
  if (body) body.innerHTML = '';
  items = [];
  rowCounter = 0;
  editId = '';
  toggleEmptyGuide();
  addItem();
  try { localStorage.removeItem(draftKey()); } catch(e) {}
  currentStep = 1;
  showStep(1);
  recalcAll();
  window.scrollTo({ top: document.querySelector('.pf-form').offsetTop - 20, behavior: 'smooth' });
}

function autoFillProfile(profileData) {
  if (!profileData) return;
  var fieldMap = {
    'client_name': ['name', 'full_name'],
    'client_email': ['email'],
    'client_company': ['company_name'],
    'client_phone': ['phone'],
    'client_address': ['address'],
    'client_city': ['city'],
    'client_country': ['country']
  };
  Object.keys(fieldMap).forEach(function(formField) {
    var srcKeys = fieldMap[formField];
    var val = '';
    for (var si = 0; si < srcKeys.length; si++) {
      if (profileData[srcKeys[si]] && profileData[srcKeys[si]].trim()) {
        val = profileData[srcKeys[si]].trim();
        break;
      }
    }
    if (val) {
      var el = document.querySelector('[name="' + formField + '"]');
      if (el && !el.value.trim()) el.value = val;
    }
  });
}

function rebuildStoneOpts() {
  document.querySelectorAll('.pi-row').forEach(function(r) {
    var i = parseInt(r.id.replace('pi-r-', ''));
    var sel = r.querySelector('.pi-sel');
    if (!sel) return;
    var v = sel.value;
    sel.innerHTML = buildStoneOptions();
    sel.value = v;
    rowUpd(i);
  });
}

function buildStoneOptions() {
  var keys = Object.keys(stonesData).sort();
  var html = '<option value="">\u2014 Select Stone \u2014</option>';
  var groups = {};
  for (var k = 0; k < keys.length; k++) {
    var s = stonesData[keys[k]];
    var g = s[4] || 'Other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(k);
  }
  var gNames = Object.keys(groups).sort();
  for (var g = 0; g < gNames.length; g++) {
    html += '<optgroup label="' + gNames[g] + '">';
    var gKeys = groups[gNames[g]];
    for (var k = 0; k < gKeys.length; k++) {
      var sk = keys[gKeys[k]];
      var s = stonesData[sk];
      var p = isSqf() ? (s[1] / sqf) : s[1];
      html += '<option value="' + sk + '" data-premium="' + s[2] + '">' + s[0] + ' \u2014 $' + p.toFixed(2) + '/' + uSuf() + '</option>';
    }
    html += '</optgroup>';
  }
  return html;
}

function rebuildAllSizes() {
  document.querySelectorAll('.pi-row').forEach(function(r) {
    var i = parseInt(r.id.replace('pi-r-', ''));
    var catEl = r.querySelector('.pi-cat');
    var prevCat = catEl.value;
    catEl.innerHTML = buildCategoryOptions();
    catEl.value = sizesData[prevCat] ? prevCat : '';
    catUpd(i);
  });
}

function toggleEmptyGuide() {
  var guide = document.getElementById('pi-empty-guide');
  if (guide) guide.style.display = items.length === 0 ? 'block' : 'none';
}

function addItem() {
  var i = rowCounter++;
  items.push(i);
  toggleEmptyGuide();
  var b = document.getElementById('pi-body');
  var r = document.createElement('div');
  r.className = 'pi-row';
  r.id = 'pi-r-' + i;
  r.innerHTML =
    '<div class="pi-row-inner">' +
      '<div class="pi-cell pi-cell-stone">' +
        '<label class="pi-clabel">Stone * <span class="pi-tip" title="Select the stone material">&#9432;</span></label>' +
        '<select name="s[' + i + '][id]" class="pi-sel" onchange="rowUpd(' + i + ')" required>' + buildStoneOptions() + '</select>' +
        '<div class="pi-grade-row"><label class="pi-clabel" style="margin-top:4px">Grade</label>' +
        '<select name="s[' + i + '][grade]" class="pi-grade" onchange="rowUpd(' + i + ')"><option value="Standard">Standard</option><option value="Premium">Premium</option></select></div>' +
        '<div class="pi-stone-info" id="pi-si-' + i + '" style="display:none;margin-top:6px;">' +
          '<img class="pi-stone-thumb" id="pi-st-' + i + '" src="" alt="" style="width:120px;height:120px;object-fit:cover;border-radius:4px;float:left;margin-right:10px;">' +
          '<div class="pi-stone-meta" style="overflow:hidden;">' +
            '<span class="pi-stone-country-badge" id="pi-scb-' + i + '"></span>' +
            '<span class="pi-stone-origin" id="pi-so-' + i + '" style="display:block;font-size:0.85em;color:var(--text-muted);margin-top:2px;"></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="pi-cell pi-cell-size">' +
        '<label class="pi-clabel">Category <span class="pi-tip" title="Select the size category">&#9432;</span></label>' +
        '<select name="s[' + i + '][cat]" class="pi-cat" onchange="catUpd(' + i + ')" required>' + buildCategoryOptions() + '</select>' +
        '<label class="pi-clabel" style="margin-top:4px">Size</label>' +
        '<select name="s[' + i + '][size]" class="pi-size" onchange="sizeUpd(' + i + ')"><option value="">Select size</option></select>' +
        '<div class="pi-size-preview" id="pi-sp-' + i + '" style="display:none;">' +
          '<div class="pi-size-visual" id="pi-sv-' + i + '">' +
            '<div class="pi-dim-overlay"><span class="pi-dim-w" id="pi-dw-' + i + '"></span><span class="pi-dim-h" id="pi-dh-' + i + '"></span></div>' +
          '</div>' +
          '<span class="pi-size-dim-label" id="pi-sl-' + i + '"></span>' +
          '<span class="pi-size-area" id="pi-sa-' + i + '"></span>' +
        '</div>' +
        '<div class="pi-custom-dims" id="pi-cd-' + i + '" style="display:none;"><label class="pi-clabel">W (cm)</label><input type="number" name="s[' + i + '][cw]" class="pi-num" placeholder="W" min="1" step="0.1" oninput="cusUpd(' + i + ')"><label class="pi-clabel">H (cm)</label><input type="number" name="s[' + i + '][ch]" class="pi-num" placeholder="H" min="1" step="0.1" oninput="cusUpd(' + i + ')"></div>' +
      '</div>' +
      '<div class="pi-cell pi-cell-detail">' +
        '<label class="pi-clabel">Thickness</label>' +
        '<select name="s[' + i + '][t]" class="pi-thk" onchange="rowUpd(' + i + ')"></select>' +
        '<label class="pi-clabel" style="margin-top:4px">Finish</label>' +
        '<select name="s[' + i + '][f]" class="pi-finish" onchange="rowUpd(' + i + ')">' +
          '<option value="Polished">Polished</option>' +
          '<option value="Honed">Honed</option>' +
          '<option value="Leather">Leather</option>' +
          '<option value="Brushed">Brushed</option>' +
        '</select>' +
        '<label class="pi-clabel" style="margin-top:4px" id="pi-ql-' + i + '">Area (' + uSuf() + ')</label>' +
        '<input type="number" name="s[' + i + '][q]" class="pi-qty" value="" placeholder="Total area needed" min="0" step="any" oninput="rowUpd(' + i + ')" required>' +
      '</div>' +
      '<div class="pi-cell pi-cell-price">' +
        '<div class="pi-breakdown" id="pi-bd-' + i + '"></div>' +
        '<div class="pi-subtotals">' +
          '<div class="pi-sub-row"><span>Unit Price:</span> <strong class="pi-up" id="pi-up-' + i + '">\u2014</strong></div>' +
          '<div class="pi-sub-row"><span>Price/piece:</span> <strong class="pi-pp" id="pi-pp-' + i + '">\u2014</strong></div>' +
          '<div class="pi-sub-row"><span>Area:</span> <strong class="pi-ar" id="pi-ar-' + i + '">\u2014</strong></div>' +
          '<div class="pi-sub-row pi-lt-row"><span>Line Total:</span> <strong class="pi-lt" id="pi-lt-' + i + '">\u2014</strong></div>' +
        '</div>' +
      '</div>' +
      '<div class="pi-cell pi-cell-del">' +
        '<button type="button" class="pi-del" onclick="del(' + i + ')" title="Remove item"><i class="fa-solid fa-xmark"></i></button>' +
      '</div>' +
    '</div>';
  b.appendChild(r);
}

function buildCategoryOptions() {
  var ckeys = Object.keys(sizesData);
  var html = '';
  for (var c = 0; c < ckeys.length; c++) {
    var catSizes = sizesData[ckeys[c]];
    if (!catSizes || !catSizes.length) continue;
    var catName = catSizes[0].cat || ckeys[c];
    var catMult = catSizes[0].cat_mult || 1.0;
    var multStr = catMult !== 1.0 ? ' (\u00D7' + catMult.toFixed(2) + ')' : '';
    if (ckeys[c] === 'custom' || ckeys[c] === 'custom-imperial') continue;
    html += '<option value="' + ckeys[c] + '">' + catName + multStr + '</option>';
  }
  html += '<option value="custom">Custom Size (\u00D71.20)</option>';
  return html;
}

function buildThickOptions(avail, cur) {
  var html = '';
  for (var t = 0; t < avail.length; t++) {
    var v = avail[t];
    var mult = thickMult[v] || 1.0;
    var multStr = mult !== 1.0 ? ' (\u00D7' + mult.toFixed(2) + ')' : '';
    var sel = v === cur ? ' selected' : '';
    html += '<option value="' + v + '"' + sel + '>' + v + multStr + '</option>';
  }
  return html;
}

function del(i) {
  var r = document.getElementById('pi-r-' + i);
  if (r) { r.remove(); items = items.filter(function(x) { return x !== i; }); }
  toggleEmptyGuide();
  if (items.length === 0) addItem();
  recalcAll();
  saveDraft();
}

function catUpd(i) {
  var r = document.getElementById('pi-r-' + i);
  if (!r) return;
  var cat = r.querySelector('.pi-cat').value;
  var sizeSel = r.querySelector('.pi-size');
  var cd = document.getElementById('pi-cd-' + i);
  var qtyEl = r.querySelector('.pi-qty');
  var qlEl = document.getElementById('pi-ql-' + i);
  sizeSel.innerHTML = '';
  if (!cat || cat === 'custom') {
    sizeSel.innerHTML = '<option value="custom">Custom</option>';
    cd.style.display = 'flex';
    if (qlEl) qlEl.textContent = 'Area (' + uSuf() + ')';
    if (qtyEl) qtyEl.placeholder = 'Total area needed';
    rowUpd(i);
    return;
  }
  cd.style.display = 'none';
  var sizes = sizesData[cat] || [];
  var isLin = sizes.length && sizes[0].product_type === 'linear';
  if (qlEl) qlEl.textContent = isLin ? 'Length (m)' : 'Area (' + uSuf() + ')';
  if (qtyEl) qtyEl.placeholder = isLin ? 'Total linear meters' : 'Total area needed';
  var opts = '<option value="">Select size</option>';
  for (var s = 0; s < sizes.length; s++) {
    var sz = sizes[s];
    var w = sz.w || 0;
    var h = sz.h || 0;
    var a = (w * h) / 10000;
    opts += '<option value="' + s + '" data-w="' + w + '" data-h="' + h + '" data-l="' + (sz.l || '') + '">' + (sz.l || 'Unknown') + ' (' + fmtM2(a) + ' ' + uSuf() + ')</option>';
  }
  sizeSel.innerHTML = opts;
  rowUpd(i);
}

function sizeUpd(i) {
  var r = document.getElementById('pi-r-' + i);
  if (!r) return;
  var sizeSel = r.querySelector('.pi-size');
  var cd = document.getElementById('pi-cd-' + i);
  var opt = sizeSel.options[sizeSel.selectedIndex];
  if (opt && opt.value === 'custom') { cd.style.display = 'flex'; }
  else { cd.style.display = 'none'; }
  rowUpd(i);
}

function cusUpd(i) { rowUpd(i); }

function getCatMult(i) {
  var r = document.getElementById('pi-r-' + i);
  if (!r) return 1.0;
  var cat = r.querySelector('.pi-cat').value;
  if (cat === 'custom') return 1.2;
  var sizes = sizesData[cat];
  if (sizes && sizes.length) return sizes[0].cat_mult || 1.0;
  return 1.0;
}

function rowUpd(i) {
  var r = document.getElementById('pi-r-' + i);
  if (!r) return;
  var sel = r.querySelector('.pi-sel');
  var gradeEl = r.querySelector('.pi-grade');
  var cat = r.querySelector('.pi-cat').value;
  var sizeSel = r.querySelector('.pi-size');
  var thickEl = r.querySelector('.pi-thk');
  var finishEl = r.querySelector('.pi-finish');
  var qtyEl = r.querySelector('.pi-qty');
  var upEl = document.getElementById('pi-up-' + i);
  var ppEl = document.getElementById('pi-pp-' + i);
  var arEl = document.getElementById('pi-ar-' + i);
  var ltEl = document.getElementById('pi-lt-' + i);
  var bdEl = document.getElementById('pi-bd-' + i);
  var stoneId = sel.value;
  var stone = stonesData[stoneId];
  var enteredArea = parseFloat(qtyEl.value) || 0;
  if (!stone) {
    upEl.textContent = '\u2014'; arEl.textContent = '\u2014'; ltEl.textContent = '\u2014'; bdEl.innerHTML = '';
    var si = document.getElementById('pi-si-' + i);
    if (si) si.style.display = 'none';
    recalcAll(); return;
  }
  var grade = gradeEl ? gradeEl.value : 'Standard';
  var basePrice = grade === 'Premium' ? parseFloat(stone[2]) : parseFloat(stone[1]);
  var stoneImg = stone[5] || '';
  var stoneCountry = stone[4] || '';
  var stoneIso = countryIso[stoneCountry] || '';
  var si = document.getElementById('pi-si-' + i);
  var st = document.getElementById('pi-st-' + i);
  var scb = document.getElementById('pi-scb-' + i);
  var so = document.getElementById('pi-so-' + i);
  if (si && st && scb && so) {
    si.style.display = 'block';
    st.src = stoneImg;
    st.alt = stone[0] || '';
    var flag = stoneIso ? getFlagEmoji(stoneIso) : '';
    scb.innerHTML = (flag ? flag + ' ' : '') + '<strong>' + stoneCountry + '</strong>';
    so.textContent = 'Origin: ' + stoneCountry;
  }
  var sp = document.getElementById('pi-sp-' + i);
  var dw = document.getElementById('pi-dw-' + i);
  var dh = document.getElementById('pi-dh-' + i);
  var sa = document.getElementById('pi-sa-' + i);
  if (sp && dw && dh && sa) {
    var opt2 = sizeSel.options[sizeSel.selectedIndex];
    if (opt2 && opt2.value && opt2.value !== 'custom') {
      var sw_cm = parseFloat(opt2.getAttribute('data-w')) || 0;
      var sh_cm = parseFloat(opt2.getAttribute('data-h')) || 0;
      var sd = sizesData[cat] && sizesData[cat][parseInt(opt2.value)];
      var sv = document.getElementById('pi-sv-' + i);
      var sl = document.getElementById('pi-sl-' + i);
      var isSlab = cat.indexOf('slab') !== -1;
      if (sv && sl && sw_cm && sh_cm) {
        var maxW = 160, maxH = 120;
        var ratio = sw_cm / sh_cm;
        var dispW, dispH;
        if (ratio > maxW / maxH) {
          dispW = maxW; dispH = maxW / ratio;
        } else {
          dispH = maxH; dispW = maxH * ratio;
        }
        sv.style.width = Math.round(dispW) + 'px';
        sv.style.height = Math.round(dispH) + 'px';
        var si = document.getElementById('pi-st-' + i);
        var imgUrl = si ? si.src : '';
        sv.style.backgroundImage = imgUrl ? 'url(' + imgUrl + ')' : 'none';
        sv.style.backgroundColor = imgUrl ? 'transparent' : 'var(--stone-pale)';
        sv.className = 'pi-size-visual' + (isSlab ? ' pi-slab-edge' : ' pi-tile-edge');
        if (isSqf() && sd && sd.w_in) {
          dw.textContent = sd.w_in + '"';
          dh.textContent = sd.h_in + '"';
          sl.textContent = sd.w_in + '\u00D7' + sd.h_in + ' in';
        } else {
          dw.textContent = sw_cm + ' cm';
          dh.textContent = sh_cm + ' cm';
          sl.textContent = sw_cm + '\u00D7' + sh_cm + ' cm';
        }
        sa.textContent = fmtM2((sw_cm * sh_cm) / 10000) + ' ' + uSuf();
        sp.style.display = 'block';
      }
    } else {
      sp.style.display = 'none';
    }
  }
  var w = 0, h = 0, isCustom = false;
  var opt = sizeSel.options[sizeSel.selectedIndex];
  if (cat === 'custom' || (opt && opt.value === 'custom')) {
    isCustom = true;
    w = parseFloat(r.querySelector('input[name*="[cw]"]').value) || 0;
    h = parseFloat(r.querySelector('input[name*="[ch]"]').value) || 0;
  } else if (opt && opt.value) {
    w = parseFloat(opt.getAttribute('data-w')) || 0;
    h = parseFloat(opt.getAttribute('data-h')) || 0;
  }
  var areaM2 = (w * h) / 10000;
  var isLin = cat && sizesData[cat] && sizesData[cat].length && sizesData[cat][0].product_type === 'linear';
  var totalM2 = isLin ? enteredArea * (w / 100) : (isSqf() ? enteredArea / sqf : enteredArea);
  var availThicks = [];
  if (isCustom) availThicks = ['1 cm', '2 cm', '3 cm'];
  else if (opt && opt.value) {
    var sizes = sizesData[cat] || [];
    var sidx = parseInt(opt.value);
    if (sizes[sidx] && sizes[sidx].t) availThicks = sizes[sidx].t;
    else availThicks = ['2 cm', '3 cm'];
  } else availThicks = ['2 cm'];
  var curThick = thickEl.value;
  thickEl.innerHTML = buildThickOptions(availThicks, curThick);
  if (!thickEl.value && availThicks.length) thickEl.value = availThicks[0];
  var thickness = thickEl.value;
  var tMult = thickMult[thickness] || 1.0;
  var cMult = isCustom ? 1.2 : getCatMult(i);
  var finish = finishEl ? finishEl.value : 'Polished';
  var fMult = finishMult[finish] || 1.0;
  var adjPrice = basePrice * tMult * cMult * fMult;
  var adjPriceUnit = isSqf() ? adjPrice / sqf : adjPrice;
  var lineTotal = adjPrice * totalM2;
  var piecePrice = adjPrice * areaM2;
  upEl.textContent = '$' + fmtPrice(adjPriceUnit) + '/' + uSuf();
  ppEl.textContent = piecePrice > 0 ? '$' + fmtPrice(piecePrice) + '/pc' : '\u2014';
  arEl.textContent = enteredArea > 0 ? enteredArea.toFixed(2) + ' ' + (isLin ? 'm' : uSuf()) : '\u2014';
  ltEl.textContent = lineTotal > 0 ? '$' + fmtPrice(lineTotal) : '\u2014';
  var gradeName = grade === 'Premium' ? stone[0] + ' Premium' : stone[0];
  bdEl.innerHTML =
    '<div class="pi-bd-line"><span>' + gradeName + '</span> <strong>$' + fmtPrice(basePrice) + '/m\u00B2</strong></div>' +
    '<div class="pi-bd-line"><span>Thickness (' + thickness + ')</span> <strong>\u00D7' + tMult.toFixed(2) + '</strong></div>' +
    '<div class="pi-bd-line"><span>Size factor</span> <strong>\u00D7' + cMult.toFixed(2) + '</strong></div>' +
    '<div class="pi-bd-line"><span>Finish (' + finish + ')</span> <strong>\u00D7' + fMult.toFixed(2) + '</strong></div>' +
    '<div class="pi-bd-line pi-bd-total"><span>Unit Price</span> <strong>$' + fmtPrice(adjPriceUnit) + '/' + uSuf() + '</strong></div>';
  r.setAttribute('data-area-m2', areaM2);
  r.setAttribute('data-area-total-m2', totalM2);
  r.setAttribute('data-adj-price', adjPrice);
  r.setAttribute('data-line-total', lineTotal);
  r.setAttribute('data-thickness', thickness);
  r.setAttribute('data-is-custom', isCustom ? '1' : '0');
  r.setAttribute('data-grade', grade);
  r.setAttribute('data-finish', finish);
  r.setAttribute('data-stone-country', stone[4] || '');
  recalcAll();
  saveDraft();
  updateOriginPorts();
}

function estimateIncotermCosts(subtotal, totalContainers, oceanFreight, incotermCode) {
  var m = costEstimates.incoterm_matrix[incotermCode] || costEstimates.incoterm_matrix['EXW'];
  var items = [];
  var packing = m.packing ? subtotal * costEstimates.packing_pct / 100 : 0;
  items.push({code:'packing',label:'Packing & Crating',amount:packing,included:m.packing});
  var inland = m.inland ? totalContainers * costEstimates.inland_per_container : 0;
  items.push({code:'inland',label:'Inland Freight to Port',amount:inland,included:m.inland});
  var customs = m.customs ? costEstimates.export_customs_flat : 0;
  items.push({code:'customs',label:'Export Customs Clearance',amount:customs,included:m.customs});
  var loading = m.loading ? totalContainers * costEstimates.loading_per_container : 0;
  items.push({code:'loading',label:'Port Loading',amount:loading,included:m.loading});
  var freight = m.freight ? oceanFreight : 0;
  items.push({code:'freight',label:'Ocean Freight',amount:freight,included:m.freight});
  var insurance = m.insurance ? (subtotal + freight) * costEstimates.insurance_pct / 100 : 0;
  items.push({code:'insurance',label:'Marine Insurance',amount:insurance,included:m.insurance});
  var cifValue = subtotal + freight + insurance;
  var importCosts = m.import ? cifValue * costEstimates.import_duty_pct / 100 : 0;
  items.push({code:'import',label:'Import Duties & Taxes (5% of CIF)',amount:importCosts,included:m.import});
  var delivery = m.delivery ? totalContainers * costEstimates.delivery_per_container : 0;
  items.push({code:'delivery',label:'Destination Delivery',amount:delivery,included:m.delivery});
  var totalAdd = packing + inland + customs + loading + freight + insurance + importCosts + delivery;
  return { breakdown: items, totalAdditional: totalAdd, grandTotal: subtotal + totalAdd, label: m.label };
}

function getPrimaryOriginPort() {
  var firstRow = document.querySelector('.pi-row');
  if (!firstRow) return '';
  var sel = firstRow.querySelector('.pi-sel');
  if (!sel || !sel.value) return '';
  var stone = stonesData[sel.value];
  if (!stone) return '';
  return countryPorts[stone[4] || ''] || 'izmir';
}

function recalcAll() {
  var sub = 0, totalM2 = 0;
  var thicknessAreas = {};
  var hasItems = false;
  document.querySelectorAll('.pi-row').forEach(function(r) {
    var lt = parseFloat(r.getAttribute('data-line-total')) || 0;
    var m2 = parseFloat(r.getAttribute('data-area-total-m2')) || 0;
    var thk = r.getAttribute('data-thickness') || '2 cm';
    if (lt > 0) hasItems = true;
    sub += lt;
    totalM2 += m2;
    if (!thicknessAreas[thk]) thicknessAreas[thk] = 0;
    thicknessAreas[thk] += m2;
  });
  document.getElementById('pi-sub').textContent = hasItems ? '$' + fmtPrice(sub) : '\u2014';
  document.getElementById('pi-sub-h').value = sub.toFixed(2);
  document.getElementById('pi-m2').value = totalM2.toFixed(2);
  var at = document.getElementById('pi-area-total');
  if (at) at.textContent = fmtM2(totalM2) + ' ' + uSuf();
  var equivM2 = 0;
  for (var thk in thicknessAreas) {
    var c = getContainerCap(thk);
    equivM2 += thicknessAreas[thk] * (450 / c);
  }
  var containers = equivM2 > 0 ? Math.max(1, Math.ceil(equivM2 / 450)) : 0;
  document.getElementById('pi-containers').textContent = containers > 0 ? containers : '\u2014';
  document.getElementById('pi-containers-detail').textContent = containers > 0 ? containers + ' \u00D7 20ft container(s)' : '';
  document.getElementById('pi-containers-detail').style.display = containers > 0 ? '' : 'none';
  document.getElementById('pi-containers-h').value = containers;

  var incEl = document.querySelector('select[name="incoterm"]');
  var incoterm = incEl ? incEl.value : '';
  var sf = isSellerFreight(incoterm);

  var zoneEl = document.getElementById('pi-zone');
  var shipCost = 0;
  if (sf && zoneEl && zoneEl.value && containers > 0) {
    var zone = zoneEl.value;
    var originPortId = getPrimaryOriginPort();
    var rate = 0;
    if (originPortId && portData[originPortId] && portData[originPortId].rates && portData[originPortId].rates[zone]) {
      rate = parseFloat(portData[originPortId].rates[zone]) || 0;
    }
    shipCost = containers * rate;
    document.getElementById('pi-sc').textContent = '$' + fmtPrice(shipCost);
    document.getElementById('pi-sc-h').value = shipCost.toFixed(2);
  } else {
    document.getElementById('pi-sc').textContent = '\u2014';
    document.getElementById('pi-sc-h').value = '0';
  }

  if (hasItems && sub > 0) {
    var costResult = estimateIncotermCosts(sub, containers, shipCost, incoterm || 'EXW');
    var gt = costResult.grandTotal;
    document.getElementById('pi-gt').textContent = '$' + fmtPrice(gt);
    document.getElementById('pi-gt-h').value = gt.toFixed(2);
  } else {
    document.getElementById('pi-gt').textContent = '\u2014';
    document.getElementById('pi-gt-h').value = '0';
  }

  if (currentStep === 4) updateCostBreakdown();
}

function zoneUpd() { recalcAll(); saveDraft(); }

function populateShippingSummary() {
  var incEl = document.querySelector('select[name="incoterm"]');
  var incoterm = incEl ? incEl.value : '';
  var sf = isSellerFreight(incoterm);
  var zoneEl = document.getElementById('pi-zone');
  var portEl = document.getElementById('pi-destination-port');
  if (sf && zoneEl && zoneEl.value) {
    var zone = zoneEl.value;
    var originPortId = getPrimaryOriginPort();
    var rate = 0;
    if (originPortId && portData[originPortId] && portData[originPortId].rates && portData[originPortId].rates[zone]) {
      rate = parseFloat(portData[originPortId].rates[zone]) || 0;
    }
    var containers = parseInt(document.getElementById('pi-containers-h').value) || 0;
    var total = containers * rate;
    document.getElementById('pi-sc').textContent = total > 0 ? '$' + fmtPrice(total) : '\u2014';
    document.getElementById('pi-sc-h').value = total.toFixed(2);
  }
  recalcAll();
}

function updateCostBreakdown() {
  var sub = parseFloat(document.getElementById('pi-sub-h').value) || 0;
  var containers = parseInt(document.getElementById('pi-containers-h').value) || 0;
  var shipCost = parseFloat(document.getElementById('pi-sc-h').value) || 0;
  var incEl = document.querySelector('select[name="incoterm"]');
  var incoterm = incEl ? incEl.value : '';
  if (sub <= 0) return;
  var costResult = estimateIncotermCosts(sub, containers, shipCost, incoterm || 'EXW');
  var el = document.getElementById('pi-cost-breakdown');
  if (!el) return;
  var html = '<div class="cb-table">';
  var hasIncluded = false;
  for (var i = 0; i < costResult.breakdown.length; i++) {
    var c = costResult.breakdown[i];
    if (c.amount > 0) {
      hasIncluded = true;
      html += '<div class="cb-row"><span class="cb-label">' + c.label + '</span><span class="cb-amount">$' + fmtPrice(c.amount) + '</span></div>';
    }
  }
  html += '<div class="cb-row cb-divider"><span class="cb-label">Subtotal (' + costResult.label + ')</span><span class="cb-amount cb-bold">$' + fmtPrice(costResult.grandTotal) + '</span></div>';
  html += '</div>';
  if (sub > 0) {
    html += '<div class="cb-inc-note">Incoterm: ' + incoterm + ' &mdash; ' + costResult.label + '</div>';
  }
  el.innerHTML = html;
}

var savedPortValue = '';

function draftKey() {
  var cid = clientSession ? clientSession.id : '';
  return cid ? 'dija_proforma_draft_' + cid : 'dija_proforma_draft';
}

function saveDraft() {
  try {
    var form = document.getElementById('proforma-form');
    var fd = new FormData(form);
    var data = {};
    for (var pair of fd.entries()) { data[pair[0]] = pair[1]; }
    data._unit = unit;
    data._step = currentStep;
    localStorage.setItem(draftKey(), JSON.stringify(data));
  } catch(e) {}
}

function restoreDraft() {
  try {
    var raw = localStorage.getItem(draftKey());
    if (!raw) return;
    var data = JSON.parse(raw);
    if (!data || !data.client_name) {
      localStorage.removeItem(draftKey());
      return;
    }
    savedPortValue = data.destination_port || '';
    var form = document.getElementById('proforma-form');
    if (!form) return;
    var fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(function(el) {
      var name = el.getAttribute('name');
      if (name && data[name] !== undefined) {
        if (el.type === 'radio') { el.checked = el.value === data[name]; }
        else { el.value = data[name]; }
      }
    });
    if (data._unit) unit = data._unit;
    if (data._step) currentStep = parseInt(data._step);
    loadItemsFromData(data);
  } catch(e) {}
}

function loadItemsFromData(data) {
  var body = document.getElementById('pi-body');
  if (!body) return;
  body.innerHTML = '';
  items = [];
  var idx = 0;
  while (data['s[' + idx + '][id]'] !== undefined) {
    items.push(idx);
    var r = document.createElement('div');
    r.className = 'pi-row';
    r.id = 'pi-r-' + idx;
    r.innerHTML =
      '<div class="pi-row-inner">' +
        '<div class="pi-cell pi-cell-stone">' +
          '<select name="s[' + idx + '][id]" class="pi-sel" onchange="rowUpd(' + idx + ')" required>' + buildStoneOptions() + '</select>' +
          '<div class="pi-grade-row"><select name="s[' + idx + '][grade]" class="pi-grade" onchange="rowUpd(' + idx + ')"><option value="Standard">Standard</option><option value="Premium">Premium</option></select></div>' +
          '<div class="pi-stone-info" id="pi-si-' + idx + '" style="display:none;margin-top:6px;">' +
            '<img class="pi-stone-thumb" id="pi-st-' + idx + '" src="" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:4px;float:left;margin-right:10px;">' +
            '<div class="pi-stone-meta" style="overflow:hidden;">' +
              '<span class="pi-stone-country-badge" id="pi-scb-' + idx + '"></span>' +
              '<span class="pi-stone-origin" id="pi-so-' + idx + '" style="display:block;font-size:0.85em;color:var(--text-muted);margin-top:2px;"></span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="pi-cell pi-cell-size">' +
          '<select name="s[' + idx + '][cat]" class="pi-cat" onchange="catUpd(' + idx + ')" required>' + buildCategoryOptions() + '</select>' +
          '<select name="s[' + idx + '][size]" class="pi-size" onchange="sizeUpd(' + idx + ')"><option value="">Select size</option></select>' +
          '<div class="pi-custom-dims" id="pi-cd-' + idx + '" style="display:none;"><input type="number" name="s[' + idx + '][cw]" class="pi-num" placeholder="W" min="1" step="0.1" oninput="cusUpd(' + idx + ')"><input type="number" name="s[' + idx + '][ch]" class="pi-num" placeholder="H" min="1" step="0.1" oninput="cusUpd(' + idx + ')"></div>' +
        '</div>' +
        '<div class="pi-cell pi-cell-detail">' +
          '<select name="s[' + idx + '][t]" class="pi-thk" onchange="rowUpd(' + idx + ')"></select>' +
          '<select name="s[' + idx + '][f]" class="pi-finish" onchange="rowUpd(' + idx + ')">' +
            '<option value="Polished">Polished</option><option value="Honed">Honed</option><option value="Leather">Leather</option><option value="Brushed">Brushed</option>' +
          '</select>' +
          '<label class="pi-clabel" style="margin-top:4px" id="pi-ql-' + idx + '">Area (' + uSuf() + ')</label>' +
          '<input type="number" name="s[' + idx + '][q]" class="pi-qty" value="" placeholder="Total area needed" min="0" step="any" oninput="rowUpd(' + idx + ')" required>' +
        '</div>' +
        '<div class="pi-cell pi-cell-price"><div class="pi-breakdown" id="pi-bd-' + idx + '"></div><div class="pi-subtotals">' +
          '<div class="pi-sub-row"><span>Unit Price:</span> <strong class="pi-up" id="pi-up-' + idx + '">\u2014</strong></div>' +
          '<div class="pi-sub-row"><span>Price/piece:</span> <strong class="pi-pp" id="pi-pp-' + idx + '">\u2014</strong></div>' +
          '<div class="pi-sub-row"><span>Area:</span> <strong class="pi-ar" id="pi-ar-' + idx + '">\u2014</strong></div>' +
          '<div class="pi-sub-row pi-lt-row"><span>Line Total:</span> <strong class="pi-lt" id="pi-lt-' + idx + '">\u2014</strong></div>' +
        '</div></div>' +
        '<div class="pi-cell pi-cell-del"><button type="button" class="pi-del" onclick="del(' + idx + ')"><i class="fa-solid fa-xmark"></i></button></div>' +
      '</div>';
    body.appendChild(r);
    idx++;
  }
  for (var i = 0; i < idx; i++) {
    var r = document.getElementById('pi-r-' + i);
    if (!r) continue;
    var sel = r.querySelector('.pi-sel');
    var gradeEl = r.querySelector('.pi-grade');
    var cat = r.querySelector('.pi-cat');
    var sizeEl = r.querySelector('.pi-size');
    var thickEl = r.querySelector('.pi-thk');
    var finishEl = r.querySelector('.pi-finish');
    var qtyEl = r.querySelector('.pi-qty');
    var cwEl = r.querySelector('input[name*="[cw]"]');
    var chEl = r.querySelector('input[name*="[ch]"]');
    if (sel && data['s[' + i + '][id]']) sel.value = data['s[' + i + '][id]'];
    if (gradeEl && data['s[' + i + '][grade]']) gradeEl.value = data['s[' + i + '][grade]'];
    if (cat && data['s[' + i + '][cat]']) cat.value = data['s[' + i + '][cat]'];
    if (cat) catUpd(i);
    if (sizeEl && data['s[' + i + '][size]']) sizeEl.value = data['s[' + i + '][size]'];
    if (thickEl && data['s[' + i + '][t]']) thickEl.value = data['s[' + i + '][t]'];
    if (finishEl && data['s[' + i + '][f]']) finishEl.value = data['s[' + i + '][f]'];
    if (qtyEl && data['s[' + i + '][q]']) qtyEl.value = data['s[' + i + '][q]'];
    if (cwEl && data['s[' + i + '][cw]']) cwEl.value = data['s[' + i + '][cw]'];
    if (chEl && data['s[' + i + '][ch]']) chEl.value = data['s[' + i + '][ch]'];
    rowUpd(i);
  }
  toggleEmptyGuide();
  if (idx === 0) addItem();
}

function loadProformaData(pf) {
  if (!pf || !pf.items) return;
  var data = {};
  data.client_name = pf.client ? pf.client.name : '';
  data.client_email = pf.client ? pf.client.email : '';
  data.client_company = pf.client ? pf.client.company : '';
  data.client_phone = pf.client ? pf.client.phone : '';
  data.client_address = pf.client ? pf.client.address : '';
  data.client_city = pf.client ? pf.client.city : '';
  data.client_country = pf.client ? pf.client.country : '';
  data.destination_country = pf.destination_country || '';
  data.destination_port = pf.destination_port || '';
  data.incoterm = pf.incoterm || '';
  data.payment_term = pf.payment_term || '';
  data.notes = pf.notes || '';
  data.unit = pf.unit_system || 'sqm';
  for (var i = 0; i < pf.items.length; i++) {
    var it = pf.items[i];
    data['s[' + i + '][id]'] = it.stone_id || '';
    data['s[' + i + '][grade]'] = it.grade || 'Standard';
    data['s[' + i + '][cat]'] = it.stone_category_id || '';
    data['s[' + i + '][size]'] = it.stone_size_idx || '';
    data['s[' + i + '][t]'] = it.thickness || '2 cm';
    data['s[' + i + '][f]'] = it.finish || 'Polished';
    data['s[' + i + '][q]'] = (it.is_linear && it.entered_qty) ? it.entered_qty : (it.total_m2 || it.qty || '');
    data['s[' + i + '][cw]'] = it.width_cm || '';
    data['s[' + i + '][ch]'] = it.height_cm || '';
  }
  savedPortValue = data.destination_port || '';
  var form = document.getElementById('proforma-form');
  if (form) {
    var fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(function(el) {
      var name = el.getAttribute('name');
      if (name && data[name] !== undefined) {
        if (el.type === 'radio') { el.checked = el.value === data[name]; }
        else { el.value = data[name]; }
      }
    });
  }
  if (data.unit) unit = data.unit;
  loadItemsFromData(data);
}

function updateQtyLabels() {
  items.forEach(function(i) {
    var r = document.getElementById('pi-r-' + i);
    if (!r) return;
    var cat = r.querySelector('.pi-cat').value;
    var el = document.getElementById('pi-ql-' + i);
    if (!el) return;
    var isLin = false;
    if (cat && sizesData[cat] && sizesData[cat].length) {
      isLin = sizesData[cat][0].product_type === 'linear';
    }
    if (isLin) {
      el.textContent = 'Length (m)';
    } else {
      el.textContent = 'Area (' + uSuf() + ')';
    }
  });
}

function toggleReviewUnit(newUnit) {
  if (newUnit === unit) return;
  unit = newUnit;
  document.querySelectorAll('.pf-unit-pill').forEach(function(p) {
    p.classList.toggle('active', p.getAttribute('data-unit') === unit);
  });
  updateQtyLabels();
  showStep(currentStep);
  rebuildAllSizes();
  recalcAll();
  saveDraft();
}

function clearDraft() {
  if (confirm('Clear all saved draft data? This cannot be undone.')) {
    localStorage.removeItem(draftKey());
    resetProforma();
  }
}

window.initProforma = initProforma;
window.goToStep = goToStep;
window.addItem = addItem;
window.rowUpd = rowUpd;
window.catUpd = catUpd;
window.sizeUpd = sizeUpd;
window.cusUpd = cusUpd;
window.del = del;
window.resetProforma = resetProforma;
window.destCountryUpd = destCountryUpd;
window.destPortUpd = destPortUpd;
window.toggleReviewUnit = toggleReviewUnit;

})();