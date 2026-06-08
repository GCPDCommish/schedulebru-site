/* scheduleBru marketing site — interactions + tweak application */
(function () {
  'use strict';

  /* ── reveal on scroll ── */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 3, 2) * 90) + 'ms';
      io.observe(el);
    });
  }

  /* ── waitlist form → Kit (ConvertKit) ── */
  function initForm() {
    var form = document.getElementById('waitlist-form');
    var ok = document.getElementById('form-ok');
    var err = document.getElementById('form-err');
    if (!form) return;
    var btn = form.querySelector('button[type="submit"]');
    var emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('waitlist-email');
      if (err) err.classList.remove('show');
      email.style.borderColor = '';

      if (!email.value || !emailRe.test(email.value.trim())) {
        email.focus();
        email.style.borderColor = 'var(--flame)';
        return;
      }

      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Joining…';

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new URLSearchParams({ email_address: email.value.trim() })
      }).then(function (r) {
        if (!r.ok) throw new Error('status ' + r.status);
        return r.json().catch(function () { return {}; });
      }).then(function () {
        form.classList.add('done');
        if (ok) ok.classList.add('show');
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = label;
        if (err) err.classList.add('show');
        else email.style.borderColor = 'var(--flame)';
      });
    });
  }

  /* ── apply tweaks (called by tweaks panel) ── */
  var ACCENT_HOVER = {
    '#4f8cff': '#3f7ded',
    '#ff5722': '#e8491e',
    '#1f9e8a': '#178575',
    '#7a5ce0': '#674bc4'
  };

  window.applySiteTweaks = function (t) {
    var root = document.documentElement;
    var body = document.body;
    // accent
    var acc = t.accent || '#4f8cff';
    root.style.setProperty('--accent', acc);
    root.style.setProperty('--accent-hover', ACCENT_HOVER[acc] || acc);
    // theme mode
    body.setAttribute('data-theme-mode', t.themeMode || 'mixed');
    // hero direction
    var hero = document.querySelector('.hero');
    if (hero) hero.setAttribute('data-dir', t.heroDir || 'A');
    // product mockup
    body.setAttribute('data-mockup', t.showMockup ? 'on' : 'off');
    // headline
    var hl = document.getElementById('hero-headline');
    if (hl && typeof t.headline === 'string') {
      var txt = t.headline.trim();
      var idx = txt.lastIndexOf(' ');
      if (idx > 0 && txt.length > 18) {
        hl.innerHTML = escapeHtml(txt.slice(0, idx)) + ' <span class="grad">' + escapeHtml(txt.slice(idx + 1)) + '</span>';
      } else {
        hl.textContent = txt;
      }
    }
  };

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initForm();
  });
})();
