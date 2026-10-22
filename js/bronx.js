/* Royal Roofing Bronx: shared behaviour for every Bronx page.
   Adapted from js/brooklyn.js (header dropdowns, mobile drawer, placeholder
   links, estimate-form validation). The Brooklyn hero carousel is not used. */
(function () {
  'use strict';
  var PHONE = '718-395-5061';
  var TEL = 'tel:+17183955061';
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

/* Oct 19 2026 (Sean): FAQ accordions: opening one question closes the others. */
(function () {
  'use strict';
  var items = Array.prototype.slice.call(document.querySelectorAll('details.bx-faq__item'));
  items.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      items.forEach(function (o) { if (o !== d && o.open) o.open = false; });
    });
  });
})();
