/* Client authentication */
var clientSession = null;
var GOOGLE_CLIENT_ID = '847212399661-breqtfvmgaf7571rmmfebkrq257slol3.apps.googleusercontent.com';

function checkClientSession() {
  try {
    var raw = sessionStorage.getItem('dija_client_session');
    if (raw) {
      clientSession = JSON.parse(raw);
    } else if (window.__CLIENT_SESSION__ && window.__CLIENT_SESSION__.client_id) {
      clientSession = window.__CLIENT_SESSION__;
      sessionStorage.setItem('dija_client_session', JSON.stringify(clientSession));
    }
  } catch(e) { clientSession = null; }
  updateNavAuth();
}

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function userDisplayName() {
  if (!clientSession) return '';
  return clientSession.name || (clientSession.email ? clientSession.email.split('@')[0] : 'User');
}

function updateNavAuth() {
  document.querySelectorAll('.nav-auth-link').forEach(function(el) {
    var mobile = el.closest('.mobile-nav');
    if (clientSession && clientSession.id) {
      var name = escapeHtml(userDisplayName());
      var email = escapeHtml(clientSession.email || '');
      if (mobile) {
        el.innerHTML =
          '<div class="mobile-user-section">' +
            '<div class="mobile-user-header">' +
              '<div class="mobile-user-avatar"><i class="fa-solid fa-user"></i></div>' +
              '<div class="mobile-user-info">' +
                '<strong>' + name + '</strong>' +
                '<span>' + email + '</span>' +
              '</div>' +
            '</div>' +
            '<a href="/?page=client-proformas" class="mobile-user-link" onclick="closeMobileNav()"><i class="fa-solid fa-file-invoice"></i> My Proformas</a>' +
            '<a href="/?page=client-dashboard" class="mobile-user-link" onclick="closeMobileNav()"><i class="fa-solid fa-user-gear"></i> My Account</a>' +
            '<a href="#" class="mobile-user-link mobile-user-logout" onclick="logout();return false;"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</a>' +
          '</div>';
      } else {
        el.innerHTML =
          '<div class="user-dropdown">' +
            '<button class="user-dropdown-trigger" onclick="toggleUserDropdown(this)" aria-haspopup="true" aria-expanded="false">' +
              '<i class="fa-solid fa-user-circle"></i> ' + name + ' <i class="fa-solid fa-chevron-down"></i>' +
            '</button>' +
            '<div class="user-dropdown-menu" role="menu">' +
              '<div class="user-dropdown-header">' +
                '<strong>' + name + '</strong>' +
                '<span>' + email + '</span>' +
              '</div>' +
              '<a href="/?page=client-proformas" class="user-dropdown-item" role="menuitem"><i class="fa-solid fa-file-invoice"></i> My Proformas</a>' +
              '<a href="/?page=client-dashboard" class="user-dropdown-item" role="menuitem"><i class="fa-solid fa-user-gear"></i> My Account</a>' +
              '<div class="user-dropdown-divider"></div>' +
              '<a href="#" class="user-dropdown-item user-dropdown-logout" role="menuitem" onclick="logout();return false;"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</a>' +
            '</div>' +
          '</div>';
      }
    } else {
      var closeAttr = mobile ? ' onclick="closeMobileNav()"' : '';
      el.innerHTML = '<a href="/?page=login"' + closeAttr + '><i class="fa-solid fa-sign-in-alt"></i> Sign In</a>';
    }
  });
}

function toggleUserDropdown(btn) {
  var dd = btn.parentNode.querySelector('.user-dropdown-menu');
  if (!dd) return;
  var isOpen = dd.classList.contains('open');
  closeAllUserDropdowns();
  if (!isOpen) {
    dd.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', userDropdownOutsideClick);
    document.addEventListener('keydown', userDropdownEscKey);
  }
}

