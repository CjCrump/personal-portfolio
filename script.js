/* ============================================================
   Chance IT Studio — script.js  (radial hamster wheel)
   ============================================================ */
(function () {
  'use strict';

  var NAMES   = ['Home', 'About', 'Work', 'Services', 'Process', 'Contact'];
  var ACCENTS = ['--green', '--cyan', '--orange', '--lime', '--magenta', '--green'];
  var N = NAMES.length, STEP = Math.PI * 2 / N, VIS = 1.40;

  var root   = document.documentElement;
  var stage  = document.getElementById('stage');
  var tiles  = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  var deck   = document.getElementById('deck');
  var runner = document.getElementById('runner');
  var legF = document.getElementById('legF'), legB = document.getElementById('legB'), arm = document.getElementById('arm');
  var rwBtn = document.getElementById('rw'), ffBtn = document.getElementById('ff');
  var dotsWrap = document.getElementById('navDots'), label = document.getElementById('navLabel');
  var hint = document.getElementById('hint');
  var glow = document.querySelector('.acc-glow');

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header dots */
  var dots = NAMES.map(function (nm, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', nm);
    b.addEventListener('click', function () { setTarget(i); });
    dotsWrap.appendChild(b);
    return b;
  });

  /* ---------- geometry ---------- */
  var W, H, cx, cy, R, apexY, avatarY;
  function geo() {
    W = stage.clientWidth; H = stage.clientHeight;
    cx = W / 2;
    avatarY = H - Math.max(64, H * 0.10);
    var top = 16, bot = avatarY - 46;
    apexY = (top + bot) / 2;
    var zoneH = Math.max(220, bot - top);
    root.style.setProperty('--zoneh', zoneH + 'px');
    R = Math.max(H * 0.72, W * 0.52);
    cy = apexY + R;
    deck.style.left = cx + 'px'; deck.style.top = avatarY + 'px';

    var headerPx = parseFloat(getComputedStyle(root).getPropertyValue('--header')) || 54;
    if (glow) { glow.style.left = cx + 'px'; glow.style.top = (headerPx + (bot + avatarY) / 2) + 'px'; }
  }

  /* ---------- state ---------- */
  var rot = 0, vel = 0, mode = 'rest', target = 0, hold = 0, dir = 1, phase = 0, lastActive = -1;

  function norm(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }
  function clampv(v) { return Math.max(-0.5, Math.min(0.5, v)); }

  function activeIndex() {
    var best = 0, bd = 99;
    for (var i = 0; i < N; i++) { var d = Math.abs(norm(rot + i * STEP)); if (d < bd) { bd = d; best = i; } }
    return best;
  }
  function rotForIndex(i) {
    var want = -i * STEP;
    while (want - rot > Math.PI) want -= Math.PI * 2;
    while (want - rot < -Math.PI) want += Math.PI * 2;
    return want;
  }
  function setTarget(i) { target = rotForIndex(i); mode = 'snap'; }
  function stepN(d) { setTarget(activeIndex() + d); }

  /* ---------- theming + header ---------- */
  function applyAccent(i) {
    var v = getComputedStyle(root).getPropertyValue(ACCENTS[i]).trim();
    if (v) root.style.setProperty('--acc', v);
  }
  function onActive(i) {
    label.textContent = NAMES[i];
    applyAccent(i);
    for (var k = 0; k < N; k++) dots[k].classList.toggle('on', k === i);
  }

  function face(forward) { if (forward) dir = 1; else dir = -1; }

  /* ---------- placement ---------- */
  function place() {
    var act = activeIndex();
    for (var i = 0; i < N; i++) {
      var th = norm(rot + i * STEP), el = tiles[i];
      var p = Math.abs(th) / VIS;
      if (p >= 1) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; el.style.visibility = 'hidden'; continue; }
      el.style.visibility = 'visible';
      var fade = 1 - p * p;
      var x = cx + R * Math.sin(th);
      var y = apexY + R * (1 - Math.cos(th));
      var sc = 0.5 + 0.5 * fade;
      el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.opacity = fade.toFixed(3);
      el.style.transform = 'translate(-50%,-50%) scale(' + sc.toFixed(3) + ')';
      el.style.zIndex = String(10 + Math.round(fade * 40));
      el.style.pointerEvents = (i === act && Math.abs(th) < STEP * 0.5) ? 'auto' : 'none';
    }
    if (act !== lastActive) { lastActive = act; onActive(act); }
  }

  /* ---------- runner ---------- */
  function runAnim(speed) {
    if (speed > 0.004 && !reduce) {
      phase += Math.min(speed, 0.6) * 8;
      var sw = Math.sin(phase) * 32;
      legF.style.transform = 'rotate(' + sw + 'deg)';
      legB.style.transform = 'rotate(' + (-sw) + 'deg)';
      arm.style.transform  = 'rotate(' + (-sw * 0.7) + 'deg)';
    } else {
      legF.style.transform = 'rotate(8deg)'; legB.style.transform = 'rotate(-8deg)'; arm.style.transform = 'rotate(0deg)';
    }
    runner.style.transform = 'scaleX(' + dir + ')';
  }

  /* ---------- loop ---------- */
  function frame() {
    var speed = 0;
    if (mode === 'drag') {
      speed = Math.abs(vel);
    } else if (mode === 'hold') {
      vel = clampv(vel + hold * (reduce ? 0.012 : 0.008));
      rot += vel; speed = Math.abs(vel); if (Math.abs(vel) > 0.0008) face(vel < 0);
    } else if (mode === 'free') {
      rot += vel; vel *= (reduce ? 0.8 : 0.92); speed = Math.abs(vel);
      if (Math.abs(vel) > 0.0008) face(vel < 0);
      if (speed < 0.0016) { target = rotForIndex(activeIndex()); mode = 'snap'; }
    } else if (mode === 'snap') {
      var dd = (target - rot) * (reduce ? 0.4 : 0.16);
      rot += dd; speed = Math.abs(dd) * 4; if (Math.abs(dd) > 0.0008) face(dd < 0);
      if (Math.abs(target - rot) < 0.0005) { rot = target; vel = 0; speed = 0; mode = 'rest'; }
    }
    runAnim(speed);
    place();
    requestAnimationFrame(frame);
  }

  /* ---------- pointer: drag / swipe ---------- */
  var K = 0.0042;
  var downX = 0, downY = 0, lastX = 0, downT = 0, axis = 0, dragging = false, captured = false, pid = null, justDragged = false, moved = 0;

  function blocked(t) { return t.closest('input,textarea,select,button'); }

  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (blocked(e.target)) return;
    downX = lastX = e.clientX; downY = e.clientY; downT = Date.now();
    axis = 0; dragging = true; captured = false; pid = e.pointerId; moved = 0; vel = 0;
  });

  stage.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var mx = e.clientX - downX, my = e.clientY - downY;
    if (axis === 0) {
      if (Math.abs(mx) > 6 || Math.abs(my) > 6) axis = (Math.abs(mx) > Math.abs(my)) ? 1 : -1; else return;
      if (axis === -1) {                                  // vertical
        var act = tiles[activeIndex()];
        if (act && act.scrollHeight > act.clientHeight + 2) { dragging = false; return; } // let the card scroll
        dragging = false; return;
      }
    }
    if (axis !== 1) return;
    if (!captured) { try { stage.setPointerCapture(pid); } catch (_) {} captured = true; mode = 'drag'; }
    e.preventDefault();
    var dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
    var dd = dx * K; rot += dd; vel = dd; if (Math.abs(dd) > 0.0008) face(dd < 0);
  });

  function release(e) {
    if (!dragging) return;
    dragging = false;
    if (captured) { try { stage.releasePointerCapture(pid); } catch (_) {} captured = false; }
    if (axis === 1) {
      mode = 'free';
      if (moved > 6) { justDragged = true; setTimeout(function () { justDragged = false; }, 60); }
    }
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('click', function (e) { if (justDragged) { e.preventDefault(); e.stopPropagation(); } }, true);

  /* ---------- wheel / trackpad ---------- */
  var lastWheel = 0;
  stage.addEventListener('wheel', function (e) {
    var now = Date.now(), horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (!horiz) {
      var act = tiles[activeIndex()];
      if (act && act.scrollHeight > act.clientHeight + 2) return;   // let the card scroll
    }
    var d = horiz ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 8) return;
    e.preventDefault();
    if (now - lastWheel > 300) { stepN(d > 0 ? 1 : -1); lastWheel = now; }
  }, { passive: false });

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', function (e) {
    var a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); stepN(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); stepN(-1); }
    else if (e.key === 'Home') { e.preventDefault(); setTarget(0); }
    else if (e.key === 'End') { e.preventDefault(); setTarget(N - 1); }
  });

  /* ---------- rewind / fast-forward (tap = step, hold = spin) ---------- */
  function bindHold(btn, d) {
    var t = null;
    function down(e) {
      e.preventDefault(); btn.classList.add('live');
      stepN(d);
      t = setTimeout(function () { hold = -d; mode = 'hold'; }, 280);
      try { btn.setPointerCapture(e.pointerId); } catch (_) {}
    }
    function up() {
      btn.classList.remove('live');
      if (t) { clearTimeout(t); t = null; }
      if (mode === 'hold') { hold = 0; mode = 'free'; }
    }
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('pointercancel', up);
  }
  bindHold(ffBtn, 1);
  bindHold(rwBtn, -1);

  /* ---------- data-go links ---------- */
  document.querySelectorAll('[data-go]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); setTarget(parseInt(el.dataset.go, 10)); });
  });

  /* ---------- hide hint after first move ---------- */
  ['pointerdown', 'keydown', 'wheel'].forEach(function (ev) {
    window.addEventListener(ev, function once() { if (hint) hint.style.opacity = '0'; window.removeEventListener(ev, once); }, { passive: true });
  });

  /* ---------- resize ---------- */
  window.addEventListener('resize', geo);
  window.addEventListener('orientationchange', geo);
  window.addEventListener('hashchange', function () {
    var idx = NAMES.findIndex(function (nm) { return '#' + nm.toLowerCase() === location.hash.toLowerCase(); });
    if (idx >= 0) setTarget(idx);
  });
  if (window.visualViewport) visualViewport.addEventListener('resize', geo);

  /* ============================================================
     CONTACT FORM — Web3Forms + spam protection
     ============================================================ */
  var form = document.getElementById('cform');
  if (form) {
    var status = document.getElementById('fstatus'), btn = document.getElementById('fsubmit'), loadTime = Date.now();
    function getLog() { try { return JSON.parse(sessionStorage.getItem('_cit_sl') || '[]'); } catch (_) { return []; } }
    function rec() { var l = getLog(); l.push(Date.now()); sessionStorage.setItem('_cit_sl', JSON.stringify(l.slice(-5))); }
    function tooMany() { return getLog().filter(function (t) { return Date.now() - t < 36e5; }).length >= 3; }
    function st(m, err) { status.textContent = m; status.style.color = err ? 'var(--orange)' : 'var(--acc)'; status.style.opacity = '1'; if (!err) setTimeout(function () { status.style.opacity = '0'; }, 6000); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('[name="botcheck"]').checked) return;
      if (Date.now() - loadTime < 3000) return;
      if (tooMany()) { st('✕ Too many submissions. Try again later.', true); return; }
      var name = form.querySelector('[name="name"]').value.trim(),
          email = form.querySelector('[name="email"]').value.trim(),
          msg = form.querySelector('[name="message"]').value.trim();
      if (!name || !email || !msg) { st('✕ Please fill in all fields.', true); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { st('✕ Check your email address.', true); return; }
      if (msg.length < 20) { st('✕ Tell me a bit more about your project.', true); return; }
      btn.disabled = true; btn.textContent = 'Sending…';
      var data = new FormData(form); data.set('name', name); data.set('email', email); data.set('message', msg);
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (j.success) { rec(); st("✓ Sent. I'll be in touch soon.", false); form.reset(); } else { st('✕ Something went wrong. Try again.', true); } })
        .catch(function () { st('✕ Network error. Check your connection.', true); })
        .finally(function () { btn.disabled = false; btn.textContent = 'Send it →'; });
    });
  }

  /* ---------- init ---------- */
  geo();
  (function initFromHash() {
    var idx = NAMES.findIndex(function (nm) { return '#' + nm.toLowerCase() === location.hash.toLowerCase(); });
    if (idx > 0) { rot = target = rotForIndex(idx); onActive(idx); }
    else { onActive(0); }
  })();
  place();
  requestAnimationFrame(frame);
})();