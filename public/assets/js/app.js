// Header scroll
document.addEventListener('scroll', function () {
  var h = document.querySelector('header');
  if (window.scrollY > 80) h.classList.add('scrolled');
  else h.classList.remove('scrolled');
});

// Desktop dropdown — click label or caret to toggle
(function () {
  var openParent = null;

  function closeDropdown() {
    if (!openParent) return;
    openParent.classList.remove('open');
    var caret = openParent.querySelector('.nav-caret');
    if (caret) caret.setAttribute('aria-expanded', 'false');
    openParent = null;
  }

  function openDropdown(parent) {
    if (openParent && openParent !== parent) closeDropdown();
    parent.classList.add('open');
    var caret = parent.querySelector('.nav-caret');
    if (caret) caret.setAttribute('aria-expanded', 'true');
    openParent = parent;
  }

  document.addEventListener('click', function (e) {
    var label = e.target.closest('.nav-parent-label');
    var caret = e.target.closest('.nav-caret');
    var trigger = label || caret;
    if (trigger) {
      e.preventDefault();
      var parent = trigger.closest('.nav-parent');
      if (!parent) return;
      if (parent.classList.contains('open')) {
        closeDropdown();
      } else {
        openDropdown(parent);
      }
      return;
    }
    if (openParent && !e.target.closest('.nav-parent')) {
      closeDropdown();
    }
  });
})();

// Mobile nav — accordion + close
function toggleMobileSubnav(header) {
  header.parentElement.classList.toggle('open');
}
function closeMobileNav() {
  var nav = document.getElementById('mobileNav');
  nav.classList.remove('open');
  document.body.style.overflow = '';
}

// Scroll reveal — IntersectionObserver
(function () {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('visible');
      // Count-up for stat numbers inside revealed sections
      el.querySelectorAll('.stat-num').forEach(countUp);
      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
    observer.observe(el);
  });

  function countUp(el) {
    var text = el.textContent.trim();
    var num = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;
    var suffix = text.replace(/[0-9.]/g, '');
    var duration = 1200;
    var start = performance.now();
    function frame(now) {
      var pct = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - pct, 3);
      el.textContent = Math.round(eased * num) + suffix;
      if (pct < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();

// Forms
function handleNewsletter(form) {
  var fd = new FormData(form);
  fetch(form.action, { method: 'POST', body: fd })
    .then(function (r) { return r.text(); })
    .then(function (m) { alert(m); form.reset(); })
    .catch(function () { alert('Connection error. Please try again.'); });
  return false;
}

document.querySelectorAll('.contact-form').forEach(function (f) {
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(f);
    fetch(f.action, { method: 'POST', body: fd })
      .then(function (r) { return r.text(); })
      .then(function (m) { alert(m); f.reset(); })
      .catch(function () { alert('Connection error. Please email us directly.'); });
  });
});