function closeAllUserDropdowns() {
  document.querySelectorAll('.user-dropdown-menu.open').forEach(function(m) {
    m.classList.remove('open');
    var btn = m.closest('.user-dropdown').querySelector('.user-dropdown-trigger');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
  document.removeEventListener('click', userDropdownOutsideClick);
  document.removeEventListener('keydown', userDropdownEscKey);
}

function userDropdownOutsideClick(e) {
  if (!e.target.closest('.user-dropdown')) closeAllUserDropdowns();
}

function userDropdownEscKey(e) {
  if (e.key === 'Escape') closeAllUserDropdowns();
}

/* ── UI helpers ── */
var authState = { submitting: false };

function setMsg(text, type) {
  var el = document.getElementById('auth-msg');
  if (!el) return;
  el.textContent = text;
  el.className = 'auth-msg' + (type ? ' ' + type : '');
  el.style.display = text ? 'block' : 'none';
}

function showStep(n, email, mode) {
  var s1 = document.getElementById('auth-step-1');
  var s2 = document.getElementById('auth-step-2');
  if (n === 2) {
    s1.style.display = 'none';
    s2.style.display = 'block';
    document.getElementById('auth-email-display').textContent = email || '';
    var ci = document.getElementById('auth-code');
    ci.dataset.mode = mode || '';
    ci.dataset.email = email || '';
    ci.value = '';
    setMsg('');
    ci.focus();
    startResendTimer(30);
  } else {
    s2.style.display = 'none';
    s1.style.display = 'block';
    setMsg('');
  }
}

function togglePw(btn) {
  var id = btn.getAttribute('data-for');
  if (!id) return;
  var input = document.getElementById(id);
  if (!input) return;
  var isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
  btn.innerHTML = isPw ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
}

function initGoogleSignIn() {
  if (window._gsInited) return;
  if (typeof google === 'undefined' || !google.accounts) {
    if (!window._gsRetry) window._gsRetry = 0;
    window._gsRetry++;
    if (window._gsRetry < 20) { setTimeout(initGoogleSignIn, 200); }
    return;
  }
  window._gsInited = true;
  window._gsRetry = 0;
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
  });
  var el = document.getElementById('google-signin-wrap');
  if (el) google.accounts.id.renderButton(el, {
    type: 'standard', shape: 'pill', theme: 'outline',
    text: 'sign_in_with', size: 'large',
  });
}

function handleGoogleCredential(res) {
  if (!res || !res.credential) return;
  setMsg('Signing in with Google…');
  apiPost('api/auth-google.php', { credential: res.credential })
    .then(function(d) {
      if (d.ok) {
        clientSession = d.client;
        sessionStorage.setItem('dija_client_session', JSON.stringify(d.client));
        setMsg('Signed in! Redirecting…', 'success');
        setTimeout(function() { location.href = '/?page=client-dashboard'; }, 600);
      } else {
        setMsg(d.error || 'Google sign in failed.', 'error');
      }
    })
    .catch(function() { setMsg('Connection error.', 'error'); });
}

function switchTab(tab) {
  ['signin','register'].forEach(function(t) {
    var f = document.getElementById('auth-' + t + '-form');
    var b = document.getElementById('auth-tab-' + t);
    if (f) f.style.display = (t === tab) ? 'block' : 'none';
    if (b) b.className = 'auth-tab' + (t === tab ? ' active' : '');
  });
}

/* ── Auth API helpers ── */
function apiPost(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(function(r) { return r.json(); });
}

function disableBtn(id, text) {
  var b = document.getElementById(id);
  if (!b) return;
  b.disabled = true;
  b.classList.add('loading');
  if (text) b.setAttribute('data-label', b.textContent);
}
function enableBtn(id, text) {
  var b = document.getElementById(id);
  if (!b) return;
  b.disabled = false;
  b.classList.remove('loading');
  if (text) b.textContent = text;
}

