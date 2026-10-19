/* Royal Renovators Inc. — Queens pages (queens.html, queens-about-us.html,
   queens-contact-us.html)

   The header, mega menus, mobile drawer, hero estimate form (.js-form) and
   back-to-top come from js/nyc6.js, which every Queens page loads first.
   This file only drives the Queens body sections (q- classes). */
(function () {
  'use strict';
  var PHONE = '(718) 414-6067';

  /* ---------- Projects slider ---------- */
  (function () {
    var track = document.querySelector('[data-projects-track]');
    var prev = document.querySelector('[data-projects-prev]');
    var next = document.querySelector('[data-projects-next]');
    if (!track || !prev || !next) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var anim = null, settle = null;

    function step() {
      var card = track.firstElementChild;
      if (!card) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }
    function sync() {
      var max = track.scrollWidth - track.clientWidth;
      var x = track.scrollLeft;
      /* 1px of slack keeps the ends reliable on fractional layouts. */
      prev.disabled = x <= 1;
      next.disabled = x >= max - 1;
    }
    /* Native smooth scrolling is unreliable on nested scrollers in some
       browsers, so the tween is done here and the end state is always exact. */
    function glide(to) {
      var max = track.scrollWidth - track.clientWidth;
      var target = Math.max(0, Math.min(to, max));
      if (anim) { cancelAnimationFrame(anim); anim = null; }
      if (reduce.matches) { track.scrollLeft = target; sync(); return; }
      var from = track.scrollLeft;
      var delta = target - from;
      if (!delta) { sync(); return; }
      var t0 = performance.now(), dur = 420;
      (function frame(now) {
        var p = Math.min((now - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
        track.scrollLeft = from + delta * e;
        sync();
        if (p < 1) anim = requestAnimationFrame(frame); else anim = null;
      })(t0);
      /* Animation frames pause while a tab is hidden, so the end position is
         committed on a timer too. */
      window.clearTimeout(settle);
      settle = window.setTimeout(function () {
        if (anim) { cancelAnimationFrame(anim); anim = null; }
        track.scrollLeft = target;
        sync();
      }, dur + 90);
    }
    prev.addEventListener('click', function () { glide(track.scrollLeft - step()); });
    next.addEventListener('click', function () { glide(track.scrollLeft + step()); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    track.addEventListener('focusin', function () { window.setTimeout(sync, 60); });
    sync();
  })();

  /* ---------- Placeholder links (pages not built yet) ---------- */
  document.querySelectorAll('a[href="#"][data-href]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* ---------- Queens estimate forms: inline validation + notice ----------
     All fields required: name, phone, address, email (where the form has
     one), and message. */
  function setError(field, msg) {
    var wrap = field.closest('.q-field'); if (!wrap) return;
    var err = wrap.querySelector('.q-field-error');
    if (!err) { err = document.createElement('span'); err.className = 'q-field-error'; err.setAttribute('role', 'alert'); wrap.appendChild(err); }
    err.textContent = msg; wrap.classList.add('q-has-error'); field.setAttribute('aria-invalid', 'true');
  }
  function clearError(field) {
    var wrap = field.closest('.q-field'); if (!wrap) return;
    var err = wrap.querySelector('.q-field-error'); if (err) err.remove();
    wrap.classList.remove('q-has-error'); field.removeAttribute('aria-invalid');
  }
  document.querySelectorAll('form.q-quote-card').forEach(function (form) {
    form.querySelectorAll('input,textarea').forEach(function (el) { el.addEventListener('input', function () { clearError(el); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      var name = form.querySelector('[name="name"]'), phone = form.querySelector('[name="phone"]'), address = form.querySelector('[name="address"]');
      if (name && name.value.trim().length < 2) { setError(name, 'Enter your full name.'); ok = false; first = first || name; }
      if (phone) { var digits = phone.value.replace(/\D/g, ''); if (digits.length < 10 || digits.length > 11) { setError(phone, 'Enter a valid phone number.'); ok = false; first = first || phone; } }
      if (address && address.value.trim().length < 4) { setError(address, 'Enter the property address.'); ok = false; first = first || address; }
      /* Oct 17 (R1): every field is required, the email and the message too. */
      var email = form.querySelector('[name="email"]'), message = form.querySelector('[name="message"]');
      if (email) { var ev = email.value.trim(); if (!ev) { setError(email, 'Enter your email address.'); ok = false; first = first || email; } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ev)) { setError(email, 'Enter a valid email address.'); ok = false; first = first || email; } }
      if (message && !message.value.trim()) { setError(message, 'Tell us how we can help.'); ok = false; first = first || message; }
      if (!ok) { if (first) first.focus(); return; }
      var notice = form.querySelector('.q-form-thanks');
      if (!notice) {
        notice = document.createElement('div');
        notice.className = 'q-form-thanks'; notice.setAttribute('role', 'status'); notice.setAttribute('tabindex', '-1');
        form.appendChild(notice);
      }
      notice.innerHTML = '<strong>Online requests are not available yet.</strong><p>Your details have not been sent. Please call <a href="tel:+17184146067">' + PHONE + '</a> to discuss your project.</p>';
      notice.focus();
    });
  });
})();