// Lightbox
var lightboxIdx = 0;
function openLightbox(idx) {
  if (!window.lightboxImgs || !lightboxImgs.length) return;
  lightboxIdx = idx;
  var lb = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = lightboxImgs[idx];
  document.getElementById('lightboxCounter').textContent = (idx + 1) + ' / ' + lightboxImgs.length;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
function navLightbox(dir) {
  if (!window.lightboxImgs || !lightboxImgs.length) return;
  lightboxIdx = (lightboxIdx + dir + lightboxImgs.length) % lightboxImgs.length;
  document.getElementById('lightboxImg').src = lightboxImgs[lightboxIdx];
  document.getElementById('lightboxCounter').textContent = (lightboxIdx + 1) + ' / ' + lightboxImgs.length;
}
document.addEventListener('keydown', function (e) {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navLightbox(-1);
  if (e.key === 'ArrowRight') navLightbox(1);
});

// Sustainability pillar cards — independent toggle
function togglePillar(el) {
  var card = el.closest('.pillar-card');
  if (!card) return;
  card.classList.toggle('open');
}

// Quarry country cards — accordion: only one open at a time
function toggleQuarryCountry(el) {
  var card = el.closest('.quarry-country-card');
  if (!card) return;
  var wasOpen = card.classList.contains('open');
  var allCards = document.querySelectorAll('.quarry-country-card');
  allCards.forEach(function(c) { c.classList.remove('open'); });
  if (!wasOpen) card.classList.add('open');
}

// Quote modal
var quoteCountries = [];
var quoteSelectedCountry = null;
var quoteCountryListVisible = false;

try { quoteCountries = JSON.parse(document.getElementById('countryData').textContent); } catch(e) {}

function openQuoteModal(stoneId, stoneName) {
  document.getElementById('qStoneId').value = stoneId;
  document.getElementById('qStoneName').value = stoneName;
  document.getElementById('quoteModalStone').textContent = stoneName;
  document.getElementById('quoteModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('qFormMsg').textContent = '';
  document.getElementById('qFormMsg').className = 'qf-msg';
}

function closeQuoteModal() {
  document.getElementById('quoteModal').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('quoteForm').reset();
  quoteSelectedCountry = null;
  document.getElementById('qDialCode').textContent = '+__';
  document.getElementById('qPhoneStatus').textContent = '';
  document.getElementById('qPhoneStatus').className = 'phone-status';
  document.getElementById('qCountryList').classList.remove('open');
}

function filterCountries(query) {
  var list = document.getElementById('qCountryList');
  list.innerHTML = '';
  var q = query.toLowerCase().trim();
  if (!q) { quoteCountries.forEach(function(c) { addCountryOption(c); }); list.classList.add('open'); return; }
  var found = false;
  quoteCountries.forEach(function(c) {
    if (c.name.toLowerCase().indexOf(q) !== -1 || c.dial.indexOf(q) !== -1 || c.code.toLowerCase().indexOf(q) !== -1) {
      addCountryOption(c); found = true;
    }
  });
  if (!found) {
    var div = document.createElement('div');
    div.className = 'country-dropdown-item';
    div.style.color = 'rgba(255,255,255,0.3)';
    div.style.cursor = 'default';
    div.textContent = 'No countries found';
    list.appendChild(div);
  }
  list.classList.add('open');
  quoteCountryListVisible = true;
}

function addCountryOption(c) {
  var list = document.getElementById('qCountryList');
  var div = document.createElement('div');
  div.className = 'country-dropdown-item';
  if (quoteSelectedCountry && quoteSelectedCountry.code === c.code) div.classList.add('selected');
  div.setAttribute('data-code', c.code);
  div.innerHTML = '<span class="cd-flag">' + c.flag + '</span><span class="cd-name">' + c.name + '</span><span class="cd-dial">+' + c.dial + '</span>';
  div.onmousedown = function(e) { e.preventDefault(); selectCountry(c.code); };
  list.appendChild(div);
}

function openCountryList() {
  filterCountries('');
}

function closeCountryList() {
  document.getElementById('qCountryList').classList.remove('open');
  quoteCountryListVisible = false;
}

function selectCountry(code) {
  var c = quoteCountries.find(function(x) { return x.code === code; });
  if (!c) return;
  quoteSelectedCountry = c;
  document.getElementById('qPhoneCountry').value = c.code;
  document.getElementById('qDialCode').textContent = '+' + c.dial;
  document.getElementById('qCountry').value = c.name;
  document.getElementById('qCountryList').classList.remove('open');
  // Update phone placeholder with hint
  var hint = c.digits_min === c.digits_max
    ? c.digits_min + ' digits'
    : c.digits_min + '\u2013' + c.digits_max + ' digits';
  document.getElementById('qPhone').placeholder = 'e.g. ' + hint;
  // Re-validate if phone has value
  if (document.getElementById('qPhone').value.trim()) validatePhoneInput();
}

function validatePhoneInput() {
  var input = document.getElementById('qPhone');
  var status = document.getElementById('qPhoneStatus');
  var raw = input.value.replace(/[^0-9]/g, '');
  // Strip leading 0 trunk prefix
  raw = raw.replace(/^0+/, '');
  var count = raw.length;
  if (!count || !quoteSelectedCountry) {
    status.textContent = '';
    status.className = 'phone-status';
    input.style.borderColor = '';
    return;
  }
  var min = quoteSelectedCountry.digits_min;
  var max = quoteSelectedCountry.digits_max;
  if (count < min) {
    status.textContent = 'Too short — needs ' + min + (min === max ? '' : '\u2013' + max) + ' digits';
    status.className = 'phone-status invalid';
    input.style.borderColor = '#ef4444';
  } else if (count > max) {
    status.textContent = 'Too long — needs ' + min + (min === max ? '' : '\u2013' + max) + ' digits';
    status.className = 'phone-status invalid';
    input.style.borderColor = '#ef4444';
  } else {
    status.textContent = '\u2713 Valid';
    status.className = 'phone-status valid';
    input.style.borderColor = '#22c55e';
  }
}

function toggleAreaUnit(btn) {
  document.querySelectorAll('.unit-pill').forEach(function(p) { p.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('qAreaUnit').value = btn.getAttribute('data-unit');
}

/* ========== Reusable country + phone input (contact & trade forms) ========== */
function initCountryPhoneInput(prefix) {
  var el = {};
  el.input = document.getElementById(prefix + 'Country');
  el.list = document.getElementById(prefix + 'CountryList');
  el.hidden = document.getElementById(prefix + 'PhoneCountry');
  el.dial = document.getElementById(prefix + 'DialCode');
  el.phone = document.getElementById(prefix + 'Phone');
  el.status = document.getElementById(prefix + 'PhoneStatus');
  if (!el.input) return null;

  var countries = [];
  try { countries = JSON.parse(document.getElementById('countryData').textContent); } catch(e) {}
  var selected = null;

  function addOption(c) {
    var div = document.createElement('div');
    div.className = 'country-dropdown-item';
    if (selected && selected.code === c.code) div.classList.add('selected');
    div.setAttribute('data-code', c.code);
    div.innerHTML = '<span class="cd-flag">' + c.flag + '</span><span class="cd-name">' + c.name + '</span><span class="cd-dial">+' + c.dial + '</span>';
    div.onmousedown = function(e) { e.preventDefault(); select(c.code); };
    el.list.appendChild(div);
  }

  function filter(query) {
    el.list.innerHTML = '';
    var q = query.toLowerCase().trim();
    if (!q) { countries.forEach(function(c) { addOption(c); }); el.list.classList.add('open'); return; }
    var found = false;
    countries.forEach(function(c) {
      if (c.name.toLowerCase().indexOf(q) !== -1 || c.dial.indexOf(q) !== -1 || c.code.toLowerCase().indexOf(q) !== -1) {
        addOption(c); found = true;
      }
    });
    if (!found) {
      var div = document.createElement('div');
      div.className = 'country-dropdown-item';
      div.style.color = 'rgba(255,255,255,0.3)';
      div.style.cursor = 'default';
      div.textContent = 'No countries found';
      el.list.appendChild(div);
    }
    el.list.classList.add('open');
  }

  function openList() { filter(''); }
  function closeList() { el.list.classList.remove('open'); }

  function select(code) {
    var c = countries.find(function(x) { return x.code === code; });
    if (!c) return;
    selected = c;
    el.hidden.value = c.code;
    el.dial.textContent = '+' + c.dial;
    el.input.value = c.name;
    el.list.classList.remove('open');
    var hint = c.digits_min === c.digits_max
      ? c.digits_min + ' digits'
      : c.digits_min + '\u2013' + c.digits_max + ' digits';
    el.phone.placeholder = 'e.g. ' + hint;
    if (el.phone.value.trim()) validate();
  }

  function validate() {
    var raw = el.phone.value.replace(/[^0-9]/g, '').replace(/^0+/, '');
    var count = raw.length;
    if (!count || !selected) {
      el.status.textContent = '';
      el.status.className = 'phone-status';
      return true;
    }
    var min = selected.digits_min;
    var max = selected.digits_max;
    if (count < min) {
      el.status.textContent = 'Too short \u2014 needs ' + min + (min === max ? '' : '\u2013' + max) + ' digits';
      el.status.className = 'phone-status invalid';
      return false;
    } else if (count > max) {
      el.status.textContent = 'Too long \u2014 needs ' + min + (min === max ? '' : '\u2013' + max) + ' digits';
      el.status.className = 'phone-status invalid';
      return false;
    } else {
      el.status.textContent = '\u2713 Valid';
      el.status.className = 'phone-status valid';
      return true;
    }
  }

  function isValid() {
    if (!selected) return false;
    var raw = el.phone.value.replace(/[^0-9]/g, '').replace(/^0+/, '');
    var count = raw.length;
    if (!count) return false;
    return count >= selected.digits_min && count <= selected.digits_max;
  }

  function getSelected() { return selected; }

  function reset() {
    selected = null;
    el.input.value = '';
    el.hidden.value = '';
    el.dial.textContent = '+__';
    el.phone.value = '';
    el.status.textContent = '';
    el.status.className = 'phone-status';
    el.list.classList.remove('open');
  }

  el.input.addEventListener('input', function() { filter(this.value); });
  el.input.addEventListener('focus', openList);
  el.input.addEventListener('blur', function() { setTimeout(closeList, 200); });
  el.phone.addEventListener('input', validate);

  return { isValid: isValid, getSelected: getSelected, reset: reset, validate: validate };
}

/* ========== Material Library: Search, Sort, Filters ========== */
function toggleMatUnit(unit) {
  localStorage.setItem('material_unit', unit);
  document.querySelectorAll('.mat-unit-btn').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-unit') === unit);
  });
  var isSqf = unit === 'sqf';
  var label = isSqf ? '/ft\u00B2' : '/m\u00B2';
  // Update listing card prices (.mat-price[data-sqm] with child .mat-price-val)
  document.querySelectorAll('.mat-price[data-sqm]').forEach(function(el) {
    var sqm = parseFloat(el.getAttribute('data-sqm'));
    if (isNaN(sqm)) return;
    var val = (isSqf ? (sqm / 10.7639) : sqm).toFixed(2);
    el.querySelectorAll('.mat-price-val').forEach(function(v) { v.textContent = '$' + val; });
    el.querySelectorAll('.mat-price-unit').forEach(function(u) { u.textContent = label; });
    if (el.hasAttribute('data-premium-sqm')) {
      var psqm = parseFloat(el.getAttribute('data-premium-sqm'));
      if (!isNaN(psqm)) {
        var pval = (isSqf ? (psqm / 10.7639) : psqm).toFixed(2);
        el.querySelectorAll('.mat-premium-val').forEach(function(v) { v.textContent = '$' + pval; });
        el.querySelectorAll('.mat-premium-unit').forEach(function(u) { u.textContent = label; });
      }
    }
  });
  // Update detail page prices (.mat-price-val[data-sqm] not inside .mat-price)
  document.querySelectorAll('.mat-price-val[data-sqm]').forEach(function(el) {
    if (el.closest('.mat-price')) return;
    var sqm = parseFloat(el.getAttribute('data-sqm'));
    if (isNaN(sqm)) return;
    el.textContent = '$' + (isSqf ? (sqm / 10.7639) : sqm).toFixed(2);
    var unitEl = el.parentElement ? el.parentElement.querySelector('.mat-price-unit') : null;
    if (unitEl) unitEl.textContent = label;
  });
}

function getActiveFilters(group) {
  var id = 'filter' + group.charAt(0).toUpperCase() + group.slice(1);
  var el = document.getElementById(id);
  return el && el.value !== 'all' ? [el.value] : ['all'];
}

function clearAllFilters() {
  document.getElementById('filterCountry') && (document.getElementById('filterCountry').value = 'all');
  document.getElementById('filterType') && (document.getElementById('filterType').value = 'all');
  document.getElementById('filterTone') && (document.getElementById('filterTone').value = 'all');
  document.getElementById('matSearch') && (document.getElementById('matSearch').value = '');
  document.getElementById('matSort') && (document.getElementById('matSort').value = 'default');
  filterMaterials();
  saveFilterState();
}

function filterMaterials() {
  var q = (document.getElementById('matSearch') ? document.getElementById('matSearch').value : '').toLowerCase().trim();
  var sort = document.getElementById('matSort') ? document.getElementById('matSort').value : 'default';
  var fc = getActiveFilters('country');
  var ft = getActiveFilters('type');
  var fto = getActiveFilters('tone');

  var grid = document.getElementById('matGrid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.mat-card'));

  var visible = cards.filter(function(c) {
    if (q) {
      var name = c.getAttribute('data-name') || '';
      var ci = c.getAttribute('data-ci') || '';
      var cn = c.getAttribute('data-cn') || '';
      var country = c.getAttribute('data-country') || '';
      var type = c.getAttribute('data-type') || '';
      if (name.indexOf(q) === -1 && ci.indexOf(q) === -1 && cn.indexOf(q) === -1 && country.indexOf(q) === -1 && type.indexOf(q) === -1) return false;
    }
    if (fc.indexOf('all') === -1 && fc.indexOf(c.getAttribute('data-country')) === -1) return false;
    if (ft.indexOf('all') === -1 && ft.indexOf(c.getAttribute('data-type')) === -1) return false;
    if (fto.indexOf('all') === -1 && fto.indexOf(c.getAttribute('data-tone')) === -1) return false;
    return true;
  });

  // Sort
  if (sort === 'az') {
    visible.sort(function(a, b) { return (a.getAttribute('data-name') || '').localeCompare(b.getAttribute('data-name') || ''); });
  } else if (sort === 'za') {
    visible.sort(function(a, b) { return (b.getAttribute('data-name') || '').localeCompare(a.getAttribute('data-name') || ''); });
  } else if (sort === 'price-asc') {
    visible.sort(function(a, b) { return parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price')); });
  } else if (sort === 'price-desc') {
    visible.sort(function(a, b) { return parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price')); });
  } else if (sort === 'country') {
    visible.sort(function(a, b) { return (a.getAttribute('data-country') || '').localeCompare(b.getAttribute('data-country') || ''); });
  }

  // Reorder DOM
  cards.forEach(function(c) { c.style.display = 'none'; grid.removeChild(c); });
  visible.forEach(function(c) { c.style.display = ''; grid.appendChild(c); });
  // Append hidden cards back at the end
  cards.forEach(function(c) { if (visible.indexOf(c) === -1) grid.appendChild(c); });

  var count = document.getElementById('matCount');
  if (count) count.textContent = 'Showing ' + visible.length + ' of ' + cards.length + ' stones';
  var empty = document.getElementById('matEmpty');
  if (empty) empty.style.display = visible.length ? 'none' : 'block';
}

/* ========== Filter state persistence ========== */
function saveFilterState() {
  try {
    var state = {
      search: document.getElementById('matSearch') ? document.getElementById('matSearch').value : '',
      sort: document.getElementById('matSort') ? document.getElementById('matSort').value : 'default',
      filters: {}
    };
    ['country','type','tone'].forEach(function(g) {
      var id = 'filter' + g.charAt(0).toUpperCase() + g.slice(1);
      var el = document.getElementById(id);
      if (el) state.filters[g] = [el.value];
    });
    sessionStorage.setItem('mat_filter_state', JSON.stringify(state));
  } catch(e) {}
}

function restoreFilterState() {
  try {
    var raw = sessionStorage.getItem('mat_filter_state');
    if (!raw) return;
    var state = JSON.parse(raw);
    if (state.search && document.getElementById('matSearch')) document.getElementById('matSearch').value = state.search;
    if (state.sort && document.getElementById('matSort')) document.getElementById('matSort').value = state.sort;
    if (state.filters) {
      Object.keys(state.filters).forEach(function(g) {
        var id = 'filter' + g.charAt(0).toUpperCase() + g.slice(1);
        var el = document.getElementById(id);
        var vals = state.filters[g];
        if (el && vals && vals.length) el.value = vals[0];
      });
    }
    filterMaterials();
  } catch(e) {}
}

/* ========== Favorites (localStorage for all, API sync when logged in) ========== */

function favGet() {
  try { return JSON.parse(localStorage.getItem('dija_favorites') || '[]'); } catch(e) { return []; }
}

function favSet(ids) {
  try { localStorage.setItem('dija_favorites', JSON.stringify(ids)); } catch(e) {}
}

function favHas(id) {
  return favGet().indexOf(id) !== -1;
}

function favToggle(id) {
  var ids = favGet();
  var idx = ids.indexOf(id);
  var added = false;
  if (idx !== -1) { ids.splice(idx, 1); } else { ids.push(id); added = true; }
  favSet(ids);
  return added;
}

function isLoggedIn() {
  try {
    var s = JSON.parse(sessionStorage.getItem('dija_client_session') || 'null');
    return s && s.client_id ? true : false;
  } catch(e) { return false; }
}

function toggleFavorite(btn) {
  var stoneId = btn.getAttribute('data-stone-id');
  if (!stoneId) return;
  var added = favToggle(stoneId);
  var icon = btn.querySelector('i');
  icon.className = added ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  btn.classList.toggle('fav-active', added);
  if (icon.className.indexOf('fa-solid') !== -1) {
    icon.style.animation = 'none';
    icon.offsetHeight;
    icon.style.animation = '';
  }
  // Fire-and-forget API sync if logged in
  if (isLoggedIn()) {
    var meta = document.querySelector('meta[name="csrf-token"]');
    var csrfToken = meta ? meta.getAttribute('content') : '';
    fetch('/api/favorite-toggle.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'stone_id=' + encodeURIComponent(stoneId) + '&csrf_token=' + encodeURIComponent(csrfToken)
    }).catch(function() {});
  }
}

function loadFavoriteIcons() {
  var ids = favGet();
  if (!ids.length) return;
  var idSet = {};
  ids.forEach(function(id) { idSet[id] = true; });
  document.querySelectorAll('.mat-fav-btn').forEach(function(btn) {
    if (idSet[btn.getAttribute('data-stone-id')]) {
      btn.querySelector('i').className = 'fa-solid fa-heart';
      btn.classList.add('fav-active');
    }
  });
}

function syncFavoritesFromServer() {
  if (!isLoggedIn()) return Promise.resolve([]);
  return fetch('/api/favorites.php')
  .then(function(r) { return r.json(); })
  .then(function(d) {
    var local = favGet();
    var serverIds = d && d.ids ? d.ids : [];
    // Push local-only favorites to server (handles login merge)
    var meta = document.querySelector('meta[name="csrf-token"]');
    var csrfToken = meta ? meta.getAttribute('content') : '';
    local.forEach(function(id) {
      if (serverIds.indexOf(id) === -1) {
        fetch('/api/favorite-toggle.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'stone_id=' + encodeURIComponent(id) + '&csrf_token=' + encodeURIComponent(csrfToken)
        }).catch(function() {});
      }
    });
    // Merge server-only favorites into local
    serverIds.forEach(function(sid) {
      if (local.indexOf(sid) === -1) local.push(sid);
    });
    favSet(local);
    loadFavoriteIcons();
  })
  .catch(function() {});
}

// Init on DOM ready
(function() {
  var savedUnit = localStorage.getItem('material_unit');
  if (savedUnit && (savedUnit === 'sqm' || savedUnit === 'sqf')) {
    toggleMatUnit(savedUnit);
  }
  restoreFilterState();
  // Auto-open mobile filter groups that have active chips
  document.querySelectorAll('.filter-group').forEach(function(g) {
    if (g.querySelector('.chip.active:not([data-value="all"])')) g.classList.add('open');
  });
  syncFavoritesFromServer().then(function() { loadFavoriteIcons(); }).catch(function() { loadFavoriteIcons(); });
  // Stagger animation on initial load
  var grid = document.getElementById('matGrid');
  if (grid) {
    var visible = grid.querySelectorAll('.mat-card:not([style*="display: none"])');
    visible.forEach(function(c, i) {
      if (i < 24) c.style.animationDelay = (i * 0.06) + 's';
      c.classList.add('stagger-fade');
    });
  }
})();

function submitQuoteForm() {
  var btn = document.getElementById('qSubmitBtn');
  var msg = document.getElementById('qFormMsg');
  msg.textContent = '';
  msg.className = 'qf-msg';

  // Validate phone before submit
  if (quoteSelectedCountry) {
    var raw = document.getElementById('qPhone').value.replace(/[^0-9]/g, '').replace(/^0+/, '');
    var count = raw.length;
    if (count < quoteSelectedCountry.digits_min || count > quoteSelectedCountry.digits_max) {
      msg.textContent = 'Please fix the phone number before submitting.';
      msg.className = 'qf-msg error';
      return;
    }
  } else {
    msg.textContent = 'Please select your country before submitting.';
    msg.className = 'qf-msg error';
    return;
  }

  var fd = new FormData(document.getElementById('quoteForm'));
  btn.classList.add('loading');

  fetch('/api/request-quote.php', { method: 'POST', body: fd })
    .then(function(r) { return r.text().then(function(t) { return { ok: r.ok, text: t }; }); })
    .then(function(res) {
      btn.classList.remove('loading');
      if (res.ok) {
        msg.textContent = res.text;
        msg.className = 'qf-msg success';
        document.getElementById('quoteForm').reset();
        quoteSelectedCountry = null;
        document.getElementById('qDialCode').textContent = '+__';
        document.getElementById('qPhoneStatus').textContent = '';
        document.getElementById('qPhoneStatus').className = 'phone-status';
        document.getElementById('qArea').value = '';
        var defaultUnit = document.querySelector('.unit-pill[data-unit="m²"]');
        if (defaultUnit) { document.querySelectorAll('.unit-pill').forEach(function(p) { p.classList.remove('active'); }); defaultUnit.classList.add('active'); document.getElementById('qAreaUnit').value = 'm²'; }
      } else {
        msg.textContent = res.text || 'Something went wrong. Please try again.';
        msg.className = 'qf-msg error';
      }
    })
    .catch(function() {
      btn.classList.remove('loading');
      msg.textContent = 'Connection error. Please try again or email us at info@dijastones.com.';
      msg.className = 'qf-msg error';
    });
}