function startResendTimer(seconds) {
  var link = document.getElementById('auth-resend-link');
  var timer = document.getElementById('auth-resend-timer');
  if (!link || !timer) return;
  link.style.display = 'none';
  var remaining = seconds || 30;
  timer.textContent = 'Resend code in ' + remaining + 's';
  var interval = setInterval(function() {
    remaining--;
    if (remaining <= 0) {
      clearInterval(interval);
      timer.textContent = '';
      link.style.display = 'inline';
    } else {
      timer.textContent = 'Resend code in ' + remaining + 's';
    }
  }, 1000);
}

/* ── Main auth flow ── */
function authFlow() {
  if (!document.getElementById('auth-step-1')) return; // not on login page

  // Tab switching
  document.getElementById('auth-tab-signin').addEventListener('click', function() { switchTab('signin'); });
  document.getElementById('auth-tab-register').addEventListener('click', function() { switchTab('register'); });
  var sw = document.getElementById('auth-switch-to-signin');
  if (sw) sw.addEventListener('click', function(e) { e.preventDefault(); switchTab('signin'); });

  // Password toggle
  document.querySelectorAll('.auth-pw-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() { togglePw(this); });
  });

  // Google Sign-In
  initGoogleSignIn();

  // Code fallback
  var fb = document.getElementById('auth-code-fallback');
  if (fb) fb.addEventListener('click', function(e) {
    e.preventDefault();
    if (authState.submitting) return;
    var email = (document.getElementById('auth-email') || {}).value;
    if (!email || !email.indexOf('@')) { setMsg('Enter your email first.', 'error'); return; }
    authState.submitting = true;
    disableBtn('auth-code-fallback', 'Sending...');
    setMsg('');
    apiPost('api/auth-send-code.php', { email: email, code_only: true })
      .then(function(d) {
        if (d.ok) { showStep(2, email, 'verify_existing'); }
        else { setMsg(d.error || 'Failed to send code.', 'error'); }
      })
      .catch(function() { setMsg('Connection error.', 'error'); })
      .finally(function() { authState.submitting = false; enableBtn('auth-code-fallback', 'Send me a code to sign in instead'); });
  });

  // Sign In
  var si = document.getElementById('auth-signin-btn');
  if (si) si.addEventListener('click', function() {
    if (authState.submitting) return;
    var email = (document.getElementById('auth-email') || {}).value;
    var pass = (document.getElementById('auth-password') || {}).value;
    if (!email || email.indexOf('@') < 0) { setMsg('Enter a valid email.', 'error'); return; }
    if (!pass || pass.length < 4) { setMsg('Enter your password.', 'error'); return; }
    authState.submitting = true;
    disableBtn('auth-signin-btn', 'Signing in…');
    setMsg('');
    apiPost('api/auth-login.php', { email: email, password: pass })
      .then(function(d) {
        if (d.ok) {
          clientSession = d.client;
          sessionStorage.setItem('dija_client_session', JSON.stringify(d.client));
          setMsg('Signed in! Redirecting…', 'success');
          setTimeout(function() { location.href = '/?page=client-dashboard'; }, 600);
        } else if (d.needs_verification) {
          showStep(2, email, 'verify_existing');
        } else {
          setMsg(d.error || 'Sign in failed.', 'error');
        }
      })
      .catch(function() { setMsg('Connection error.', 'error'); })
      .finally(function() { authState.submitting = false; enableBtn('auth-signin-btn', 'Sign In'); });
  });

  // Enter key submits sign-in
  var siPw = document.getElementById('auth-password');
  var siEm = document.getElementById('auth-email');
  [siPw, siEm].forEach(function(f) { if (f) f.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('auth-signin-btn').click(); } }); });

  // Enter key submits register
  var rgPw = document.getElementById('auth-reg-password');
  var rgEm = document.getElementById('auth-reg-email');
  [rgPw, rgEm].forEach(function(f) { if (f) f.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('auth-register-btn').click(); } }); });

  // Create Account
  var rg = document.getElementById('auth-register-btn');
  if (rg) rg.addEventListener('click', function() {
    if (authState.submitting) return;
    var email = (document.getElementById('auth-reg-email') || {}).value;
    var pass = (document.getElementById('auth-reg-password') || {}).value;
    var name = (document.getElementById('auth-reg-name') || {}).value;
    if (!email || email.indexOf('@') < 0) { setMsg('Enter a valid email.', 'error'); return; }
    if (!pass || pass.length < 4) { setMsg('Password must be at least 4 characters.', 'error'); return; }
    authState.submitting = true;
    disableBtn('auth-register-btn', 'Creating account…');
    setMsg('');
    apiPost('api/auth-register.php', { email: email, password: pass, name: name })
      .then(function(d) {
        if (d.ok) { showStep(2, email, 'register'); }
        else { setMsg(d.error || 'Registration failed.', 'error'); }
      })
      .catch(function() { setMsg('Connection error.', 'error'); })
      .finally(function() { authState.submitting = false; enableBtn('auth-register-btn', 'Create Account'); });
  });

  // Verify
  var ci = document.getElementById('auth-code');
  var vb = document.getElementById('auth-verify-btn');
  if (ci) {
    ci.addEventListener('input', function() {
      if (this.value.replace(/\D/g, '').length === 6) doVerify();
    });
    ci.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); doVerify(); }
    });
  }
  if (vb) vb.addEventListener('click', doVerify);

  function doVerify() {
    if (authState.submitting) return;
    var ci = document.getElementById('auth-code');
    var email = ci.dataset.email || (document.getElementById('auth-email-display') || {}).textContent || '';
    var code = (ci.value || '').replace(/\D/g, '');
    if (code.length !== 6) { setMsg('Enter the full 6-digit code.', 'error'); return; }
    authState.submitting = true;
    disableBtn('auth-verify-btn');
    setMsg('');
    apiPost('api/auth-verify.php', { email: email, code: code })
      .then(function(d) {
        if (d.ok) {
          clientSession = d.client;
          sessionStorage.setItem('dija_client_session', JSON.stringify(d.client));
          setMsg('Verified! Redirecting…', 'success');
          setTimeout(function() { location.href = '/?page=client-dashboard'; }, 600);
        } else {
          setMsg(d.error || 'Invalid code.', 'error');
        }
      })
      .catch(function() { setMsg('Connection error.', 'error'); })
      .finally(function() { authState.submitting = false; enableBtn('auth-verify-btn', 'Verify'); });
  }

  // Resend code
  var rl = document.getElementById('auth-resend-link');
  if (rl) rl.addEventListener('click', function(e) {
    e.preventDefault();
    if (authState.submitting) return;
    var ci2 = document.getElementById('auth-code');
    var email2 = ci2.dataset.email || (document.getElementById('auth-email-display') || {}).textContent || '';
    if (!email2) { setMsg('No email to resend to.', 'error'); return; }
    authState.submitting = true;
    setMsg('');
    apiPost('api/auth-send-code.php', { email: email2 })
      .then(function(d) {
        if (d.ok) {
          setMsg('Code resent!', 'success');
          startResendTimer(30);
        } else {
          setMsg(d.error || 'Failed to resend.', 'error');
        }
      })
      .catch(function() { setMsg('Connection error.', 'error'); })
      .finally(function() { authState.submitting = false; });
  });

  // Back to step 1
  var bb = document.getElementById('auth-back-btn');
  if (bb) bb.addEventListener('click', function(e) { e.preventDefault(); showStep(1); });
}

/* ── Logout ── */
function logout() {
  fetch('api/auth-logout.php', { method: 'POST' })
    .then(function() {
      clientSession = null;
      sessionStorage.removeItem('dija_client_session');
      location.href = '/';
    });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', function() {
  checkClientSession();
  authFlow();
  var lo = document.getElementById('auth-logout-btn');
  if (lo) lo.addEventListener('click', function(e) { e.preventDefault(); logout(); });
});
