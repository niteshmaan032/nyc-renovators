/* Royal Roofing & Siding NYC (Manhattan): shared behaviour for every Manhattan page.
   Copied from js/bronx.js (header dropdowns, mobile drawer, placeholder links,
   read-more toggles, estimate-form validation) with the Manhattan phone number. */
(function () {
  'use strict';
  var PHONE = '212-457-1331';
  var TEL = 'tel:+12124571331';
  var header = document.querySelector('.header');
  var menuButton = document.querySelector('.menu-btn');
  var drawer = document.getElementById('drawer');
  var desktop = window.matchMedia('(min-width: 88.01rem)');

  /* ---------- Header surface: solid white from the top ---------- */
  if (header) header.classList.add('is-scrolled');

  /* ---------- Homepage hero video: respect reduced motion ----------
     Reduced motion: no autoplay, nothing downloaded, and load() puts the
     element back on its poster frame (CSS also hides the video). */
  var heroVideo = document.querySelector('.bx-hero__video');
  if (heroVideo && window.matchMedia) {
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    var applyMotion = function () {
      if (calm.matches) {
        heroVideo.removeAttribute('autoplay');
        heroVideo.pause();
        heroVideo.preload = 'none';
        heroVideo.load();
      } else if (heroVideo.paused) {
        heroVideo.preload = 'auto';
        var attempt = heroVideo.play();
        if (attempt && typeof attempt.catch === 'function') attempt.catch(function () { /* autoplay blocked: the poster stands in */ });
      }
    };
    applyMotion();
    if (calm.addEventListener) calm.addEventListener('change', applyMotion); else if (calm.addListener) calm.addListener(applyMotion);
  }

  /* ---------- Homepage hero photo slider (manhattan.html only) ----------
     Crossfades .mh-shero__slide every 6 s. Stops on mouse hover, keyboard
     focus inside the hero, a hidden tab, and prefers-reduced-motion. Pages
     without .mh-shero skip this block entirely. The dots were removed on
     12 Oct (Sean); .mh-shero__dot buttons are still wired if they come back. */
  var shero = document.querySelector('.mh-shero');
  var sheroSlides = shero ? Array.prototype.slice.call(shero.querySelectorAll('.mh-shero__slide')) : [];
  var sheroDots = shero ? Array.prototype.slice.call(shero.querySelectorAll('.mh-shero__dot')) : [];
  if (shero && sheroSlides.length > 1 && (!sheroDots.length || sheroDots.length === sheroSlides.length) && window.matchMedia) {
    var sheroIndex = 0, sheroTimer = null, sheroHover = false;
    var sheroCalm = window.matchMedia('(prefers-reduced-motion: reduce)');
    var showShero = function (index) {
      sheroIndex = index;
      sheroSlides.forEach(function (slide, i) { slide.classList.toggle('is-active', i === index); });
      sheroDots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-pressed', String(i === index));
      });
    };
    var stopShero = function () { if (sheroTimer) { window.clearInterval(sheroTimer); sheroTimer = null; } };
    var startShero = function () {
      stopShero();
      if (sheroCalm.matches || document.hidden || sheroHover || shero.contains(document.activeElement)) return;
      sheroTimer = window.setInterval(function () { showShero((sheroIndex + 1) % sheroSlides.length); }, 6000);
    };
    sheroDots.forEach(function (dot, i) { dot.addEventListener('click', function () { showShero(i); startShero(); }); });
    shero.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { sheroHover = true; stopShero(); } });
    shero.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { sheroHover = false; startShero(); } });
    shero.addEventListener('focusin', stopShero);
    shero.addEventListener('focusout', function (e) { if (!shero.contains(e.relatedTarget)) startShero(); });
    document.addEventListener('visibilitychange', startShero);
    if (sheroCalm.addEventListener) sheroCalm.addEventListener('change', startShero); else if (sheroCalm.addListener) sheroCalm.addListener(startShero);
    startShero();
  }

  /* ---------- Mobile drawer ---------- */
  function closeDrawer() {
    if (!drawer) return;
    drawer.hidden = true;
    if (menuButton) { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open menu'); }
  }
  if (menuButton && drawer) {
    menuButton.addEventListener('click', function () {
      var open = drawer.hidden;
      drawer.hidden = !open;
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    drawer.querySelectorAll('.drawer__group').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
      });
    });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeDrawer); });
  }

  /* ---------- Desktop dropdowns: hover + click + keyboard ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.nav__item.has-menu'));
  function setOpen(item, open) {
    var btn = item.querySelector('.nav__link'), panel = item.querySelector('.dropdown');
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  }
  function closeAll(except) { items.forEach(function (it) { if (it !== except) setOpen(it, false); }); }
  items.forEach(function (item) {
    var btn = item.querySelector('.nav__link'), timer;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      closeAll(item);
      setOpen(item, !open);
    });
    item.addEventListener('mouseenter', function () { clearTimeout(timer); closeAll(item); setOpen(item, true); });
    item.addEventListener('mouseleave', function () { timer = setTimeout(function () { setOpen(item, false); }, 140); });
    item.addEventListener('focusout', function (e) { if (!item.contains(e.relatedTarget)) setOpen(item, false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); closeDrawer(); } });
  document.addEventListener('click', function (e) { if (header && !header.contains(e.target)) { closeAll(); closeDrawer(); } });
  var onChange = function () { closeAll(); closeDrawer(); };
  if (desktop.addEventListener) desktop.addEventListener('change', onChange); else desktop.addListener(onChange);

  /* ---------- Placeholder links (pages not built yet) ---------- */
  document.querySelectorAll('a[href="#"][data-href]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* ---------- Read more toggles (text stays in the DOM for SEO) ---------- */
  document.querySelectorAll('[data-clamp-toggle]').forEach(function (btn) {
    var scope = btn.closest('.card__body, .editorial__inner > div, .section') || document;
    var box = scope.querySelector('[data-clamp]');
    if (!box) return;
    btn.addEventListener('click', function () {
      var open = box.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Read less' : 'Read more';
    });
  });

  /* ---------- Forms: inline validation + thank-you ---------- */
  function setError(field, msg) {
    var wrap = field.closest('.field'); if (!wrap) return;
    var err = wrap.querySelector('.field-error');
    if (!err) { err = document.createElement('span'); err.className = 'field-error'; err.setAttribute('role', 'alert'); wrap.appendChild(err); }
    err.textContent = msg; wrap.classList.add('has-error'); field.setAttribute('aria-invalid', 'true');
  }
  function clearError(field) {
    var wrap = field.closest('.field'); if (!wrap) return;
    var err = wrap.querySelector('.field-error'); if (err) err.remove();
    wrap.classList.remove('has-error'); field.removeAttribute('aria-invalid');
  }
  document.querySelectorAll('form.quote-card').forEach(function (form) {
    form.querySelectorAll('input,textarea').forEach(function (el) { el.addEventListener('input', function () { clearError(el); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      var name = form.querySelector('[name="name"]'), phone = form.querySelector('[name="phone"]'), email = form.querySelector('[name="email"]'), address = form.querySelector('[name="address"]');
      if (name && name.value.trim().length < 2) { setError(name, 'Enter your full name.'); ok = false; first = first || name; }
      if (phone) { var digits = phone.value.replace(/\D/g, ''); if (digits.length < 10 || digits.length > 11) { setError(phone, 'Enter a valid phone number.'); ok = false; first = first || phone; } }
      if (email && !email.checkValidity()) { setError(email, 'Enter a valid email address.'); ok = false; first = first || email; }
      if (address && address.value.trim().length < 4) { setError(address, 'Enter the property address.'); ok = false; first = first || address; }
      /* Oct 19 (Sean): every field is required, the message too. */
      var message = form.querySelector('[name="message"]');
      if (message && !message.value.trim()) { setError(message, 'Tell us how we can help.'); ok = false; first = first || message; }
      if (!ok) { if (first) first.focus(); return; }
      var notice = form.querySelector('.form-thanks');
      if (!notice) {
        notice = document.createElement('div');
        notice.className = 'form-thanks'; notice.setAttribute('role', 'status'); notice.setAttribute('tabindex', '-1');
        form.appendChild(notice);
      }
      notice.innerHTML = '<strong>Online requests are not available yet.</strong><p>Your details have not been sent. Please call <a href="' + TEL + '">' + PHONE + '</a> to discuss your project.</p>';
      notice.focus();
    });
  });

})();
